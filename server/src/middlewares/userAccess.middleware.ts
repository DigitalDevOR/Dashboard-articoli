import { Response, NextFunction } from "express";
import User from "../models/user.model";
import Role from "../models/roles.model";
import Permission from "../models/permission.model";
import { CreateUserRequest, RequestWithAccessToken, UpdateUserRequest } from "../types/express.types";

function isRole(role: unknown, roleName: string, roleId?: string) {
    if (typeof role === "string") return role === roleName || role === roleId;
    return Boolean(role && typeof role === "object" && "roleName" in role && role.roleName === roleName);
}

function getManagedSiteId(user: any) {
    const access = user.siteAccess;
    return access && access.role?.isActive && access.role.roleName === "Admin" ? access.siteId.toString() : null;
}

async function getEditorRole() {
    return Role.findOne({ roleName: "Editor", isActive: true });
}

async function hasPermission(user: any, permissionName: string) {
    const roleId = user.siteAccess?.role?._id ?? user.siteAccess?.role;
    if (!roleId) {
        return false;
    }

    const role = await Role.findById(roleId).populate("permissions");
    const hasRolePermission = role?.isActive === true && role.permissions.some(
        (permission: any) => permission.name === permissionName && permission.isActive,
    ) === true;

    if (hasRolePermission) {
        return true;
    }

    const additionalPermissions = await Permission.find({
        _id: { $in: user.siteAccess?.additionalPermissions ?? [] },
        isActive: true,
    });

    return additionalPermissions.some((permission) => permission.name === permissionName);
}

export const authorizePermission = (permissionName: string) => async (
    req: RequestWithAccessToken,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await User.findById(req.userDecoded?.sub).populate("siteAccess.role");

        if (!user) {
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        }

        if (user.isSuperAdmin) {
            return next();
        }

        if (!await hasPermission(user, permissionName)) {
            return res.status(403).json({ message: `Permesso richiesto: ${permissionName}.` });
        }

        const requestedSiteId = req.params.siteId;
        if (requestedSiteId && user.siteAccess?.siteId.toString() !== requestedSiteId) {
            return res.status(403).json({ message: "Non sei autorizzato a operare su questo sito." });
        }

        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

export const authorizeUserRead = async (
    req: RequestWithAccessToken,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authenticatedUser = await User.findById(req.userDecoded?.sub)
            .populate("siteAccess.role");

        if (!authenticatedUser) {
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        }

        if (authenticatedUser.isSuperAdmin || await hasPermission(authenticatedUser, "user:read")) {
            return next();
        }

        return res.status(403).json({ message: "Non sei autorizzato a leggere gli utenti." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

export const authorizeUserCreation = async (req: CreateUserRequest, res: Response, next: NextFunction) => {
    try {
        const authenticatedUser = await User.findById(req.userDecoded?.sub).populate("siteAccess.role");
        if (!authenticatedUser) return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (authenticatedUser.isSuperAdmin) return next();

        if (!await hasPermission(authenticatedUser, "user:create")) {
            return res.status(403).json({ message: "Non sei autorizzato a creare utenti." });
        }

        const managedSiteId = getManagedSiteId(authenticatedUser);
        const access = req.body.siteAccess;
        const editorRole = await getEditorRole();
        if (!managedSiteId || !access || Array.isArray(access) || !editorRole || access.siteId.toString() !== managedSiteId || !isRole(access.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Un Admin può creare solo utenti Editor del proprio sito." });
        }
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

export const authorizeUserUpdate = async (req: UpdateUserRequest, res: Response, next: NextFunction) => {
    try {
        const authenticatedUser = await User.findById(req.userDecoded?.sub).populate("siteAccess.role");
        const targetUser = await User.findById(req.body.userId).populate("siteAccess.role");
        if (!authenticatedUser) return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (!targetUser) return res.status(404).json({ message: "Utente da aggiornare non trovato." });
        if (authenticatedUser.isSuperAdmin) return next();

        if (!await hasPermission(authenticatedUser, "user:update")) {
            return res.status(403).json({ message: "Non sei autorizzato a modificare utenti." });
        }

        const managedSiteId = getManagedSiteId(authenticatedUser);
        const editorRole = await getEditorRole();
        const targetAccess = targetUser.siteAccess;
        if (!managedSiteId || !targetAccess || targetAccess.siteId.toString() !== managedSiteId || !editorRole || !isRole(targetAccess.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Puoi modificare solo gli utenti Editor del tuo sito." });
        }

        const newAccess = req.body.siteAccess;
        if (newAccess && (Array.isArray(newAccess) || newAccess.siteId.toString() !== managedSiteId || !isRole(newAccess.role, "Editor", editorRole._id.toString()))) {
            return res.status(403).json({ message: "Puoi mantenere solo un accesso Editor al tuo sito." });
        }
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};

export const authorizeUserDeletion = async (req: RequestWithAccessToken, res: Response, next: NextFunction) => {
    try {
        const authenticatedUser = await User.findById(req.userDecoded?.sub).populate("siteAccess.role");
        const targetUser = await User.findById(req.params.userId).populate("siteAccess.role");
        if (!authenticatedUser) return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (!targetUser) return res.status(404).json({ message: "Utente da eliminare non trovato." });
        if (authenticatedUser.isSuperAdmin) return next();

        if (!await hasPermission(authenticatedUser, "user:delete")) {
            return res.status(403).json({ message: "Non sei autorizzato a eliminare utenti." });
        }

        const managedSiteId = getManagedSiteId(authenticatedUser);
        const editorRole = await getEditorRole();
        const targetAccess = targetUser.siteAccess;
        if (targetUser.isSuperAdmin || !managedSiteId || !targetAccess || targetAccess.siteId.toString() !== managedSiteId || !editorRole || !isRole(targetAccess.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Puoi eliminare solo gli utenti Editor del tuo sito." });
        }
        if (targetUser._id.toString() === req.userDecoded?.sub) return res.status(400).json({ message: "Non puoi eliminare il tuo stesso account." });
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
};
