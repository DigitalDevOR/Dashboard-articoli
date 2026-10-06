import express from "express";

import requestHasValidAccessToken from "../middlewares/jwt.middleware";

import { authorizePermission } from "../middlewares/userAccess.middleware";

import {
    createWordpressSite,
    getWordpressSites,
    getWordpressSiteById,
    updateWordpressSite,
    deleteWordpressSite,
} from "../controllers/wordpressSite.controller";


const router = express.Router();


/**
 * CREATE WORDPRESS SITE
 *
 * POST /create
 *
 * Payload:
 * {
 *     "name": "Radio Kiss Kiss",
 *     "wpUrl": "https://www.kisskiss.it",
 *     "username": "api-user",
 *     "appPasswordEncrypted": "password-cifrata",
 *     "enabled": true
 * }
 *
 * Campi obbligatori:
 * - name
 * - wpUrl
 * - username
 * - appPasswordEncrypted
 *
 * Campo opzionale:
 * - enabled (default: true)
 */
router.post(
    "/create",
    requestHasValidAccessToken,
    authorizePermission("site:create"),
    createWordpressSite
);


/**
 * GET ALL WORDPRESS SITES
 *
 * GET /
 *
 * Payload:
 * Nessun body richiesto.
 *
 * Esempio:
 * GET /wordpress-sites
 */
router.get(
    "/",
    requestHasValidAccessToken,
    authorizePermission("site:read"),
    getWordpressSites
);


/**
 * GET WORDPRESS SITE BY ID
 *
 * GET /:siteId
 *
 * Payload:
 * Nessun body richiesto.
 *
 * Il siteId viene passato come parametro nell'URL.
 *
 * Esempio:
 * GET /wordpress-sites/68c000000000000000000001
 */
router.get(
    "/:siteId",
    requestHasValidAccessToken,
    authorizePermission("site:read"),
    getWordpressSiteById
);


/**
 * UPDATE WORDPRESS SITE
 *
 * PUT /:siteId
 *
 * Il siteId viene passato come parametro nell'URL.
 *
 * Esempio:
 * PUT /wordpress-sites/68c000000000000000000001
 *
 * Payload completo:
 * {
 *     "name": "Radio Kiss Kiss Napoli",
 *     "wpUrl": "https://www.kisskissnapoli.it",
 *     "username": "api-user",
 *     "appPasswordEncrypted": "nuova-password-cifrata",
 *     "enabled": true
 * }
 *
 * Tutti i campi sono opzionali.
 * È possibile inviare solamente quelli da modificare.
 *
 * Esempio aggiornamento parziale:
 * {
 *     "username": "nuovo-api-user",
 *     "enabled": false
 * }
 */
router.put(
    "/:siteId",
    requestHasValidAccessToken,
    authorizePermission("site:update"),
    updateWordpressSite
);


/**
 * DELETE WORDPRESS SITE
 *
 * DELETE /:siteId
 *
 * Payload:
 * Nessun body richiesto.
 *
 * Il siteId viene passato come parametro nell'URL.
 *
 * Esempio:
 * DELETE /wordpress-sites/68c000000000000000000001
 */
router.delete(
    "/:siteId",
    requestHasValidAccessToken,
    authorizePermission("site:delete"),
    deleteWordpressSite
);


export default router;