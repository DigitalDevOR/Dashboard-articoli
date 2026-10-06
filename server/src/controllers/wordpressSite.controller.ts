import { Request, Response } from "express";
import mongoose from "mongoose";

import WordpressSite from "../models/wordpressSite.model";
import User from "../models/user.model";
import { RequestWithAccessToken } from "../types/express.types";


export const createWordpressSite = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            wpUrl,
            username,
            appPasswordEncrypted,
            enabled = true,
        } = req.body;

        if (
            !name ||
            !wpUrl ||
            !username ||
            !appPasswordEncrypted
        ) {
            return res.status(400).json({
                message:
                    "name, wpUrl, username e appPasswordEncrypted sono obbligatori.",
            });
        }

        const existingSite = await WordpressSite.findOne({
            name: name.trim(),
            wpUrl: wpUrl.trim(),
        });

        if (existingSite) {
            return res.status(409).json({
                message:
                    "Esiste già un sito WordPress con questo nome e URL.",
            });
        }

        const site = await WordpressSite.create({
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

    } catch (error: any) {
        console.error(
            "Errore durante la creazione del sito WordPress:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    "Esiste già un sito WordPress con questo nome e URL.",
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const getWordpressSites = async (
    req: RequestWithAccessToken,
    res: Response
) => {
    try {
        const requestingUser = await User.findById(req.userDecoded?.sub).select("isSuperAdmin siteAccess");
        const siteFilter = requestingUser?.isSuperAdmin
            ? {}
            : { _id: requestingUser?.siteAccess?.siteId };

        const sites = await WordpressSite.find(siteFilter)
            .select("-appPasswordEncrypted")
            .sort({
                name: 1,
            });

        return res.status(200).json({
            sites,
        });

    } catch (error) {
        console.error(
            "Errore durante il recupero dei siti WordPress:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const getWordpressSiteById = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }

        const site = await WordpressSite.findById(siteId)
            .select("-appPasswordEncrypted");

        if (!site) {
            return res.status(404).json({
                message: "Sito WordPress non trovato.",
            });
        }

        return res.status(200).json({
            site,
        });

    } catch (error) {
        console.error(
            "Errore durante il recupero del sito WordPress:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const updateWordpressSite = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId } = req.params;

        const {
            name,
            wpUrl,
            username,
            appPasswordEncrypted,
            enabled,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }

        const site = await WordpressSite.findById(siteId);

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

        await site.save();

        const updatedSite = await WordpressSite.findById(
            site._id
        ).select("-appPasswordEncrypted");

        return res.status(200).json({
            message: "Sito WordPress aggiornato correttamente.",
            site: updatedSite,
        });

    } catch (error: any) {
        console.error(
            "Errore durante l'aggiornamento del sito WordPress:",
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    "Esiste già un sito WordPress con questo nome e URL.",
            });
        }

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const deleteWordpressSite = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: "ID sito non valido.",
            });
        }

        const site = await WordpressSite.findByIdAndDelete(
            siteId
        );

        if (!site) {
            return res.status(404).json({
                message: "Sito WordPress non trovato.",
            });
        }

        return res.status(200).json({
            message: "Sito WordPress eliminato correttamente.",
        });

    } catch (error) {
        console.error(
            "Errore durante l'eliminazione del sito WordPress:",
            error
        );

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};