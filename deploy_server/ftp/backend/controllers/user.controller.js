"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserEmail = exports.updateUserPassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
function normalizeSiteAccess(siteAccess) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!siteAccess || Array.isArray(siteAccess)) {
            throw new Error("È possibile associare un solo siteAccess per utente.");
        }
        const access = siteAccess;
        if (!mongoose_1.default.Types.ObjectId.isValid(access.siteId)) {
            throw new Error("ID sito non valido.");
        }
        const role = mongoose_1.default.Types.ObjectId.isValid(access.role)
            ? yield roles_model_1.default.findById(access.role)
            : yield roles_model_1.default.findOne({ roleName: access.role, isActive: true });
        if (!role) {
            throw new Error(`Ruolo non valido: ${access.role}`);
        }
        const permissionIds = ((_a = access.additionalPermissions) !== null && _a !== void 0 ? _a : []).map((permissionId) => {
            if (!mongoose_1.default.Types.ObjectId.isValid(permissionId)) {
                throw new Error("ID permesso non valido.");
            }
            return new mongoose_1.default.Types.ObjectId(permissionId);
        });
        return {
            siteId: new mongoose_1.default.Types.ObjectId(access.siteId),
            role: role._id,
            additionalPermissions: permissionIds,
        };
    });
}
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId) {
            return res.status(401).json({
                message: "Accesso negato. Token mancante o non valido.",
            });
        }
        const requestingUser = yield user_model_1.default.findById(userId)
            .select("isSuperAdmin siteAccess")
            .populate("siteAccess.role");
        if (!requestingUser) {
            return res.status(404).json({
                message: "Utente non trovato.",
            });
        }
        let usersFilter = {};
        if (!requestingUser.isSuperAdmin) {
            const adminSiteIds = ((_b = requestingUser.siteAccess) === null || _b === void 0 ? void 0 : _b.role) &&
                typeof requestingUser.siteAccess.role !== "string" &&
                requestingUser.siteAccess.role.roleName === "Admin" &&
                requestingUser.siteAccess.role.isActive
                ? [requestingUser.siteAccess.siteId]
                : [];
            const editorRole = yield roles_model_1.default.findOne({ roleName: "Editor", isActive: true }).select("_id");
            usersFilter = editorRole && adminSiteIds.length > 0
                ? {
                    "siteAccess.siteId": { $in: adminSiteIds },
                    "siteAccess.role": editorRole._id,
                }
                : { _id: { $exists: false } };
        }
        const users = yield user_model_1.default.find(usersFilter)
            .select("-password")
            .populate("siteAccess.siteId")
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions")
            .sort({ cognome: 1, nome: 1 });
        return res.status(200).json({ users });
    }
    catch (error) {
        console.error("Errore durante il recupero degli utenti:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getUsers = getUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nome, cognome, email, password, isActive = true, siteAccess, } = req.body;
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
        const existingUser = yield user_model_1.default.findOne({
            email: normalizedEmail,
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Esiste già un utente con questa email.",
            });
        }
        const normalizedSiteAccess = siteAccess
            ? yield normalizeSiteAccess(siteAccess)
            : undefined;
        const newUser = new user_model_1.default(Object.assign({ nome: nome.trim(), cognome: cognome.trim(), email: normalizedEmail, password, isSuperAdmin: false, isActive }, (normalizedSiteAccess ? { siteAccess: normalizedSiteAccess } : {})));
        yield newUser.save();
        const createdUser = yield user_model_1.default.findById(newUser._id)
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions");
        return res.status(201).json({
            message: "Utente creato con successo.",
            user: createdUser,
        });
    }
    catch (error) {
        console.error("Errore createUser:", error);
        if (error instanceof Error && (error.message.startsWith("ID ") || error.message.startsWith("Ruolo "))) {
            return res.status(400).json({ message: error.message });
        }
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: "Esiste già un utente con questa email.",
            });
        }
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, nome, cognome, email, password, isActive, siteAccess, } = req.body;
        // 1. Controllo presenza userId
        if (!userId) {
            return res.status(400).json({
                message: "L'id dell'utente da aggiornare è richiesto.",
            });
        }
        // 2. Recupero l'utente
        const user = yield user_model_1.default.findById(userId);
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
            const existingUser = yield user_model_1.default.findOne({
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
            user.siteAccess = yield normalizeSiteAccess(siteAccess);
        }
        // 5. Salvataggio
        yield user.save();
        // 6. Recupero l'utente aggiornato con i riferimenti popolati
        const updatedUser = yield user_model_1.default.findById(user._id)
            .populate("siteAccess.siteId")
            .populate("siteAccess.role")
            .populate("siteAccess.additionalPermissions");
        return res.status(200).json({
            message: "Utente aggiornato correttamente.",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);
        if (error instanceof Error && (error.message.startsWith("ID ") || error.message.startsWith("Ruolo "))) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utente non valido." });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utente non trovato." });
        }
        if (user._id.toString() === ((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub)) {
            return res.status(400).json({ message: "Non puoi eliminare il tuo stesso account." });
        }
        yield user_model_1.default.deleteOne({ _id: user._id });
        return res.status(200).json({ message: "Utente eliminato correttamente." });
    }
    catch (error) {
        console.error("Errore durante l'eliminazione dell'utente:", error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.deleteUser = deleteUser;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userDecoded = req.userDecoded;
    if (!userDecoded) {
        return res.status(401).json({
            message: "Accesso negato. Token mancante o non valido.",
        });
    }
    const userId = userDecoded.sub;
    const oldPassword = req.body.oldPassword;
    const password = req.body.password;
    const userByToken = yield user_model_1.default.findById(userId).select("+password");
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
    const isOldPasswordValid = yield bcryptjs_1.default.compare(oldPassword, userByToken.password);
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
    yield userByToken.save();
    return res.status(200).json({
        message: "Password aggiornata correttamente.",
    });
});
exports.updateUserPassword = updateUserPassword;
const updateUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const userByToken = yield user_model_1.default.findById(userId);
    if (!userByToken) {
        return res.status(404).json({
            message: "Utente non trovato.",
        });
    }
    userByToken.email = newEmail;
    yield userByToken.save();
    return res.status(200).json({
        message: "Email aggiornata correttamente.",
    });
});
exports.updateUserEmail = updateUserEmail;
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
