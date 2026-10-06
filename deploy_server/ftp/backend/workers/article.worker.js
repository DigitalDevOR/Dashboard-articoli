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
exports.startArticleWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../config/redis.config");
const wordpressSite_model_1 = __importDefault(require("../models/wordpressSite.model"));
const post_models_1 = __importDefault(require("../models/post.models"));
const postSimilarity_service_1 = require("../services/postSimilarity.service");
const gettyImages_service_1 = require("../services/gettyImages.service");
const wordpress_service_1 = require("../services/wordpress.service");
const manipolazioneHtml_service_1 = require("../services/manipolazioneHtml.service");
function processArticle(article) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        /*
         * STEP 1
         * Verifica presenza del nome del sito.
         */
        if (!((_a = article.nomeSito) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new Error("nomeSito mancante nell'articolo ricevuto");
        }
        /*
         * STEP 2
         * Recuperiamo il sito WordPress associato
         * al nome ricevuto dal workflow n8n.
         */
        const site = yield wordpressSite_model_1.default.findOne({
            name: article.nomeSito.trim(),
            enabled: true,
        });
        if (!site) {
            throw new Error(`Sito WordPress non trovato o disabilitato: "${article.nomeSito}"`);
        }
        console.log(`Sito associato: ${site.name} (${site._id.toString()})`);
        /*
         * STEP 3
         * Controllo duplicato.
         *
         * checkArticleDuplicate:
         *
         * - genera UNA SOLA VOLTA l'embedding
         * - esegue MongoDB Vector Search
         * - recupera il post più simile
         * - se similarityScore >= 0.90
         *   interroga la LLM
         *
         * Restituisce anche l'embedding,
         * così lo riutilizziamo successivamente
         * per salvare il Post.
         */
        const duplicateCheck = yield (0, postSimilarity_service_1.checkArticleDuplicate)(site._id.toString(), article.articleTitle, article.articleText);
        const { isDuplicate, embedding, } = duplicateCheck;
        /*
         * Un duplicato NON è un errore tecnico.
         *
         * Interrompiamo semplicemente il flusso
         * senza fare throw.
         */
        if (isDuplicate) {
            console.log(`Articolo duplicato: "${article.articleTitle}". Elaborazione interrotta.`);
            return;
        }
        console.log(`Articolo nuovo: "${article.articleTitle}". Continuo elaborazione.`);
        /*
         * STEP 4
         * Download Getty opzionale.
         *
         * Se:
         *
         * - gettyDownloadURL non esiste
         * - Getty restituisce errore
         * - Getty restituisce un'immagine vuota
         *
         * continuiamo comunque senza immagine.
         */
        let imageBuffer = null;
        if ((_b = article.gettyDownloadURL) === null || _b === void 0 ? void 0 : _b.trim()) {
            try {
                imageBuffer = yield (0, gettyImages_service_1.downloadGettyImage)(article.gettyDownloadURL);
                if (!imageBuffer.length) {
                    console.warn(`Getty ha restituito un'immagine vuota per "${article.articleTitle}". Continuo senza immagine.`);
                    imageBuffer = null;
                }
                else {
                    console.log(`Immagine Getty scaricata correttamente: ${imageBuffer.length} bytes`);
                }
            }
            catch (error) {
                console.error(`Errore download Getty per "${article.articleTitle}". Continuo senza immagine:`, error);
                imageBuffer = null;
            }
        }
        else {
            console.log(`Nessuna immagine Getty disponibile per "${article.articleTitle}". Continuo senza immagine.`);
        }
        /*
         * STEP 5
         * Upload immagine WordPress opzionale.
         *
         * Questi valori resteranno undefined
         * se non abbiamo immagine o se l'upload fallisce.
         */
        let wordpressImageId;
        let imageUrl;
        if (imageBuffer) {
            try {
                const fileName = ((_c = article.gettyImageId) === null || _c === void 0 ? void 0 : _c.trim())
                    ? `${article.gettyImageId}.jpg`
                    : `article-image-${Date.now()}.jpg`;
                const wordpressMedia = yield (0, wordpress_service_1.uploadImageToWordpress)(site, imageBuffer, fileName);
                /*
                 * Controlliamo che WordPress abbia restituito
                 * almeno un ID media valido.
                 */
                if (!wordpressMedia ||
                    typeof wordpressMedia.id !== "number") {
                    console.warn(`Upload WordPress completato ma risposta media non valida per "${article.articleTitle}". Continuo senza immagine.`);
                }
                else {
                    wordpressImageId =
                        wordpressMedia.id;
                    if (typeof wordpressMedia.source_url === "string" &&
                        wordpressMedia.source_url.trim()) {
                        imageUrl =
                            wordpressMedia.source_url;
                    }
                    console.log(`Immagine caricata su WordPress correttamente. Media ID: ${wordpressImageId}`);
                    if (imageUrl) {
                        console.log(`WordPress image URL: ${imageUrl}`);
                    }
                }
            }
            catch (error) {
                /*
                 * Anche l'errore upload WordPress
                 * NON interrompe l'elaborazione.
                 */
                console.error(`Errore upload immagine su WordPress per "${article.articleTitle}". Continuo senza immagine:`, error);
                wordpressImageId = undefined;
                imageUrl = undefined;
            }
        }
        else {
            console.log(`Nessuna immagine da caricare su WordPress per "${article.articleTitle}".`);
        }
        /*
         * STEP 6
         * Creazione del Post nel database.
         *
         * Riutilizziamo l'embedding già generato
         * durante il controllo duplicati.
         *
         * NON viene effettuata una seconda chiamata
         * OpenAI per generare l'embedding.
         */
        const post = yield post_models_1.default.create({
            siteId: site._id,
            title: article.articleTitle.trim(),
            content: (0, manipolazioneHtml_service_1.addTableOfContents)(article.articleText),
            category: ((_d = article.category) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
            status: "draft",
            /*
             * Se l'upload WordPress è riuscito
             * questi valori saranno presenti.
             *
             * Altrimenti rimarranno undefined.
             */
            imageUrl,
            wordpressImageId,
            /*
             * L'immagine caricata diventa anche
             * la featured image del Post.
             */
            featuredMedia: wordpressImageId,
            /*
             * Embedding già generato nello STEP 3.
             */
            embedding,
        });
        console.log(`Post creato nel database: "${post.title}" (${post._id.toString()})`);
    });
}
const startArticleWorker = () => {
    const worker = new bullmq_1.Worker("articles", (job) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const article = job.data;
            console.log(`Elaborazione articolo: "${article.articleTitle}"`);
            yield processArticle(article);
        }
        catch (error) {
            console.error(`Errore elaborazione job ${job.id}:`, error);
            /*
             * Gli errori tecnici reali vengono rilanciati.
             *
             * BullMQ considererà il job FAILED.
             */
            throw error;
        }
    }), {
        connection: redis_config_1.redisConnection,
    });
    /*
     * Job terminato correttamente.
     *
     * Anche un articolo duplicato viene
     * considerato COMPLETED perché il flusso
     * termina con un semplice return.
     */
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completato`);
    });
    /*
     * Errore tecnico nel processor.
     */
    worker.on("failed", (job, error) => {
        console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} fallito:`, error);
    });
    /*
     * Errori generali Worker / Redis.
     */
    worker.on("error", (error) => {
        console.error("Errore Worker:", error);
    });
    return worker;
};
exports.startArticleWorker = startArticleWorker;
