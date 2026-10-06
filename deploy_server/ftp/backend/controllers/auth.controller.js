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
exports.logout = exports.getCurrentUser = exports.login = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email e password sono obbligatorie" });
    }
    const user = yield user_model_1.default.findOne({ email: email }).select("+password");
    if (!user) {
        return res.status(401).json({ message: "Credenziali non valide, utente non trovato", email: email, password: password });
    }
    const hashedPassword = password;
    const isMatch = yield bcryptjs_1.default.compare(hashedPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Credenziali non valide, compare non passato" });
    }
    // Generate JWT token
    const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
    // setta il token come cookie httpOnly
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minuti
    });
    return res.status(200).json({ message: "Login effettuato con successo" });
});
exports.login = login;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.userDecoded) === null || _a === void 0 ? void 0 : _a.sub;
    if (!userId) {
        return res.status(401).json({ message: "Accesso negato. Token mancante o non valido." });
    }
    const user = yield user_model_1.default.findById(userId)
        .select("-password")
        .populate("siteAccess.siteId")
        .populate({
        path: "siteAccess.role",
        populate: { path: "permissions" },
    })
        .populate("siteAccess.additionalPermissions");
    if (!user) {
        return res.status(404).json({ message: "Utente non trovato." });
    }
    return res.status(200).json({ user });
});
exports.getCurrentUser = getCurrentUser;
const logout = (_req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout effettuato correttamente." });
};
exports.logout = logout;
