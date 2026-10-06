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
exports.removePermissionsFromRole = exports.addPermissionsToRole = exports.getRoles = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const permission_model_1 = __importDefault(require("../models/permission.model"));
const getRoles = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roles_model_1.default.find()
            .populate("permissions")
            .sort({ roleName: 1 });
        return res.status(200).json({ roles });
    }
    catch (error) {
        console.error("Errore durante il recupero dei ruoli:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getRoles = getRoles;
const addPermissionsToRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permissionIds } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                message: "ID ruolo non valido.",
            });
        }
        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({
                message: "Devi specificare almeno un permissionId.",
            });
        }
        const uniquePermissionIds = [...new Set(permissionIds)];
        const invalidPermissionIds = uniquePermissionIds.filter((permissionId) => !mongoose_1.default.Types.ObjectId.isValid(permissionId));
        if (invalidPermissionIds.length > 0) {
            return res.status(400).json({
                message: "Uno o più permissionId non sono validi.",
                invalidPermissionIds,
            });
        }
        const role = yield roles_model_1.default.findById(roleId);
        if (!role) {
            return res.status(404).json({
                message: "Ruolo non trovato.",
            });
        }
        const permissions = yield permission_model_1.default.find({
            _id: {
                $in: uniquePermissionIds,
            },
        });
        if (permissions.length !== uniquePermissionIds.length) {
            return res.status(404).json({
                message: "Uno o più permessi non esistono.",
            });
        }
        const updatedRole = yield roles_model_1.default.findByIdAndUpdate(roleId, {
            $addToSet: {
                permissions: {
                    $each: uniquePermissionIds.map((permissionId) => new mongoose_1.default.Types.ObjectId(permissionId)),
                },
            },
        }, {
            new: true,
        }).populate("permissions");
        return res.status(200).json({
            message: "Permessi associati correttamente.",
            role: updatedRole,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.addPermissionsToRole = addPermissionsToRole;
const removePermissionsFromRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permissionIds } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                message: "ID ruolo non valido.",
            });
        }
        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({
                message: "Devi specificare almeno un permissionId.",
            });
        }
        const uniquePermissionIds = [...new Set(permissionIds)];
        const invalidPermissionIds = uniquePermissionIds.filter((permissionId) => !mongoose_1.default.Types.ObjectId.isValid(permissionId));
        if (invalidPermissionIds.length > 0) {
            return res.status(400).json({
                message: "Uno o più permissionId non sono validi.",
                invalidPermissionIds,
            });
        }
        const role = yield roles_model_1.default.findById(roleId);
        if (!role) {
            return res.status(404).json({
                message: "Ruolo non trovato.",
            });
        }
        const updatedRole = yield roles_model_1.default.findByIdAndUpdate(roleId, {
            $pull: {
                permissions: {
                    $in: uniquePermissionIds.map((permissionId) => new mongoose_1.default.Types.ObjectId(permissionId)),
                },
            },
        }, {
            new: true,
        }).populate("permissions");
        return res.status(200).json({
            message: "Permessi dissociati correttamente.",
            role: updatedRole,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.removePermissionsFromRole = removePermissionsFromRole;
