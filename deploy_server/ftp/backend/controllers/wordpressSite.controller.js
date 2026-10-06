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
exports.deleteWordpressSite = exports.updateWordpressSite = exports.getWordpressSiteById = exports.getWordpressSites = exports.createWordpressSite = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wordpressSite_model_1 = __importDefault(require("../models/wordpressSite.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createWordpressSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, wpUrl, username, appPasswordEncrypted, enabled = true, } = req.body;
        if (!name ||
            !wpUrl ||
            !username ||
            !appPasswordEncrypted) {
            return res.status(400).json({
                message: "name, wpUrl, username e appPasswordEncrypted sono obbligatori.",
            });
        }
        const existingSite = yield wordpressSite_model_1.default.findOne({
            name: name.trim(),
            wpUrl: wpUrl.trim(),
        });
        if (existingSite) {
            return res.status(409).json({
                message: "Esiste già un sito WordPress con questo nome e URL.",
            });
        }
        const site = yield wordpressSite_model_1.default.create({
            name: name.trim(),
            wpUrl: wpUrl.trim(),
            username: username.trim(),
            appPasswordEncrypted,
            enabled,
        });
        return res.status(201).json({
            message: "Sito WordPress creato correttamente.",
            site,
        });
    }
    catch (error) {
        console.error("Errore durante la creazione del sito WordPress:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: "Esiste già un sito WordPress con questo nome e URL.",
            });
        }
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.createWordpressSite = createWordpressSite;
const getWordpressSites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const requestingUser = yield user_model_1.default.findById((_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub).select("isSuperAdmin siteAccess");
        const siteFilter = (requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.isSuperAdmin)
            ? {}
            : { _id: (_b = requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.siteAccess) === null || _b === void 0 ? void 0 : _b.siteId };
        const sites = yield wordpressSite_model_1.default.find(siteFilter)
            .select("-appPasswordEncrypted")
            .sort({
            name: 1,
        });
        return res.status(200).json({
            sites,
        });
    }
    catch (error) {
        console.error("Errore durante il recupero dei siti WordPress:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getWordpressSites = getWordpressSites;
const getWordpressSiteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { siteId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }
        const site = yield wordpressSite_model_1.default.findById(siteId)
            .select("-appPasswordEncrypted");
        if (!site) {
            return res.status(404).json({
                message: "Sito WordPress non trovato.",
            });
        }
        return res.status(200).json({
            site,
        });
    }
    catch (error) {
        console.error("Errore durante il recupero del sito WordPress:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.getWordpressSiteById = getWordpressSiteById;
const updateWordpressSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { siteId } = req.params;
        const { name, wpUrl, username, appPasswordEncrypted, enabled, } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }
        const site = yield wordpressSite_model_1.default.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: "Sito WordPress non trovato.",
            });
        }
        if (name !== undefined) {
            site.name = name.trim();
        }
        if (wpUrl !== undefined) {
            site.wpUrl = wpUrl.trim();
        }
        if (username !== undefined) {
            site.username = username.trim();
        }
        if (appPasswordEncrypted !== undefined) {
            site.appPasswordEncrypted =
                appPasswordEncrypted;
        }
        if (enabled !== undefined) {
            site.enabled = enabled;
        }
        yield site.save();
        const updatedSite = yield wordpressSite_model_1.default.findById(site._id).select("-appPasswordEncrypted");
        return res.status(200).json({
            message: "Sito WordPress aggiornato correttamente.",
            site: updatedSite,
        });
    }
    catch (error) {
        console.error("Errore durante l'aggiornamento del sito WordPress:", error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: "Esiste già un sito WordPress con questo nome e URL.",
            });
        }
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.updateWordpressSite = updateWordpressSite;
const deleteWordpressSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { siteId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }
        const site = yield wordpressSite_model_1.default.findByIdAndDelete(siteId);
        if (!site) {
            return res.status(404).json({
                message: "Sito WordPress non trovato.",
            });
        }
        return res.status(200).json({
            message: "Sito WordPress eliminato correttamente.",
        });
    }
    catch (error) {
        console.error("Errore durante l'eliminazione del sito WordPress:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
});
exports.deleteWordpressSite = deleteWordpressSite;
