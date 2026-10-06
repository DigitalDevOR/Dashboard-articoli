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
exports.checkArticleDuplicate = exports.findMostSimilarPost = exports.findSimilarPosts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_models_1 = __importDefault(require("../models/post.models"));
const embedding_service_1 = require("./embedding.service");
const articleDuplicateLlm_service_1 = require("./articleDuplicateLlm.service");
const LLM_DUPLICATE_CHECK_THRESHOLD = 0.90;
/**
 * Cerca i post semanticamente più simili
 * ad un embedding all'interno dello stesso sito.
 */
const findSimilarPosts = (siteId_1, embedding_1, ...args_1) => __awaiter(void 0, [siteId_1, embedding_1, ...args_1], void 0, function* (siteId, embedding, limit = 5) {
    if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
        throw new Error('siteId non valido');
    }
    if (!Array.isArray(embedding) ||
        embedding.length !== 1536) {
        throw new Error(`Embedding non valido. Dimensioni ricevute: ${embedding === null || embedding === void 0 ? void 0 : embedding.length}`);
    }
    const pipeline = [
        {
            $vectorSearch: {
                index: 'post_embedding_vector_index',
                path: 'embedding',
                queryVector: embedding,
                numCandidates: 100,
                limit,
                filter: {
                    siteId: new mongoose_1.default.Types.ObjectId(siteId),
                },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                similarityScore: {
                    $meta: 'vectorSearchScore',
                },
            },
        },
    ];
    const results = yield post_models_1.default.aggregate(pipeline);
    return results;
});
exports.findSimilarPosts = findSimilarPosts;
/**
 * Restituisce solamente il post
 * semanticamente più simile.
 */
const findMostSimilarPost = (siteId, embedding) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const similarPosts = yield (0, exports.findSimilarPosts)(siteId, embedding, 1);
    return (_a = similarPosts[0]) !== null && _a !== void 0 ? _a : null;
});
exports.findMostSimilarPost = findMostSimilarPost;
/**
 * Controlla se un nuovo articolo è un duplicato
 * di un post già presente nel database.
 *
 * Flusso:
 *
 * 1. Genera UNA SOLA VOLTA l'embedding
 *    del nuovo articolo.
 *
 * 2. Usa lo stesso embedding per
 *    MongoDB Vector Search.
 *
 * 3. Se non esiste nessun post simile
 *    -> articolo NON duplicato.
 *
 * 4. Se similarityScore < 0.90
 *    -> articolo NON duplicato.
 *
 * 5. Se similarityScore >= 0.90
 *    -> verifica tramite LLM.
 *
 * 6. Restituisce sempre anche l'embedding
 *    già generato, così può essere riutilizzato
 *    per salvare il Post senza fare una seconda
 *    chiamata OpenAI.
 *
 * Solo la LLM può confermare definitivamente
 * che l'articolo è un duplicato.
 */
const checkArticleDuplicate = (siteId, title, content) => __awaiter(void 0, void 0, void 0, function* () {
    /*
     * Generiamo UNA SOLA VOLTA
     * l'embedding del nuovo articolo.
     */
    const embedding = yield (0, embedding_service_1.generateEmbedding)(title, content);
    if (embedding.length !== 1536) {
        throw new Error(`Embedding non valido. Dimensioni ricevute: ${embedding.length}`);
    }
    /*
     * Cerchiamo il post semanticamente
     * più vicino nello stesso sito WordPress.
     */
    const mostSimilarPost = yield (0, exports.findMostSimilarPost)(siteId, embedding);
    /*
     * Se non esiste nessun candidato,
     * l'articolo non è duplicato.
     *
     * Restituiamo comunque l'embedding
     * perché servirà per salvare il nuovo Post.
     */
    if (!mostSimilarPost) {
        return {
            isDuplicate: false,
            embedding,
        };
    }
    const similarityScore = mostSimilarPost.similarityScore;
    console.log(`Post più simile: "${mostSimilarPost.title}" - score: ${similarityScore}`);
    /*
     * Se lo score è inferiore alla soglia
     * non spendiamo token per interrogare la LLM.
     */
    if (similarityScore <
        LLM_DUPLICATE_CHECK_THRESHOLD) {
        return {
            isDuplicate: false,
            embedding,
        };
    }
    /*
     * Da 0.90 in poi chiediamo alla LLM
     * se i due articoli raccontano realmente
     * lo stesso evento.
     */
    const isDuplicate = yield (0, articleDuplicateLlm_service_1.compareArticlesWithLLM)({
        title,
        content,
    }, {
        title: mostSimilarPost.title,
        content: mostSimilarPost.content,
    });
    console.log(`Controllo LLM duplicato: ${isDuplicate}`);
    /*
     * Anche qui restituiamo lo stesso
     * embedding generato all'inizio.
     */
    return {
        isDuplicate,
        embedding,
    };
});
exports.checkArticleDuplicate = checkArticleDuplicate;
