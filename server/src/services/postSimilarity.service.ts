import mongoose from 'mongoose';

import Post from '../models/post.models';

import { generateEmbedding } from './embedding.service';

import {
    compareArticlesWithLLM,
} from './articleDuplicateLlm.service';


export interface SimilarPostResult {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    similarityScore: number;
}


export interface ArticleDuplicateCheckResult {
    isDuplicate: boolean;
    embedding: number[];
}


type VectorSearchStage = {
    $vectorSearch: {
        index: string;
        path: string;
        queryVector: number[];
        numCandidates: number;
        limit: number;
        filter?: Record<string, unknown>;
    };
};


const LLM_DUPLICATE_CHECK_THRESHOLD = 0.90;


/**
 * Cerca i post semanticamente più simili
 * ad un embedding all'interno dello stesso sito.
 */
export const findSimilarPosts = async (
    siteId: string,
    embedding: number[],
    limit = 5
): Promise<SimilarPostResult[]> => {

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
        throw new Error(
            'siteId non valido'
        );
    }

    if (
        !Array.isArray(embedding) ||
        embedding.length !== 1536
    ) {
        throw new Error(
            `Embedding non valido. Dimensioni ricevute: ${embedding?.length}`
        );
    }

    const pipeline:
        Array<VectorSearchStage | mongoose.PipelineStage> = [
            {
                $vectorSearch: {
                    index:
                        'post_embedding_vector_index',

                    path:
                        'embedding',

                    queryVector:
                        embedding,

                    numCandidates:
                        100,

                    limit,

                    filter: {
                        siteId:
                            new mongoose.Types.ObjectId(
                                siteId
                            ),
                    },
                },
            },

            {
                $project: {
                    _id: 1,

                    title: 1,

                    content: 1,

                    similarityScore: {
                        $meta:
                            'vectorSearchScore',
                    },
                },
            },
        ];

    const results =
        await Post.aggregate<SimilarPostResult>(
            pipeline as mongoose.PipelineStage[]
        );

    return results;
};


/**
 * Restituisce solamente il post
 * semanticamente più simile.
 */
export const findMostSimilarPost = async (
    siteId: string,
    embedding: number[]
): Promise<SimilarPostResult | null> => {

    const similarPosts =
        await findSimilarPosts(
            siteId,
            embedding,
            1
        );

    return similarPosts[0] ?? null;
};


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
export const checkArticleDuplicate = async (
    siteId: string,
    title: string,
    content: string
): Promise<ArticleDuplicateCheckResult> => {

    /*
     * Generiamo UNA SOLA VOLTA
     * l'embedding del nuovo articolo.
     */
    const embedding =
        await generateEmbedding(
            title,
            content
        );

    if (embedding.length !== 1536) {
        throw new Error(
            `Embedding non valido. Dimensioni ricevute: ${embedding.length}`
        );
    }

    /*
     * Cerchiamo il post semanticamente
     * più vicino nello stesso sito WordPress.
     */
    const mostSimilarPost =
        await findMostSimilarPost(
            siteId,
            embedding
        );

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

    const similarityScore =
        mostSimilarPost.similarityScore;

    console.log(
        `Post più simile: "${mostSimilarPost.title}" - score: ${similarityScore}`
    );

    /*
     * Se lo score è inferiore alla soglia
     * non spendiamo token per interrogare la LLM.
     */
    if (
        similarityScore <
        LLM_DUPLICATE_CHECK_THRESHOLD
    ) {
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
    const isDuplicate =
        await compareArticlesWithLLM(
            {
                title,
                content,
            },
            {
                title:
                    mostSimilarPost.title,

                content:
                    mostSimilarPost.content,
            }
        );

    console.log(
        `Controllo LLM duplicato: ${isDuplicate}`
    );

    /*
     * Anche qui restituiamo lo stesso
     * embedding generato all'inizio.
     */
    return {
        isDuplicate,
        embedding,
    };
};