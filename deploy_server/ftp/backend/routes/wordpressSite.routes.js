"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const userAccess_middleware_1 = require("../middlewares/userAccess.middleware");
const wordpressSite_controller_1 = require("../controllers/wordpressSite.controller");
const router = express_1.default.Router();
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
router.post("/create", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("site:create"), wordpressSite_controller_1.createWordpressSite);
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
router.get("/", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("site:read"), wordpressSite_controller_1.getWordpressSites);
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
router.get("/:siteId", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("site:read"), wordpressSite_controller_1.getWordpressSiteById);
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
router.put("/:siteId", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("site:update"), wordpressSite_controller_1.updateWordpressSite);
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
router.delete("/:siteId", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("site:delete"), wordpressSite_controller_1.deleteWordpressSite);
exports.default = router;
