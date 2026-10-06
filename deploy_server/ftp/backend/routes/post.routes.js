"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const userAccess_middleware_1 = require("../middlewares/userAccess.middleware");
const post_controller_1 = require("../controllers/post.controller");
const router = express_1.default.Router();
/**
 * RECUPERA I POST DI UN SITO
 *
 * GET http://localhost:3000/api/posts/site/:siteId?page=1&limit=10
 *
 * I post sono ordinati dal piu recente al meno recente.
 * page e limit sono opzionali. limit puo avere un valore massimo di 100.
 * L'autenticazione avviene tramite il cookie accessToken.
 */
router.get('/site/:siteId', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:read'), post_controller_1.getPosts);
/**
 * CREA UN POST
 *
 * POST http://localhost:3000/api/posts/site/:siteId
 *
 * Esempio:
 * POST http://localhost:3000/api/posts/site/68c000000000000000000001
 *
 * Body:
 * {
 *   "title": "Titolo del post",
 *   "content": "<p>Contenuto HTML del post</p>",
 *   "excerpt": "Breve descrizione del post",
 *   "status": "draft",
 *   "featuredMedia": 1234
 * }
 *
 * Campi obbligatori:
 * - title
 * - content
 *
 * Lo slug viene generato automaticamente dal titolo se non viene specificato.
 * L'autenticazione avviene tramite il cookie accessToken.
 */
router.post('/site/:siteId', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:create'), post_controller_1.createPost);
/**
 * PUBBLICA UN POST SU WORDPRESS
 *
 * POST http://localhost:3000/api/posts/site/:siteId/:postId/publish
 *
 * Body: nessuno.
 * Il post locale viene sincronizzato con l'ID restituito da WordPress.
 */
router.post('/site/:siteId/:postId/publish', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:publish'), post_controller_1.publishPost);
/**
 * MODIFICA UN POST
 *
 * PUT http://localhost:3000/api/posts/site/:siteId/:postId
 *
 * Esempio:
 * PUT http://localhost:3000/api/posts/site/68c000000000000000000001/68c000000000000000000002
 *
 * Body parziale:
 * {
 *   "title": "Titolo aggiornato",
 *   "content": "<p>Contenuto aggiornato</p>",
 *   "excerpt": "Nuova descrizione",
 *   "status": "publish",
 *   "featuredMedia": 5678
 * }
 *
 * È possibile inviare anche un solo campo.
 * Lo slug viene rigenerato dal titolo solo se non è già presente.
 * Se il post è già pubblicato su WordPress, le modifiche vengono sincronizzate
 * con WordPress prima del salvataggio locale.
 * L'autenticazione avviene tramite il cookie accessToken.
 */
router.put('/site/:siteId/:postId', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:update'), post_controller_1.updatePost);
/**
 * ELIMINA DEFINITIVAMENTE UN POST
 *
 * DELETE http://localhost:3000/api/posts/site/:siteId/:postId
 *
 * Esempio:
 * DELETE http://localhost:3000/api/posts/site/68c000000000000000000001/68c000000000000000000002
 *
 * Body: nessuno.
 * Il post viene eliminato da WordPress (se pubblicato) e dal database locale.
 * L'autenticazione avviene tramite il cookie accessToken.
 */
router.delete('/site/:siteId/:postId', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:delete'), post_controller_1.deletePost);
/**
 * ELIMINA PIU POST DEFINITIVAMENTE
 *
 * POST /site/:siteId/bulk-delete
 * Body: { "postIds": ["<postId>", ...] }
 */
router.post('/site/:siteId/bulk-delete', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('post:delete'), post_controller_1.bulkDeletePosts);
exports.default = router;
