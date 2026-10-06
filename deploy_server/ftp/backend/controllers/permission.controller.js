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
exports.getPermissionById = exports.getPermissions = void 0;
const permission_model_1 = __importDefault(require("../models/permission.model"));
/**
 * READ ALL
 * Recupera tutti i permessi
 */
const getPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = yield permission_model_1.default.find()
            .sort({
            category: 1,
            name: 1,
        });
        return res.status(200).json({
            permissions,
        });
    }
    catch (error) {
        console.error("Errore durante il recupero dei permessi:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getPermissions = getPermissions;
/**
 * READ ONE
 * Recupera un singolo permesso tramite id
 */
const getPermissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { permissionId } = req.params;
        const permission = yield permission_model_1.default.findById(permissionId);
        if (!permission) {
            return res.status(404).json({
                message: "Permesso non trovato.",
            });
        }
        return res.status(200).json({
            permission,
        });
    }
    catch (error) {
        console.error("Errore durante il recupero del permesso:", error);
        if ((error === null || error === void 0 ? void 0 : error.name) === "CastError") {
            return res.status(400).json({
                message: "ID permesso non valido.",
            });
        }
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getPermissionById = getPermissionById;
