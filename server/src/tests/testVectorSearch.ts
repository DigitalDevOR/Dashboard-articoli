import 'dotenv/config';
import mongoose from 'mongoose';

import { generateEmbedding } from '../services/embedding.service';
import { findSimilarPosts } from '../services/postSimilarity.service';
import WordpressSite from '../models/wordpressSite.model';

const testVectorSearch = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI non definita');
    }

    await mongoose.connect(mongoUri);

    const site = await WordpressSite.findOne({
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

    const embedding = await generateEmbedding(
        title,
        content
    );

    console.log('Embedding generato:', embedding.length);

    const similarPosts = await findSimilarPosts(
        site._id.toString(),
        embedding,
        5
    );

    console.log('\nRISULTATI VECTOR SEARCH\n');

    for (const post of similarPosts) {
        console.log({
            title: post.title,
            similarityScore: post.similarityScore,
        });
    }

    await mongoose.disconnect();
};

testVectorSearch()
    .catch(async (error) => {
        console.error(error);

        await mongoose.disconnect();

        process.exit(1);
    });