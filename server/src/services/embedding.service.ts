import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.EMBEDDING_ARTICOLI_AI_KEY
});

export const generateEmbedding = async (
    title: string,
    content: string
): Promise<number[]> => {

    if (!title.trim() && !content.trim()) {
        throw new Error(
            'Titolo e contenuto vuoti: impossibile generare embedding'
        );
    }

    const text = `
Titolo: ${title}

Contenuto: ${content}
    `.trim();

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
        throw new Error(
            'OpenAI non ha restituito un embedding'
        );
    }

    return embedding;
};

export const cosineSimilarity = (
    embeddingA: number[],
    embeddingB: number[]
): number => {

    if (embeddingA.length !== embeddingB.length) {
        throw new Error(
            `Gli embedding hanno dimensioni diverse: ${embeddingA.length} vs ${embeddingB.length}`
        );
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < embeddingA.length; i++) {
        dotProduct += embeddingA[i] * embeddingB[i];

        magnitudeA += embeddingA[i] * embeddingA[i];
        magnitudeB += embeddingB[i] * embeddingB[i];
    }

    const denominator =
        Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

    if (denominator === 0) {
        throw new Error(
            'Impossibile calcolare la similarità: uno dei due embedding ha magnitudine zero'
        );
    }

    return dotProduct / denominator;
};

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