import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from 'bcryptjs';
import { RequestWithAccessToken } from "../types/express.types";
import {
    generateAccessToken,
} from "../utils/jwt";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email e password sono obbligatorie" });
    }

    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
        return res.status(401).json({ message: "Credenziali non valide, utente non trovato", email: email, password: password });
    }

    const hashedPassword = password;
    const isMatch = await bcrypt.compare(hashedPassword, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: "Credenziali non valide, compare non passato" });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user._id.toString());

    // setta il token come cookie httpOnly
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minuti
    });

    return res.status(200).json({ message: "Login effettuato con successo" });

};

export const getCurrentUser = async (req: RequestWithAccessToken, res: Response) => {
    const userId = req.userDecoded?.sub;

    if (!userId) {
        return res.status(401).json({ message: "Accesso negato. Token mancante o non valido." });
    }

    const user = await User.findById(userId)
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
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout effettuato correttamente." });
};