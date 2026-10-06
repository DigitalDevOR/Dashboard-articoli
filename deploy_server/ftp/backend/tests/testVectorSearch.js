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
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const embedding_service_1 = require("../services/embedding.service");
const postSimilarity_service_1 = require("../services/postSimilarity.service");
const wordpressSite_model_1 = __importDefault(require("../models/wordpressSite.model"));
const testVectorSearch = () => __awaiter(void 0, void 0, void 0, function* () {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI non definita');
    }
    yield mongoose_1.default.connect(mongoUri);
    const site = yield wordpressSite_model_1.default.findOne({
        name: 'kiss kiss staging',
    });
    if (!site) {
        throw new Error('Sito mock non trovato');
    }
    const title = 'Nuovo palinsesto di Radio Kiss Kiss';
    const content = `
        Radio Kiss Kiss presenta il nuovo palinsesto
        con programmi, speaker e appuntamenti della nuova stagione.
    `;
    const embedding = yield (0, embedding_service_1.generateEmbedding)(title, content);
    console.log('Embedding generato:', embedding.length);
    const similarPosts = yield (0, postSimilarity_service_1.findSimilarPosts)(site._id.toString(), embedding, 5);
    console.log('\nRISULTATI VECTOR SEARCH\n');
    for (const post of similarPosts) {
        console.log({
            title: post.title,
            similarityScore: post.similarityScore,
        });
    }
    yield mongoose_1.default.disconnect();
});
testVectorSearch()
    .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(error);
    yield mongoose_1.default.disconnect();
    process.exit(1);
}));
