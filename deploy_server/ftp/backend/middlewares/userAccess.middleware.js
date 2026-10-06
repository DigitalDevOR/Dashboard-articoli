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
exports.authorizeUserDeletion = exports.authorizeUserUpdate = exports.authorizeUserCreation = exports.authorizeUserRead = exports.authorizePermission = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const permission_model_1 = __importDefault(require("../models/permission.model"));
function isRole(role, roleName, roleId) {
    if (typeof role === "string")
        return role === roleName || role === roleId;
    return Boolean(role && typeof role === "object" && "roleName" in role && role.roleName === roleName);
}
function getManagedSiteId(user) {
    var _a;
    const access = user.siteAccess;
    return access && ((_a = access.role) === null || _a === void 0 ? void 0 : _a.isActive) && access.role.roleName === "Admin" ? access.siteId.toString() : null;
}
function getEditorRole() {
    return __awaiter(this, void 0, void 0, function* () {
        return roles_model_1.default.findOne({ roleName: "Editor", isActive: true });
    });
}
function hasPermission(user, permissionName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const roleId = (_c = (_b = (_a = user.siteAccess) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b._id) !== null && _c !== void 0 ? _c : (_d = user.siteAccess) === null || _d === void 0 ? void 0 : _d.role;
        if (!roleId) {
            return false;
        }
        const role = yield roles_model_1.default.findById(roleId).populate("permissions");
        const hasRolePermission = (role === null || role === void 0 ? void 0 : role.isActive) === true && role.permissions.some((permission) => permission.name === permissionName && permission.isActive) === true;
        if (hasRolePermission) {
            return true;
        }
        const additionalPermissions = yield permission_model_1.default.find({
            _id: { $in: (_f = (_e = user.siteAccess) === null || _e === void 0 ? void 0 : _e.additionalPermissions) !== null && _f !== void 0 ? _f : [] },
            isActive: true,
        });
        return additionalPermissions.some((permission) => permission.name === permissionName);
    });
}
const authorizePermission = (permissionName) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub).populate("siteAccess.role");
        if (!user) {
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        }
        if (user.isSuperAdmin) {
            return next();
        }
        if (!(yield hasPermission(user, permissionName))) {
            return res.status(403).json({ message: `Permesso richiesto: ${permissionName}.` });
        }
        const requestedSiteId = req.params.siteId;
        if (requestedSiteId && ((_b = user.siteAccess) === null || _b === void 0 ? void 0 : _b.siteId.toString()) !== requestedSiteId) {
            return res.status(403).json({ message: "Non sei autorizzato a operare su questo sito." });
        }
        return next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.authorizePermission = authorizePermission;
const authorizeUserRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authenticatedUser = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub)
            .populate("siteAccess.role");
        if (!authenticatedUser) {
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        }
        if (authenticatedUser.isSuperAdmin || (yield hasPermission(authenticatedUser, "user:read"))) {
            return next();
        }
        return res.status(403).json({ message: "Non sei autorizzato a leggere gli utenti." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.authorizeUserRead = authorizeUserRead;
const authorizeUserCreation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authenticatedUser = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub).populate("siteAccess.role");
        if (!authenticatedUser)
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (authenticatedUser.isSuperAdmin)
            return next();
        if (!(yield hasPermission(authenticatedUser, "user:create"))) {
            return res.status(403).json({ message: "Non sei autorizzato a creare utenti." });
        }
        const managedSiteId = getManagedSiteId(authenticatedUser);
        const access = req.body.siteAccess;
        const editorRole = yield getEditorRole();
        if (!managedSiteId || !access || Array.isArray(access) || !editorRole || access.siteId.toString() !== managedSiteId || !isRole(access.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Un Admin può creare solo utenti Editor del proprio sito." });
        }
        return next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.authorizeUserCreation = authorizeUserCreation;
const authorizeUserUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authenticatedUser = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub).populate("siteAccess.role");
        const targetUser = yield user_model_1.default.findById(req.body.userId).populate("siteAccess.role");
        if (!authenticatedUser)
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (!targetUser)
            return res.status(404).json({ message: "Utente da aggiornare non trovato." });
        if (authenticatedUser.isSuperAdmin)
            return next();
        if (!(yield hasPermission(authenticatedUser, "user:update"))) {
            return res.status(403).json({ message: "Non sei autorizzato a modificare utenti." });
        }
        const managedSiteId = getManagedSiteId(authenticatedUser);
        const editorRole = yield getEditorRole();
        const targetAccess = targetUser.siteAccess;
        if (!managedSiteId || !targetAccess || targetAccess.siteId.toString() !== managedSiteId || !editorRole || !isRole(targetAccess.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Puoi modificare solo gli utenti Editor del tuo sito." });
        }
        const newAccess = req.body.siteAccess;
        if (newAccess && (Array.isArray(newAccess) || newAccess.siteId.toString() !== managedSiteId || !isRole(newAccess.role, "Editor", editorRole._id.toString()))) {
            return res.status(403).json({ message: "Puoi mantenere solo un accesso Editor al tuo sito." });
        }
        return next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.authorizeUserUpdate = authorizeUserUpdate;
const authorizeUserDeletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const authenticatedUser = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub).populate("siteAccess.role");
        const targetUser = yield user_model_1.default.findById(req.params.userId).populate("siteAccess.role");
        if (!authenticatedUser)
            return res.status(401).json({ message: "Utente autenticato non trovato." });
        if (!targetUser)
            return res.status(404).json({ message: "Utente da eliminare non trovato." });
        if (authenticatedUser.isSuperAdmin)
            return next();
        if (!(yield hasPermission(authenticatedUser, "user:delete"))) {
            return res.status(403).json({ message: "Non sei autorizzato a eliminare utenti." });
        }
        const managedSiteId = getManagedSiteId(authenticatedUser);
        const editorRole = yield getEditorRole();
        const targetAccess = targetUser.siteAccess;
        if (targetUser.isSuperAdmin || !managedSiteId || !targetAccess || targetAccess.siteId.toString() !== managedSiteId || !editorRole || !isRole(targetAccess.role, "Editor", editorRole._id.toString())) {
            return res.status(403).json({ message: "Puoi eliminare solo gli utenti Editor del tuo sito." });
        }
        if (targetUser._id.toString() === ((_b = req.userDecoded) === null || _b === void 0 ? void 0 : _b.sub))
            return res.status(400).json({ message: "Non puoi eliminare il tuo stesso account." });
        return next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Errore interno del server." });
    }
});
exports.authorizeUserDeletion = authorizeUserDeletion;
