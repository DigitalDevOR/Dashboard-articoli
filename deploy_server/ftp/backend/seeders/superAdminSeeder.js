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
exports.seedSuperAdmin = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const existingSuperAdmin = yield user_model_1.default.findOne({ email });
    if (existingSuperAdmin) {
        if (!existingSuperAdmin.isSuperAdmin || !existingSuperAdmin.isActive) {
            existingSuperAdmin.isSuperAdmin = true;
            existingSuperAdmin.isActive = true;
            yield existingSuperAdmin.save();
        }
        return existingSuperAdmin;
    }
    return user_model_1.default.create({
        nome: process.env.ADMIN_FIRST_NAME || 'Super',
        cognome: process.env.ADMIN_LAST_NAME || 'Admin',
        email,
        password,
        isSuperAdmin: true,
        siteAccess: [],
        isActive: true,
    });
});
exports.seedSuperAdmin = seedSuperAdmin;
