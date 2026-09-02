import { Request, Response } from "express";

/**
 * Effettua il login di un admin.
 * - Verifica le credenziali (email e password).
 * - Se corrette, genera un token JWT e lo invia come cookie.
 * - Restituisce una risposta con alcune info dell'admin.
 */
export const adminLogout = async (req: Request, res: Response) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logout effettuato con successo" });
};
