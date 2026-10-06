import { Request, Response } from "express";
import Permission from "../models/permission.model";

/**
 * READ ALL
 * Recupera tutti i permessi
 */
export const getPermissions = async (
    req: Request,
    res: Response
) => {
    try {
        const permissions = await Permission.find()
            .sort({
                category: 1,
                name: 1,
            });

        return res.status(200).json({
            permissions,
        });

    } catch (error) {
        console.error(
            "Errore durante il recupero dei permessi:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


/**
 * READ ONE
 * Recupera un singolo permesso tramite id
 */
export const getPermissionById = async (
    req: Request,
    res: Response
) => {
    try {
        const { permissionId } = req.params;

        const permission = await Permission.findById(
            permissionId
        );

        if (!permission) {
            return res.status(404).json({
                message: "Permesso non trovato.",
            });
        }

        return res.status(200).json({
            permission,
        });

    } catch (error: any) {
        console.error(
            "Errore durante il recupero del permesso:",
            error
        );

        if (error?.name === "CastError") {
            return res.status(400).json({
                message: "ID permesso non valido.",
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};

