import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import Role from "../models/roles.model";
import type { CreateUserRequest, UpdateUserRequest } from "../types/express.types";
import { RequestWithAccessToken } from "../types/express.types";

async function normalizeSiteAccess(siteAccess: NonNullable<CreateUserRequest["body"]["siteAccess"]>) {
    if (!siteAccess || Array.isArray(siteAccess)) {
        throw new Error("È possibile associare un solo siteAccess per utente.");
    }

    const access = siteAccess;
        if (!mongoose.Types.ObjectId.isValid(access.siteId)) {
            throw new Error("ID sito non valido.");
        }

        const role = mongoose.Types.ObjectId.isValid(access.role)
            ? await Role.findById(access.role)
            : await Role.findOne({ roleName: access.role, isActive: true });

        if (!role) {
            throw new Error(`Ruolo non valido: ${access.role}`);
        }

        const permissionIds = (access.additionalPermissions ?? []).map((permissionId) => {
            if (!mongoose.Types.ObjectId.isValid(permissionId)) {
                throw new Error("ID permesso non valido.");
            }

            return new mongoose.Types.ObjectId(permissionId);
        });

    return {
        siteId: new mongoose.Types.ObjectId(access.siteId),
        role: role._id,
        additionalPermissions: permissionIds,
    };
}

export const getUsers = async (req: RequestWithAccessToken, res: Response) => {
    try {
        const userId = req.userDecoded?.sub;

        if (!userId) {
            return res.status(401).json({
                message: "Accesso negato. Token mancante o non valido.",
            });
        }

        const requestingUser = await User.findById(userId)
            .select("isSuperAdmin siteAccess")
            .populate("siteAccess.role") as any;

        if (!requestingUser) {
            return res.status(404).json({
                message: "Utente non trovato.",
            });
        }

        let usersFilter = {};

        if (!requestingUser.isSuperAdmin) {
            const adminSiteIds = requestingUser.siteAccess?.role &&
                typeof requestingUser.siteAccess.role !== "string" &&
                requestingUser.siteAccess.role.roleName === "Admin" &&
                requestingUser.siteAccess.role.isActive
                ? [requestingUser.siteAccess.siteId]
                : [];
            const editorRole = await Role.findOne({ roleName: "Editor", isActive: true }).select("_id");

            usersFilter = editorRole && adminSiteIds.length > 0
                ? {
                    "siteAccess.siteId": { $in: adminSiteIds },
                    "siteAccess.role": editorRole._id,
                }
                : { _id: { $exists: false } };
        }

        const users = await User.find(usersFilter)
            .select("-password")
            .populate("siteAccess.siteId")
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions")
            .sort({ cognome: 1, nome: 1 });

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Errore durante il recupero degli utenti:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};

export const createUser = async (
    req: CreateUserRequest,
    res: Response
) => {
    try {
        const {
            nome,
            cognome,
            email,
            password,
            isActive = true,
            siteAccess,
        } = req.body;

        if (!nome || !cognome || !email || !password) {
            return res.status(400).json({
                message: "Nome, cognome, email e password sono obbligatori.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "La password deve essere lunga almeno 8 caratteri.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Esiste già un utente con questa email.",
            });
        }

        const normalizedSiteAccess = siteAccess
            ? await normalizeSiteAccess(siteAccess)
            : undefined;

        const newUser = new User({
            nome: nome.trim(),
            cognome: cognome.trim(),
            email: normalizedEmail,
            password,
            isSuperAdmin: false,
            isActive,
            ...(normalizedSiteAccess ? { siteAccess: normalizedSiteAccess } : {}),
        });

        await newUser.save();

        const createdUser = await User.findById(newUser._id)
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions");

        return res.status(201).json({
            message: "Utente creato con successo.",
            user: createdUser,
        });

    } catch (error: any) {
        console.error("Errore createUser:", error);

        if (error instanceof Error && (error.message.startsWith("ID ") || error.message.startsWith("Ruolo "))) {
            return res.status(400).json({ message: error.message });
        }

        if (error?.code === 11000) {
            return res.status(409).json({
                message: "Esiste già un utente con questa email.",
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};

export const updateUser = async (
    req: UpdateUserRequest,
    res: Response
) => {
    try {
        const {
            userId,
            nome,
            cognome,
            email,
            password,
            isActive,
            siteAccess,
        } = req.body;

        // 1. Controllo presenza userId
        if (!userId) {
            return res.status(400).json({
                message: "L'id dell'utente da aggiornare è richiesto.",
            });
        }

        // 2. Recupero l'utente
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "Utente non trovato.",
            });
        }

        // 3. Aggiorno solamente i campi realmente presenti nella request
        if (nome !== undefined) {
            user.nome = nome;
        }

        if (cognome !== undefined) {
            user.cognome = cognome;
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id },
            });

            if (existingUser) {
                return res.status(409).json({ message: "Esiste già un utente con questa email." });
            }

            user.email = normalizedEmail;
        }

        if (password !== undefined) {
            if (password.length < 8) {
                return res.status(400).json({ message: "La password deve essere lunga almeno 8 caratteri." });
            }

            user.password = password;
        }

        if (isActive !== undefined) {
            user.isActive = isActive;
        }

        // La modifica invia l'elenco completo degli accessi desiderati.
        if (siteAccess !== undefined) {
            user.siteAccess = await normalizeSiteAccess(siteAccess);
        }

        // 5. Salvataggio
        await user.save();

        // 6. Recupero l'utente aggiornato con i riferimenti popolati
        const updatedUser = await User.findById(user._id)
            .populate("siteAccess.siteId")
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions");

        return res.status(200).json({
            message: "Utente aggiornato correttamente.",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);

        if (error instanceof Error && (error.message.startsWith("ID ") || error.message.startsWith("Ruolo "))) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};

export const deleteUser = async (
    req: RequestWithAccessToken,
    res: Response,
) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utente non valido." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utente non trovato." });
        }

        if (user._id.toString() === req.userDecoded?.sub) {
            return res.status(400).json({ message: "Non puoi eliminare il tuo stesso account." });
        }

        await User.deleteOne({ _id: user._id });

        return res.status(200).json({ message: "Utente eliminato correttamente." });
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'utente:", error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

