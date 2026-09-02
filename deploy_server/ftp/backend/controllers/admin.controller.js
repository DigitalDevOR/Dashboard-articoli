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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogout = void 0;
/**
 * Effettua il login di un admin.
 * - Verifica le credenziali (email e password).
 * - Se corrette, genera un token JWT e lo invia come cookie.
 * - Restituisce una risposta con alcune info dell'admin.
 */
const adminLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({ message: "Logout effettuato con successo" });
});
exports.adminLogout = adminLogout;
