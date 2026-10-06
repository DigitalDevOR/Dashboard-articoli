import express from 'express';

import requestHasValidAccessToken from '../middlewares/jwt.middleware';
import { authorizePermission } from '../middlewares/userAccess.middleware';
import {
	getPosts,
	createPost,
	publishPost,
	updatePost,
	deletePost,
	bulkDeletePosts,
} from '../controllers/post.controller';

const router = express.Router();

/**
 * RECUPERA I POST DI UN SITO
 *
 * GET http://localhost:3000/api/posts/site/:siteId?page=1&limit=10
 *
 * I post sono ordinati dal piu recente al meno recente.
 * page e limit sono opzionali. limit puo avere un valore massimo di 100.
 * L'autenticazione avviene tramite il cookie accessToken.
 */
router.get(
	'/site/:siteId',
	requestHasValidAccessToken,
	authorizePermission('post:read'),
	getPosts,
);

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
router.post(
	'/site/:siteId',
	requestHasValidAccessToken,
	authorizePermission('post:create'),
	createPost,
);

/**
 * PUBBLICA UN POST SU WORDPRESS
 *
 * POST http://localhost:3000/api/posts/site/:siteId/:postId/publish
 *
 * Body: nessuno.
 * Il post locale viene sincronizzato con l'ID restituito da WordPress.
 */
router.post(
	'/site/:siteId/:postId/publish',
	requestHasValidAccessToken,
	authorizePermission('post:publish'),
	publishPost,
);

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
router.put(
	'/site/:siteId/:postId',
	requestHasValidAccessToken,
	authorizePermission('post:update'),
	updatePost,
);

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
router.delete(
	'/site/:siteId/:postId',
	requestHasValidAccessToken,
	authorizePermission('post:delete'),
	deletePost,
);

/**
 * ELIMINA PIU POST DEFINITIVAMENTE
 *
 * POST /site/:siteId/bulk-delete
 * Body: { "postIds": ["<postId>", ...] }
 */
router.post(
	'/site/:siteId/bulk-delete',
	requestHasValidAccessToken,
	authorizePermission('post:delete'),
	bulkDeletePosts,
);

export default router;
