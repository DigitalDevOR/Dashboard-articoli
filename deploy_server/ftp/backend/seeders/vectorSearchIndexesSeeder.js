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
exports.seedVectorSearchIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const post_models_1 = __importDefault(require("../models/post.models"));
const POST_VECTOR_INDEX_NAME = 'post_embedding_vector_index';
const waitForSearchIndex = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Connessione MongoDB non disponibile.');
    }
    const collection = db.collection(post_models_1.default.collection.name);
    const maxAttempts = 30;
    const delayMs = 1000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const indexes = yield collection
            .aggregate([
            {
                $listSearchIndexes: {
                    name: POST_VECTOR_INDEX_NAME,
                },
            },
        ])
            .toArray();
        const index = indexes[0];
        if ((index === null || index === void 0 ? void 0 : index.queryable) === true) {
            console.log(`Vector Search index "${POST_VECTOR_INDEX_NAME}" pronto.`);
            return;
        }
        console.log(`Attendo Vector Search index "${POST_VECTOR_INDEX_NAME}"... (${attempt}/${maxAttempts})`);
        yield new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(`Vector Search index "${POST_VECTOR_INDEX_NAME}" non pronto dopo ${maxAttempts} secondi.`);
});
const seedVectorSearchIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Connessione MongoDB non disponibile.');
    }
    const collectionName = post_models_1.default.collection.name;
    const collection = db.collection(collectionName);
    const existingIndexes = yield collection
        .aggregate([
        {
            $listSearchIndexes: {},
        },
    ])
        .toArray();
    const indexAlreadyExists = existingIndexes.some((index) => index.name === POST_VECTOR_INDEX_NAME);
    if (!indexAlreadyExists) {
        console.log(`Creazione Vector Search index "${POST_VECTOR_INDEX_NAME}"...`);
        yield db.command({
            createSearchIndexes: collectionName,
            indexes: [
                {
                    name: POST_VECTOR_INDEX_NAME,
                    type: 'vectorSearch',
                    definition: {
                        fields: [
                            {
                                type: 'vector',
                                path: 'embedding',
                                numDimensions: 1536,
                                similarity: 'cosine',
                            },
                            {
                                type: 'filter',
                                path: 'siteId',
                            },
                        ],
                    },
                },
            ],
        });
    }
    else {
        console.log(`Vector Search index "${POST_VECTOR_INDEX_NAME}" già presente.`);
    }
    yield waitForSearchIndex();
});
exports.seedVectorSearchIndexes = seedVectorSearchIndexes;
