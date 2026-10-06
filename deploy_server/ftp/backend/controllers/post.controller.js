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
exports.bulkDeletePosts = exports.deletePost = exports.updatePost = exports.publishPost = exports.createPost = exports.getPosts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_models_1 = __importDefault(require("../models/post.models"));
const wordpressSite_model_1 = __importDefault(require("../models/wordpressSite.model"));
const wordpress_service_1 = require("../services/wordpress.service");
const embedding_service_1 = require("../services/embedding.service");
const parsePagination = (req) => {
    var _a, _b;
    const limitParam = String((_a = req.query.limit) !== null && _a !== void 0 ? _a : '10');
    return {
        page: Number.parseInt(String((_b = req.query.page) !== null && _b !== void 0 ? _b : '1'), 10),
        limit: limitParam === 'all'
            ? 'all'
            : Number.parseInt(limitParam, 10),
    };
};
const isPaginationValid = (page, limit) => Number.isInteger(page) &&
    page >= 1 &&
    (limit === 'all' ||
        (Number.isInteger(limit) && limit >= 1 && limit <= 100));
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uploadRequestImage = (site_1, imageData_1, ...args_1) => __awaiter(void 0, [site_1, imageData_1, ...args_1], void 0, function* (site, imageData, fileName = 'article-image.jpg', contentType = 'image/jpeg') {
    if (!imageData)
        return undefined;
    const base64Data = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/i);
    if (!base64Data) {
        throw new Error('Formato immagine non valido.');
    }
    const imageBuffer = Buffer.from(base64Data[2], 'base64');
    if (!imageBuffer.length || imageBuffer.length > 10 * 1024 * 1024) {
        throw new Error('L’immagine deve avere una dimensione compresa tra 1 byte e 10 MB.');
    }
    const media = yield (0, wordpress_service_1.uploadImageToWordpress)(site, imageBuffer, fileName.replace(/[^a-zA-Z0-9._-]/g, '_'), base64Data[1] || contentType);
    if (typeof (media === null || media === void 0 ? void 0 : media.id) !== 'number') {
        throw new Error('WordPress non ha restituito un ID valido per l’immagine caricata.');
    }
    return {
        imageUrl: typeof (media === null || media === void 0 ? void 0 : media.source_url) === 'string' ? media.source_url : undefined,
        wordpressImageId: typeof (media === null || media === void 0 ? void 0 : media.id) === 'number' ? media.id : undefined,
    };
});
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { siteId } = req.params;
        const { page, limit } = parsePagination(req);
        const title = String((_a = req.query.title) !== null && _a !== void 0 ? _a : '').trim();
        const status = String((_b = req.query.status) !== null && _b !== void 0 ? _b : '').trim();
        const category = String((_c = req.query.category) !== null && _c !== void 0 ? _c : '').trim();
        const dateFrom = String((_d = req.query.dateFrom) !== null && _d !== void 0 ? _d : '').trim();
        const dateTo = String((_e = req.query.dateTo) !== null && _e !== void 0 ? _e : '').trim();
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: 'ID sito non valido.',
            });
        }
        if (!isPaginationValid(page, limit)) {
            return res.status(400).json({
                message: 'page deve essere maggiore di 0 e limit deve essere "all" o compreso tra 1 e 100.',
            });
        }
        const allowedStatuses = [
            'publish',
            'draft',
            'pending',
            'private',
            'future',
        ];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Stato post non valido.',
            });
        }
        const postFilter = {
            siteId,
        };
        if (title) {
            postFilter.title = {
                $regex: escapeRegex(title),
                $options: 'i',
            };
        }
        if (status) {
            postFilter.status = status;
        }
        if (category) {
            postFilter.category = {
                $regex: escapeRegex(category),
                $options: 'i',
            };
        }
        if (dateFrom || dateTo) {
            if (dateFrom && dateTo && dateFrom > dateTo) {
                return res.status(400).json({
                    message: 'La data iniziale non puo essere successiva alla data finale.',
                });
            }
            const createdAt = {};
            if (dateFrom) {
                const from = new Date(`${dateFrom}T00:00:00.000Z`);
                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        message: 'Data iniziale non valida.',
                    });
                }
                createdAt.$gte = from;
            }
            if (dateTo) {
                const to = new Date(`${dateTo}T00:00:00.000Z`);
                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        message: 'Data finale non valida.',
                    });
                }
                to.setUTCDate(to.getUTCDate() + 1);
                createdAt.$lt = to;
            }
            postFilter.createdAt = createdAt;
        }
        const site = yield wordpressSite_model_1.default.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        const skip = limit === 'all' ? 0 : (page - 1) * limit;
        const [posts, totalPosts] = yield Promise.all([
            (limit === 'all'
                ? post_models_1.default.find(postFilter)
                : post_models_1.default.find(postFilter).limit(limit))
                .sort({
                createdAt: -1,
                _id: -1,
            })
                .skip(skip),
            post_models_1.default.countDocuments(postFilter),
        ]);
        return res.status(200).json({
            posts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: limit === 'all'
                    ? totalPosts > 0
                        ? 1
                        : 0
                    : Math.ceil(totalPosts / limit),
                hasNextPage: limit !== 'all' && page * limit < totalPosts,
                hasPreviousPage: limit !== 'all' && page > 1,
            },
        });
    }
    catch (error) {
        console.error('Errore durante il recupero dei post:', error);
        return res.status(500).json({
            message: 'Errore interno del server.',
        });
    }
});
exports.getPosts = getPosts;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { title, content, category, excerpt, slug, status, featuredMedia, 
        // Nuovi campi
        imageUrl, wordpressImageId, imageData, imageFileName, imageContentType, } = req.body;
        const { siteId } = req.params;
        if (!siteId ||
            !mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: 'Un siteId valido è obbligatorio.',
            });
        }
        if (!(title === null || title === void 0 ? void 0 : title.trim()) || !content) {
            return res.status(400).json({
                message: 'title e content sono obbligatori.',
            });
        }
        const site = yield wordpressSite_model_1.default.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        const uploadedImage = yield uploadRequestImage(site, imageData, imageFileName, imageContentType);
        /*
         * Generazione embedding del post.
         */
        const embedding = yield (0, embedding_service_1.generateEmbedding)(title.trim(), content);
        if (embedding.length !== 1536) {
            throw new Error(`Embedding non valido. Dimensioni ricevute: ${embedding.length}`);
        }
        const post = yield post_models_1.default.create({
            siteId,
            title: title.trim(),
            content,
            category: typeof category === 'string' ? category.trim() : undefined,
            excerpt,
            slug,
            status,
            featuredMedia: (_a = uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.wordpressImageId) !== null && _a !== void 0 ? _a : featuredMedia,
            // Nuovi campi
            imageUrl: (_b = uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.imageUrl) !== null && _b !== void 0 ? _b : imageUrl,
            wordpressImageId: (_c = uploadedImage === null || uploadedImage === void 0 ? void 0 : uploadedImage.wordpressImageId) !== null && _c !== void 0 ? _c : wordpressImageId,
            embedding,
        });
        return res.status(201).json({
            message: 'Post creato correttamente.',
            post,
        });
    }
    catch (error) {
        console.error('Errore durante la creazione del post:', error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: 'Esiste già un post con questi dati univoci per il sito indicato.',
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            return res.status(400).json({
                message: 'Dati del post non validi.',
            });
        }
        return res.status(500).json({
            message: 'Errore interno del server.',
        });
    }
});
exports.createPost = createPost;
const publishPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { siteId, postId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId) ||
            !mongoose_1.default.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'ID sito o ID post non valido.',
            });
        }
        const [site, post] = yield Promise.all([
            wordpressSite_model_1.default.findById(siteId),
            post_models_1.default.findOne({
                _id: postId,
                siteId,
            }),
        ]);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        if (!site.enabled) {
            return res.status(400).json({
                message: 'Il sito WordPress è disabilitato.',
            });
        }
        if (!post) {
            return res.status(404).json({
                message: 'Post non trovato per il sito indicato.',
            });
        }
        const wordpressPost = yield (0, wordpress_service_1.publishPostOnWordpress)(site, post);
        post.wordpressPostId =
            wordpressPost.id;
        post.status = 'publish';
        yield post.save();
        return res.status(200).json({
            message: 'Post pubblicato su WordPress correttamente.',
            post,
        });
    }
    catch (error) {
        console.error('Errore durante la pubblicazione del post su WordPress:', error);
        const missingCategory = typeof (error === null || error === void 0 ? void 0 : error.message) === 'string' &&
            error.message.startsWith('Categoria WordPress non trovata:');
        return res
            .status(missingCategory
            ? 400
            : ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401
                ? 502
                : 500)
            .json({
            message: missingCategory
                ? error.message
                : 'Errore durante la pubblicazione del post su WordPress.',
        });
    }
});
exports.publishPost = publishPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { siteId, postId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId) ||
            !mongoose_1.default.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'ID sito o ID post non valido.',
            });
        }
        const post = yield post_models_1.default.findOne({
            _id: postId,
            siteId,
        });
        if (!post) {
            return res.status(404).json({
                message: 'Post non trovato per il sito indicato.',
            });
        }
        const { title, content, category, excerpt, slug, status, featuredMedia, 
        // Nuovi campi
        imageUrl, wordpressImageId, imageData, imageFileName, imageContentType, } = req.body;
        let shouldRegenerateEmbedding = false;
        /*
         * TITLE
         */
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: 'Il titolo non può essere vuoto.',
                });
            }
            const normalizedTitle = title.trim();
            if (normalizedTitle !==
                post.title) {
                post.title =
                    normalizedTitle;
                shouldRegenerateEmbedding =
                    true;
            }
        }
        /*
         * CONTENT
         */
        if (content !== undefined) {
            if (content !== post.content) {
                post.content = content;
                shouldRegenerateEmbedding =
                    true;
            }
        }
        /*
         * Altri campi
         */
        if (excerpt !== undefined) {
            post.excerpt = excerpt;
        }
        if (category !== undefined) {
            post.category = typeof category === 'string' ? category.trim() : '';
        }
        if (slug !== undefined) {
            post.slug = slug;
        }
        if (status !== undefined) {
            post.status = status;
        }
        if (featuredMedia !== undefined) {
            post.featuredMedia =
                featuredMedia;
        }
        const site = yield wordpressSite_model_1.default.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        const uploadedImage = yield uploadRequestImage(site, imageData, imageFileName, imageContentType);
        /*
         * Nuovi campi immagine.
         *
         * La modifica di questi campi NON richiede
         * la rigenerazione dell'embedding.
         */
        if (imageUrl !== undefined) {
            post.imageUrl = imageUrl;
        }
        if (wordpressImageId !== undefined) {
            post.wordpressImageId =
                wordpressImageId;
        }
        if (uploadedImage) {
            post.imageUrl = uploadedImage.imageUrl;
            post.wordpressImageId = uploadedImage.wordpressImageId;
            post.featuredMedia = uploadedImage.wordpressImageId;
        }
        /*
         * Rigeneriamo l'embedding solamente
         * quando cambia title o content.
         */
        if (shouldRegenerateEmbedding) {
            const embedding = yield (0, embedding_service_1.generateEmbedding)(post.title, post.content);
            if (embedding.length !== 1536) {
                throw new Error(`Embedding non valido. Dimensioni ricevute: ${embedding.length}`);
            }
            post.embedding = embedding;
        }
        if (post.wordpressPostId) {
            try {
                yield (0, wordpress_service_1.publishPostOnWordpress)(site, post, post.status);
            }
            catch (error) {
                console.error(`Errore durante la sincronizzazione del post "${post.title}" con WordPress:`, error);
                const missingCategory = typeof (error === null || error === void 0 ? void 0 : error.message) === 'string' &&
                    error.message.startsWith('Categoria WordPress non trovata:');
                return res.status(missingCategory ? 400 : 502).json({
                    message: missingCategory
                        ? error.message
                        : 'Impossibile sincronizzare le modifiche con WordPress. Le modifiche non sono state salvate.',
                });
            }
        }
        yield post.save();
        return res.status(200).json({
            message: 'Post aggiornato correttamente.',
            post,
        });
    }
    catch (error) {
        console.error('Errore durante l\'aggiornamento del post:', error);
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            return res.status(400).json({
                message: 'Dati del post non validi.',
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res.status(409).json({
                message: 'Esiste già un post con questi dati univoci.',
            });
        }
        return res.status(500).json({
            message: 'Errore interno del server.',
        });
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { siteId, postId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId) ||
            !mongoose_1.default.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'ID sito o ID post non valido.',
            });
        }
        const [site, post] = yield Promise.all([
            wordpressSite_model_1.default.findById(siteId),
            post_models_1.default.findOne({
                _id: postId,
                siteId,
            }),
        ]);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        if (!post) {
            return res.status(404).json({
                message: 'Post non trovato.',
            });
        }
        if (post.wordpressPostId) {
            yield (0, wordpress_service_1.deletePostFromWordpress)(site, post.wordpressPostId);
        }
        yield post_models_1.default.deleteOne({
            _id: post._id,
            siteId,
        });
        return res.status(200).json({
            message: 'Post eliminato definitivamente.',
        });
    }
    catch (error) {
        console.error('Errore durante l\'eliminazione definitiva del post:', error);
        return res
            .status(((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401
            ? 502
            : 500)
            .json({
            message: 'Errore durante l\'eliminazione definitiva del post da WordPress.',
        });
    }
});
exports.deletePost = deletePost;
const bulkDeletePosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { siteId } = req.params;
        const postIds = (_a = req.body) === null || _a === void 0 ? void 0 : _a.postIds;
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: 'ID sito non valido.',
            });
        }
        if (!Array.isArray(postIds) ||
            postIds.length === 0 ||
            postIds.length > 100 ||
            !postIds.every((postId) => typeof postId === 'string' &&
                mongoose_1.default.Types.ObjectId.isValid(postId))) {
            return res.status(400).json({
                message: 'Seleziona da 1 a 100 post con ID validi.',
            });
        }
        const uniquePostIds = [
            ...new Set(postIds.map((postId) => postId.toLowerCase())),
        ];
        if (uniquePostIds.length !== postIds.length) {
            return res.status(400).json({
                message: 'La selezione contiene ID duplicati.',
            });
        }
        const site = yield wordpressSite_model_1.default.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }
        const posts = yield post_models_1.default.find({
            _id: { $in: uniquePostIds },
            siteId,
        });
        const postsById = new Map(posts.map((post) => [post._id.toString(), post]));
        const deletedPostIds = [];
        const failedPosts = [];
        for (const postId of uniquePostIds) {
            const post = postsById.get(postId);
            if (!post) {
                failedPosts.push({
                    postId,
                    message: 'Post non trovato per questo sito.',
                });
                continue;
            }
            try {
                if (post.wordpressPostId) {
                    yield (0, wordpress_service_1.deletePostFromWordpress)(site, post.wordpressPostId);
                }
                yield post_models_1.default.deleteOne({
                    _id: post._id,
                    siteId,
                });
                deletedPostIds.push(postId);
            }
            catch (error) {
                console.error(`Errore durante l'eliminazione del post "${post.title}" (${postId}):`, error);
                failedPosts.push({
                    postId,
                    title: post.title,
                    message: (_e = (_d = (_c = (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : error === null || error === void 0 ? void 0 : error.message) !== null && _e !== void 0 ? _e : 'Errore sconosciuto durante l’eliminazione.',
                });
            }
        }
        const message = failedPosts.length
            ? `Eliminati ${deletedPostIds.length} post; ${failedPosts.length} non eliminati.`
            : `Eliminati ${deletedPostIds.length} post.`;
        return res.status(failedPosts.length > 0 && deletedPostIds.length === 0
            ? 502
            : 200).json({
            message,
            deletedPostIds,
            failedPosts,
        });
    }
    catch (error) {
        console.error('Errore durante l’eliminazione multipla dei post:', error);
        return res.status(500).json({
            message: 'Errore durante l’eliminazione multipla dei post.',
        });
    }
});
exports.bulkDeletePosts = bulkDeletePosts;
