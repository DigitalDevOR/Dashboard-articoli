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
exports.seedPermissionsAndRoles = void 0;
const permission_model_1 = __importDefault(require("../models/permission.model"));
const roles_model_1 = __importDefault(require("../models/roles.model"));
const basePermissions = [
    { name: 'site:create', label: 'Crea sito', category: 'site', description: 'Permette di creare un sito WordPress' },
    { name: 'site:update', label: 'Modifica sito', category: 'site', description: 'Permette di modificare un sito WordPress' },
    { name: 'site:delete', label: 'Elimina sito', category: 'site', description: 'Permette di eliminare un sito WordPress' },
    { name: 'site:read', label: 'Leggi sito', category: 'site', description: 'Permette di leggere i dettagli di un sito WordPress' },
    { name: 'user:create', label: 'Crea utente', category: 'user', description: 'Permette di creare un nuovo utente' },
    { name: 'user:update', label: 'Modifica utente', category: 'user', description: 'Permette di modificare un utente' },
    { name: 'user:delete', label: 'Elimina utente', category: 'user', description: 'Permette di eliminare un utente' },
    { name: 'user:read', label: 'Leggi utente', category: 'user', description: 'Permette di leggere i dettagli di un utente' },
    { name: 'permission:assign', label: 'Assegna permessi', category: 'permission', description: 'Permette di assegnare permessi a utenti e siti' },
    { name: 'post:create', label: 'Crea post', category: 'post', description: 'Permette di creare un post WordPress' },
    { name: 'post:read', label: 'Leggi post', category: 'post', description: 'Permette di leggere i post WordPress' },
    { name: 'post:update', label: 'Modifica post', category: 'post', description: 'Permette di modificare un post WordPress' },
    { name: 'post:delete', label: 'Elimina post', category: 'post', description: 'Permette di eliminare un post WordPress' },
    { name: 'post:publish', label: 'Pubblica post', category: 'post', description: 'Permette di pubblicare un post WordPress' },
];
const roleTemplates = {
    Admin: {
        description: 'Gestione utenti e contenuti per i siti assegnati',
        permissions: [
            'site:read',
            'site:update',
            'user:create',
            'user:update',
            'user:delete',
            'user:read',
            'post:create',
            'post:read',
            'post:update',
            'post:delete',
            'post:publish',
        ],
    },
    Editor: {
        description: 'Gestione contenuti per i siti assegnati',
        permissions: [
            'site:read',
            'post:create',
            'post:read',
            'post:update',
            'post:delete',
            'post:publish',
        ],
    },
};
const seedPermissionsAndRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    const permissionMap = {};
    for (const permission of basePermissions) {
        const existingPermission = yield permission_model_1.default.findOne({ name: permission.name });
        if (!existingPermission) {
            const newPermission = yield permission_model_1.default.create(permission);
            permissionMap[permission.name] = newPermission._id;
        }
        else {
            permissionMap[permission.name] = existingPermission._id;
        }
    }
    for (const [roleName, config] of Object.entries(roleTemplates)) {
        const permissionIds = config.permissions.map((permissionName) => permissionMap[permissionName]);
        yield roles_model_1.default.findOneAndUpdate({ roleName }, {
            roleName,
            description: config.description,
            permissions: permissionIds,
            isActive: true,
        }, { upsert: true, new: true });
    }
    return {
        createdPermissions: Object.keys(permissionMap).length,
        createdRoles: Object.keys(roleTemplates).length,
    };
});
exports.seedPermissionsAndRoles = seedPermissionsAndRoles;