export const updateUserPassword = async (
    req: RequestWithAccessToken,
    res: Response
) => {
    const userDecoded = req.userDecoded;

    if (!userDecoded) {
        return res.status(401).json({
            message: "Accesso negato. Token mancante o non valido.",
        });
    }

    const userId = userDecoded.sub;
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;

    const userByToken = await User.findById(userId).select("+password");

    if (!userByToken) {
        return res.status(404).json({
            message: "Utente non trovato.",
        });
    }

    if (!oldPassword) {
        return res.status(400).json({
            message: "La password attuale è obbligatoria.",
        });
    }

    const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        userByToken.password,
    );

    if (!isOldPasswordValid) {
        return res.status(400).json({
            message: "La password attuale non è corretta.",
        });
    }

    if (!password) {
        return res.status(400).json({
            message: "La password è obbligatoria.",
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "La password deve essere lunga almeno 8 caratteri.",
        });
    }

    userByToken.password = password;

    await userByToken.save();

    return res.status(200).json({
        message: "Password aggiornata correttamente.",
    });
};

export const updateUserEmail = async (
    req: RequestWithAccessToken,
    res: Response
) => {
    const userDecoded = req.userDecoded;
    if (!userDecoded) {
        return res.status(401).json({
            message: "Accesso negato. Token mancante o non valido.",
        });
    }

    const userId = userDecoded.sub;
    const newEmail = req.body.email;

    if (!newEmail) {
        return res.status(400).json({
            message: "La nuova email è obbligatoria.",
        });
    }

    const userByToken = await User.findById(userId);

    if (!userByToken) {
        return res.status(404).json({
            message: "Utente non trovato.",
        });
    }

    userByToken.email = newEmail;

    await userByToken.save();

    return res.status(200).json({
        message: "Email aggiornata correttamente.",
    });
};

/*
    {
        "userId": "68bd4f4c9a12e34567890123",
        "nome": "Mario",
        "cognome": "Rossi",
        "isActive": true,
        "siteAccess": [
            {
                "siteId": "68bd50129a12e34567890124",
                "role": "68bd50789a12e34567890125",
                "additionalPermissions": [
                    "68bd50c19a12e34567890126",
                    "68bd50d59a12e34567890127"
                ]
            },
            {
                "siteId": "68bd51239a12e34567890128",
                "role": "68bd50789a12e34567890125",
                "additionalPermissions": [
                    "68bd51889a12e34567890129",
                    "68bd51d49a12e34567890130"
                ]
            }
        ]
    }
*/