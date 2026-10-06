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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const permissionsAndRolesSeeder_1 = require("./seeders/permissionsAndRolesSeeder");
const superAdminSeeder_1 = require("./seeders/superAdminSeeder");
const mockDataPostSeeder_1 = require("./seeders/mockDataPostSeeder");
const article_worker_1 = require("./workers/article.worker");
const vectorSearchIndexesSeeder_1 = require("./seeders/vectorSearchIndexesSeeder");
dotenv_1.default.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const PORT = process.env.PORT || 2567;
    const MONGODB_URI = process.env.MONGODB_URI;
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI non definita");
        }
        console.log("Connessione a MongoDB...");
        yield mongoose_1.default.connect(MONGODB_URI);
        console.log("MongoDB connesso");
        /* Seeders */
        yield (0, permissionsAndRolesSeeder_1.seedPermissionsAndRoles)();
        yield (0, superAdminSeeder_1.seedSuperAdmin)();
        yield (0, mockDataPostSeeder_1.seedMockDataPosts)();
        yield (0, vectorSearchIndexesSeeder_1.seedVectorSearchIndexes)();
        /* Redis worker */
        (0, article_worker_1.startArticleWorker)();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Errore durante l'avvio del server:", error);
        process.exit(1);
    }
}))();
