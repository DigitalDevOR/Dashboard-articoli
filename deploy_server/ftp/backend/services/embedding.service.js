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
exports.cosineSimilarity = exports.generateEmbedding = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.EMBEDDING_ARTICOLI_AI_KEY
});
const generateEmbedding = (title, content) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!title.trim() && !content.trim()) {
        throw new Error('Titolo e contenuto vuoti: impossibile generare embedding');
    }
    const text = `
Titolo: ${title}

Contenuto: ${content}
    `.trim();
    const response = yield openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    });
    const embedding = (_a = response.data[0]) === null || _a === void 0 ? void 0 : _a.embedding;
    if (!embedding) {
        throw new Error('OpenAI non ha restituito un embedding');
    }
    return embedding;
});
exports.generateEmbedding = generateEmbedding;
const cosineSimilarity = (embeddingA, embeddingB) => {
    if (embeddingA.length !== embeddingB.length) {
        throw new Error(`Gli embedding hanno dimensioni diverse: ${embeddingA.length} vs ${embeddingB.length}`);
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < embeddingA.length; i++) {
        dotProduct += embeddingA[i] * embeddingB[i];
        magnitudeA += embeddingA[i] * embeddingA[i];
        magnitudeB += embeddingB[i] * embeddingB[i];
    }
    const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    if (denominator === 0) {
        throw new Error('Impossibile calcolare la similarità: uno dei due embedding ha magnitudine zero');
    }
    return dotProduct / denominator;
};
exports.cosineSimilarity = cosineSimilarity;
/*async function testSimilarity() {
    const embedding1 = await generateEmbedding(
        'Osimhen segna due gol contro il Milan',
        'Osimhen segna due gol contro il Milan'
    );

    const embedding2 = await generateEmbedding(
        'Osimhen salterà la prossima partita per infortunio',
        'Osimhen salterà la prossima partita per infortunio'
    );

    const similarity = cosineSimilarity(
        embedding1,
        embedding2
    );

    console.log('Similarity:', similarity);
}

testSimilarity();
*/ 
