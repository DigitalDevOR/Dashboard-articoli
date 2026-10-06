import mongoose from 'mongoose';
import Post from '../models/post.models';

const POST_VECTOR_INDEX_NAME = 'post_embedding_vector_index';

const waitForSearchIndex = async (): Promise<void> => {
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error('Connessione MongoDB non disponibile.');
    }

    const collection = db.collection(Post.collection.name);

    const maxAttempts = 30;
    const delayMs = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        const indexes = await collection
            .aggregate([
                {
                    $listSearchIndexes: {
                        name: POST_VECTOR_INDEX_NAME,
                    },
                },
            ])
            .toArray();

        const index = indexes[0];

        if (index?.queryable === true) {
            console.log(
                `Vector Search index "${POST_VECTOR_INDEX_NAME}" pronto.`
            );

            return;
        }

        console.log(
            `Attendo Vector Search index "${POST_VECTOR_INDEX_NAME}"... (${attempt}/${maxAttempts})`
        );

        await new Promise((resolve) =>
            setTimeout(resolve, delayMs)
        );
    }

    throw new Error(
        `Vector Search index "${POST_VECTOR_INDEX_NAME}" non pronto dopo ${maxAttempts} secondi.`
    );
};

export const seedVectorSearchIndexes = async (): Promise<void> => {
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error('Connessione MongoDB non disponibile.');
    }

    const collectionName = Post.collection.name;
    const collection = db.collection(collectionName);

    const existingIndexes = await collection
        .aggregate([
            {
                $listSearchIndexes: {},
            },
        ])
        .toArray();

    const indexAlreadyExists = existingIndexes.some(
        (index) => index.name === POST_VECTOR_INDEX_NAME
    );

    if (!indexAlreadyExists) {

        console.log(
            `Creazione Vector Search index "${POST_VECTOR_INDEX_NAME}"...`
        );

        await db.command({
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

    } else {

        console.log(
            `Vector Search index "${POST_VECTOR_INDEX_NAME}" già presente.`
        );
    }

    await waitForSearchIndex();
};