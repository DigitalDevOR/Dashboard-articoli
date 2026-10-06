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
exports.seedMockDataPosts = void 0;
const post_models_1 = __importDefault(require("../models/post.models"));
const wordpressSite_model_1 = __importDefault(require("../models/wordpressSite.model"));
const embedding_service_1 = require("../services/embedding.service");
const mockSite = {
    name: 'kiss kiss staging',
    wpUrl: 'https://stg-kisskiss-kkstaging.kinsta.cloud/',
    username: 'AntonioFalcone',
    appPasswordEncrypted: 'CpAEncwU92LksckMWQPZMGt8',
    enabled: true,
};
const mockPosts = [
    {
        title: 'Il nuovo palinsesto di Kiss Kiss',
        content: '<p>Scopri tutte le novita del nuovo palinsesto di Radio Kiss Kiss.</p>',
        category: 'Radio',
        excerpt: 'Le novita del nuovo palinsesto di Radio Kiss Kiss.',
        slug: 'il-nuovo-palinsesto-di-kiss-kiss',
        status: 'draft',
    },
    {
        title: 'Gli appuntamenti da non perdere questa settimana',
        content: '<p>Una selezione degli appuntamenti e delle rubriche da seguire questa settimana.</p>',
        category: 'Eventi',
        excerpt: 'Gli appuntamenti e le rubriche della settimana.',
        slug: 'gli-appuntamenti-da-non-perdere-questa-settimana',
        status: 'draft',
    },
    {
        title: 'Intervista esclusiva negli studi di Kiss Kiss',
        content: '<p>Un nuovo appuntamento con gli ospiti e le storie piu interessanti del momento.</p>',
        category: 'Interviste',
        excerpt: 'Una nuova intervista esclusiva dagli studi di Kiss Kiss.',
        slug: 'intervista-esclusiva-negli-studi-di-kiss-kiss',
        status: 'draft',
    },
];
const seedMockDataPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    yield post_models_1.default.syncIndexes();
    let site = yield wordpressSite_model_1.default.findOne({
        name: mockSite.name,
        wpUrl: mockSite.wpUrl,
    });
    if (!site) {
        try {
            site = yield wordpressSite_model_1.default.create(mockSite);
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.code) !== 11000) {
                throw error;
            }
            site = yield wordpressSite_model_1.default.findOne({
                name: mockSite.name,
                wpUrl: mockSite.wpUrl,
            });
        }
    }
    if (!site) {
        throw new Error('Impossibile recuperare o creare il sito WordPress mock.');
    }
    const posts = [];
    for (const mockPost of mockPosts) {
        try {
            /*
             * Generazione embedding del contenuto del post.
             *
             * Usiamo title + content perché sono i campi principali
             * che descrivono semanticamente la notizia.
             */
            const embedding = yield (0, embedding_service_1.generateEmbedding)(mockPost.title, mockPost.content);
            /*
             * text-embedding-3-small restituisce 1536 dimensioni.
             *
             * Facciamo questo controllo per evitare di salvare
             * accidentalmente un embedding non compatibile
             * con il Vector Search Index.
             */
            if (embedding.length !== 1536) {
                throw new Error(`Embedding non valido per "${mockPost.slug}". ` +
                    `Dimensioni ricevute: ${embedding.length}`);
            }
            /*
             * Se il post esiste già viene aggiornato.
             *
             * Se non esiste viene creato grazie a upsert: true.
             *
             * In entrambi i casi salviamo anche l'embedding,
             * quindi eventuali vecchi post senza embedding
             * vengono aggiornati automaticamente.
             */
            const post = yield post_models_1.default.findOneAndUpdate({
                siteId: site._id,
                slug: mockPost.slug,
            }, {
                $set: Object.assign(Object.assign({}, mockPost), { siteId: site._id, embedding }),
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
            if (!post) {
                throw new Error(`Impossibile recuperare o creare il post mock "${mockPost.slug}".`);
            }
            console.log(`Post mock "${post.title}" salvato con embedding di ${(_b = (_a = post.embedding) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0} dimensioni.`);
            posts.push(post);
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
                const existingPost = yield post_models_1.default.findOne({
                    siteId: site._id,
                    slug: mockPost.slug,
                });
                if (existingPost) {
                    posts.push(existingPost);
                    continue;
                }
            }
            throw new Error(`Impossibile recuperare o creare il post mock "${mockPost.slug}": ` +
                `${(_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : error}`);
        }
    }
    console.log(`Mock data post inseriti: ${posts.length} post per il sito ${site.name}.`);
    return {
        site,
        posts,
    };
});
exports.seedMockDataPosts = seedMockDataPosts;
