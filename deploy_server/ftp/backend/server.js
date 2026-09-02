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
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const permissionsAndRolesSeeder_1 = require("./seeders/permissionsAndRolesSeeder");
const superAdminSeeder_1 = require("./seeders/superAdminSeeder");
dotenv_1.default.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const PORT = process.env.PORT || 2567;
    yield (0, permissionsAndRolesSeeder_1.seedPermissionsAndRoles)();
    yield (0, superAdminSeeder_1.seedSuperAdmin)();
    app_1.default.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}))();
