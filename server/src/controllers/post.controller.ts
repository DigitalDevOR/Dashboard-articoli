import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Post from '../models/post.models';
import WordpressSite, {
    IWordpressSite,
} from '../models/wordpressSite.model';

import {
    deletePostFromWordpress,
    publishPostOnWordpress,
    updateWordpressImageAltText,
    uploadImageToWordpress,
} from '../services/wordpress.service';
import {
    syncYoastSeo,
    type YoastSeoSyncResult,
} from '../services/yoastCeo.service';
import type { IPostSeo } from '../models/post.models';

import { generateEmbedding } from '../services/embedding.service';


const parsePagination = (req: Request) => {
    const limitParam = String(req.query.limit ?? '10');

    return {
        page: Number.parseInt(String(req.query.page ?? '1'), 10),
        limit:
            limitParam === 'all'
                ? 'all' as const
                : Number.parseInt(limitParam, 10),
    };
};


const isPaginationValid = (page: number, limit: number | 'all') =>
    Number.isInteger(page) &&
    page >= 1 &&
    (limit === 'all' ||
        (Number.isInteger(limit) && limit >= 1 && limit <= 100));


const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isPostSeo = (value: unknown): value is IPostSeo =>
    Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(
        (field) => field === null || typeof field === 'string',
    );

const withYoastStatus = (
    message: string,
    result: YoastSeoSyncResult,
) => {
    if (result === 'failed') {
        return `${message} I metadati Yoast SEO non sono stati sincronizzati.`;
    }

    return message;
};

const uploadRequestImage = async (
    site: IWordpressSite,
    imageData?: string,
    fileName = 'article-image.jpg',
    contentType = 'image/jpeg',
    altText?: string | null,
) => {
    if (!imageData) return undefined;

    const base64Data = imageData.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/i);
    if (!base64Data) {
        throw new Error('Formato immagine non valido.');
    }

    const imageBuffer = Buffer.from(base64Data[2], 'base64');
    if (!imageBuffer.length || imageBuffer.length > 10 * 1024 * 1024) {
        throw new Error('L’immagine deve avere una dimensione compresa tra 1 byte e 10 MB.');
    }

    const media = await uploadImageToWordpress(
        site,
        imageBuffer,
        fileName.replace(/[^a-zA-Z0-9._-]/g, '_'),
        base64Data[1] || contentType,
    );

    if (typeof media?.id !== 'number') {
        throw new Error('WordPress non ha restituito un ID valido per l’immagine caricata.');
    }

    if (altText?.trim()) {
        try {
            await updateWordpressImageAltText(
                site,
                media.id,
                altText.trim(),
            );
        } catch (error) {
            console.error(
                `Impossibile impostare il testo alternativo del media WordPress ${media.id}:`,
                error,
            );
        }
    }

    return {
        imageUrl: typeof media?.source_url === 'string' ? media.source_url : undefined,
        wordpressImageId: typeof media?.id === 'number' ? media.id : undefined,
    };
};


export const getPosts = async (req: Request, res: Response) => {
    try {
        const { siteId } = req.params;

        const { page, limit } = parsePagination(req);

        const title = String(req.query.title ?? '').trim();
        const status = String(req.query.status ?? '').trim();
        const category = String(req.query.category ?? '').trim();
        const dateFrom = String(req.query.dateFrom ?? '').trim();
        const dateTo = String(req.query.dateTo ?? '').trim();

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: 'ID sito non valido.',
            });
        }

        if (!isPaginationValid(page, limit)) {
            return res.status(400).json({
                message:
                    'page deve essere maggiore di 0 e limit deve essere "all" o compreso tra 1 e 100.',
            });
        }

        const allowedStatuses = [
            'publish',
            'draft',
            'pending',
            'private',
            'future',
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Stato post non valido.',
            });
        }

        const postFilter: Record<string, unknown> = {
            siteId,
        };

        if (title) {
            postFilter.title = {
                $regex: escapeRegex(title),
                $options: 'i',
            };
        }

        if (status) {
            postFilter.status = status;
        }

        if (category) {
            postFilter.category = {
                $regex: escapeRegex(category),
                $options: 'i',
            };
        }

        if (dateFrom || dateTo) {
            if (dateFrom && dateTo && dateFrom > dateTo) {
                return res.status(400).json({
                    message:
                        'La data iniziale non puo essere successiva alla data finale.',
                });
            }

            const createdAt: Record<string, Date> = {};

            if (dateFrom) {
                const from = new Date(
                    `${dateFrom}T00:00:00.000Z`
                );

                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        message: 'Data iniziale non valida.',
                    });
                }

                createdAt.$gte = from;
            }

            if (dateTo) {
                const to = new Date(
                    `${dateTo}T00:00:00.000Z`
                );

                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        message: 'Data finale non valida.',
                    });
                }

                to.setUTCDate(to.getUTCDate() + 1);

                createdAt.$lt = to;
            }

            postFilter.createdAt = createdAt;
        }

        const site = await WordpressSite.findById(siteId);

        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }

        const skip = limit === 'all' ? 0 : (page - 1) * limit;

        const [posts, totalPosts] = await Promise.all([
            (limit === 'all'
                ? Post.find(postFilter)
                : Post.find(postFilter).limit(limit))
                .sort({
                    createdAt: -1,
                    _id: -1,
                })
                .skip(skip),

            Post.countDocuments(postFilter),
        ]);

        return res.status(200).json({
            posts,

            pagination: {
                page,
                limit,
                totalPosts,
                totalPages:
                    limit === 'all'
                        ? totalPosts > 0
                            ? 1
                            : 0
                        : Math.ceil(totalPosts / limit),
                hasNextPage:
                    limit !== 'all' && page * limit < totalPosts,
                hasPreviousPage: limit !== 'all' && page > 1,
            },
        });

    } catch (error) {
        console.error(
            'Errore durante il recupero dei post:',
            error
        );

        return res.status(500).json({
            message: 'Errore interno del server.',
        });
    }
};


export const createPost = async (req: Request, res: Response) => {
    try {
        const {
            title,
            content,
            category,
            excerpt,
            slug,
            status,
            featuredMedia,

            // Nuovi campi
            imageUrl,
            wordpressImageId,
            imageData,
            imageFileName,
            imageContentType,
            seo,
            sourceUrl,
            sourcePublishedAt,
        } = req.body;

        const { siteId } = req.params;

        if (
            !siteId ||
            !mongoose.Types.ObjectId.isValid(siteId)
        ) {
            return res.status(400).json({
                message:
                    'Un siteId valido è obbligatorio.',
            });
        }

        if (!title?.trim() || !content) {
            return res.status(400).json({
                message:
                    'title e content sono obbligatori.',
            });
        }

        if (seo !== undefined && seo !== null && !isPostSeo(seo)) {
            return res.status(400).json({
                message: 'Il campo seo deve contenere solo stringhe o valori null.',
            });
        }

        const site = await WordpressSite.findById(siteId);

        if (!site) {
            return res.status(404).json({
                message:
                    'Sito WordPress non trovato.',
            });
        }

        const uploadedImage = await uploadRequestImage(
            site,
            imageData,
            imageFileName,
            imageContentType,
            seo?.imageAlt,
        );

        /*
         * Generazione embedding del post.
         */
        const embedding = await generateEmbedding(
            title.trim(),
            content
        );

        if (embedding.length !== 1536) {
            throw new Error(
                `Embedding non valido. Dimensioni ricevute: ${embedding.length}`
            );
        }

        const post = await Post.create({
            siteId,

            title: title.trim(),
            content,
            category: typeof category === 'string' ? category.trim() : undefined,
            excerpt: excerpt ?? seo?.excerpt ?? '',
            slug: slug ?? seo?.slug ?? undefined,
            sourceUrl,
            sourcePublishedAt,
            seo: seo ?? undefined,
            status,

            featuredMedia: uploadedImage?.wordpressImageId ?? featuredMedia,

            // Nuovi campi
            imageUrl: uploadedImage?.imageUrl ?? imageUrl,
            wordpressImageId: uploadedImage?.wordpressImageId ?? wordpressImageId,

            embedding,
        });

        return res.status(201).json({
            message:
                'Post creato correttamente.',
            post,
        });

    } catch (error: any) {
        console.error(
            'Errore durante la creazione del post:',
            error
        );

        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    'Esiste già un post con questi dati univoci per il sito indicato.',
            });
        }

        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message:
                    'Dati del post non validi.',
            });
        }

        return res.status(500).json({
            message:
                'Errore interno del server.',
        });
    }
};


export const publishPost = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId, postId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(siteId) ||
            !mongoose.Types.ObjectId.isValid(postId)
        ) {
            return res.status(400).json({
                message:
                    'ID sito o ID post non valido.',
            });
        }

        const [site, post] = await Promise.all([
            WordpressSite.findById(siteId),

            Post.findOne({
                _id: postId,
                siteId,
            }),
        ]);

        if (!site) {
            return res.status(404).json({
                message:
                    'Sito WordPress non trovato.',
            });
        }

        if (!site.enabled) {
            return res.status(400).json({
                message:
                    'Il sito WordPress è disabilitato.',
            });
        }

        if (!post) {
            return res.status(404).json({
                message:
                    'Post non trovato per il sito indicato.',
            });
        }

        const wordpressPost =
            await publishPostOnWordpress(
                site,
                post
            );

        const yoastSeoSync = await syncYoastSeo(
            site,
            wordpressPost.id,
            post.seo,
        );

        post.wordpressPostId =
            wordpressPost.id;

        post.status = 'publish';

        await post.save();

        return res.status(200).json({
            message: withYoastStatus(
                'Post pubblicato su WordPress correttamente.',
                yoastSeoSync,
            ),
            post,
        });

    } catch (error: any) {
        console.error(
            'Errore durante la pubblicazione del post su WordPress:',
            error
        );

        const missingCategory =
            typeof error?.message === 'string' &&
            error.message.startsWith('Categoria WordPress non trovata:');

        return res
            .status(
                missingCategory
                    ? 400
                    : error?.response?.status === 401
                    ? 502
                    : 500
            )
            .json({
                message: missingCategory
                    ? error.message
                    : 'Errore durante la pubblicazione del post su WordPress.',
            });
    }
};


export const updatePost = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId, postId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(siteId) ||
            !mongoose.Types.ObjectId.isValid(postId)
        ) {
            return res.status(400).json({
                message:
                    'ID sito o ID post non valido.',
            });
        }

        const post = await Post.findOne({
            _id: postId,
            siteId,
        });

        if (!post) {
            return res.status(404).json({
                message:
                    'Post non trovato per il sito indicato.',
            });
        }

        const {
            title,
            content,
            category,
            excerpt,
            slug,
            status,
            featuredMedia,

            // Nuovi campi
            imageUrl,
            wordpressImageId,
            imageData,
            imageFileName,
            imageContentType,
            seo,
        } = req.body;

        if (seo !== undefined && seo !== null && !isPostSeo(seo)) {
            return res.status(400).json({
                message: 'Il campo seo deve contenere solo stringhe o valori null.',
            });
        }

        let shouldRegenerateEmbedding = false;

        /*
         * TITLE
         */
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message:
                        'Il titolo non può essere vuoto.',
                });
            }

            const normalizedTitle =
                title.trim();

            if (
                normalizedTitle !==
                post.title
            ) {
                post.title =
                    normalizedTitle;

                shouldRegenerateEmbedding =
                    true;
            }
        }

        /*
         * CONTENT
         */
        if (content !== undefined) {
            if (content !== post.content) {
                post.content = content;

                shouldRegenerateEmbedding =
                    true;
            }
        }

        /*
         * Altri campi
         */
        if (excerpt !== undefined) {
            post.excerpt = excerpt;
        }

        if (seo !== undefined) {
            post.seo = seo ?? undefined;

            if (seo?.excerpt !== undefined && excerpt === undefined) {
                post.excerpt = seo.excerpt ?? '';
            }

            if (seo?.slug !== undefined && slug === undefined) {
                post.slug = seo.slug ?? '';
            }
        }

        if (category !== undefined) {
            post.category = typeof category === 'string' ? category.trim() : '';
        }

        if (slug !== undefined) {
            post.slug = slug;
        }

        if (status !== undefined) {
            post.status = status;
        }

        if (featuredMedia !== undefined) {
            post.featuredMedia =
                featuredMedia;
        }

        const site = await WordpressSite.findById(siteId);
        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }

        const uploadedImage = await uploadRequestImage(
            site,
            imageData,
            imageFileName,
            imageContentType,
            seo?.imageAlt,
        );

        /*
         * Nuovi campi immagine.
         *
         * La modifica di questi campi NON richiede
         * la rigenerazione dell'embedding.
         */
        if (imageUrl !== undefined) {
            post.imageUrl = imageUrl;
        }

        if (wordpressImageId !== undefined) {
            post.wordpressImageId =
                wordpressImageId;
        }

        if (uploadedImage) {
            post.imageUrl = uploadedImage.imageUrl;
            post.wordpressImageId = uploadedImage.wordpressImageId;
            post.featuredMedia = uploadedImage.wordpressImageId;
        }

        if (!uploadedImage && seo?.imageAlt !== undefined && post.wordpressImageId) {
            try {
                await updateWordpressImageAltText(
                    site,
                    post.wordpressImageId,
                    seo.imageAlt ?? '',
                );
            } catch (error) {
                console.error(
                    `Impossibile aggiornare il testo alternativo dell'immagine per il post "${post.title}":`,
                    error,
                );
            }
        }

        /*
         * Rigeneriamo l'embedding solamente
         * quando cambia title o content.
         */
        if (shouldRegenerateEmbedding) {
            const embedding =
                await generateEmbedding(
                    post.title,
                    post.content
                );

            if (embedding.length !== 1536) {
                throw new Error(
                    `Embedding non valido. Dimensioni ricevute: ${embedding.length}`
                );
            }

            post.embedding = embedding;
        }

        let yoastSeoSync: YoastSeoSyncResult = 'not-requested';

        if (post.wordpressPostId) {
            try {
                const wordpressPost = await publishPostOnWordpress(
                    site,
                    post,
                    post.status
                );
                yoastSeoSync = await syncYoastSeo(
                    site,
                    wordpressPost.id,
                    post.seo,
                );
            } catch (error: any) {
                console.error(
                    `Errore durante la sincronizzazione del post "${post.title}" con WordPress:`,
                    error
                );

                const missingCategory =
                    typeof error?.message === 'string' &&
                    error.message.startsWith('Categoria WordPress non trovata:');

                return res.status(missingCategory ? 400 : 502).json({
                    message: missingCategory
                        ? error.message
                        : 'Impossibile sincronizzare le modifiche con WordPress. Le modifiche non sono state salvate.',
                });
            }
        }

        await post.save();

        return res.status(200).json({
            message: withYoastStatus(
                'Post aggiornato correttamente.',
                yoastSeoSync,
            ),
            post,
        });

    } catch (error: any) {
        console.error(
            'Errore durante l\'aggiornamento del post:',
            error
        );

        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message:
                    'Dati del post non validi.',
            });
        }

        if (error?.code === 11000) {
            return res.status(409).json({
                message:
                    'Esiste già un post con questi dati univoci.',
            });
        }

        return res.status(500).json({
            message:
                'Errore interno del server.',
        });
    }
};


export const deletePost = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId, postId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(siteId) ||
            !mongoose.Types.ObjectId.isValid(postId)
        ) {
            return res.status(400).json({
                message:
                    'ID sito o ID post non valido.',
            });
        }

        const [site, post] = await Promise.all([
            WordpressSite.findById(siteId),
            Post.findOne({
                _id: postId,
                siteId,
            }),
        ]);

        if (!site) {
            return res.status(404).json({
                message:
                    'Sito WordPress non trovato.',
            });
        }

        if (!post) {
            return res.status(404).json({
                message:
                    'Post non trovato.',
            });
        }

        if (post.wordpressPostId) {
            await deletePostFromWordpress(
                site,
                post.wordpressPostId
            );
        }

        await Post.deleteOne({
            _id: post._id,
            siteId,
        });

        return res.status(200).json({
            message:
                'Post eliminato definitivamente.',
        });

    } catch (error: any) {
        console.error(
            'Errore durante l\'eliminazione definitiva del post:',
            error
        );

        return res
            .status(
                error?.response?.status === 401
                    ? 502
                    : 500
            )
            .json({
                message:
                    'Errore durante l\'eliminazione definitiva del post da WordPress.',
            });
    }
};

export const bulkDeletePosts = async (
    req: Request,
    res: Response
) => {
    try {
        const { siteId } = req.params;
        const postIds: unknown = req.body?.postIds;

        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
                message: 'ID sito non valido.',
            });
        }

        if (
            !Array.isArray(postIds) ||
            postIds.length === 0 ||
            postIds.length > 100 ||
            !postIds.every(
                (postId) =>
                    typeof postId === 'string' &&
                    mongoose.Types.ObjectId.isValid(postId)
            )
        ) {
            return res.status(400).json({
                message:
                    'Seleziona da 1 a 100 post con ID validi.',
            });
        }

        const uniquePostIds = [
            ...new Set(
                (postIds as string[]).map((postId) =>
                    postId.toLowerCase()
                )
            ),
        ];

        if (uniquePostIds.length !== postIds.length) {
            return res.status(400).json({
                message: 'La selezione contiene ID duplicati.',
            });
        }

        const site = await WordpressSite.findById(siteId);

        if (!site) {
            return res.status(404).json({
                message: 'Sito WordPress non trovato.',
            });
        }

        const posts = await Post.find({
            _id: { $in: uniquePostIds },
            siteId,
        });
        const postsById = new Map(
            posts.map((post) => [post._id.toString(), post])
        );
        const deletedPostIds: string[] = [];
        const failedPosts: Array<{
            postId: string;
            title?: string;
            message: string;
        }> = [];

        for (const postId of uniquePostIds) {
            const post = postsById.get(postId);

            if (!post) {
                failedPosts.push({
                    postId,
                    message: 'Post non trovato per questo sito.',
                });
                continue;
            }

            try {
                if (post.wordpressPostId) {
                    await deletePostFromWordpress(
                        site,
                        post.wordpressPostId
                    );
                }

                await Post.deleteOne({
                    _id: post._id,
                    siteId,
                });
                deletedPostIds.push(postId);
            } catch (error: any) {
                console.error(
                    `Errore durante l'eliminazione del post "${post.title}" (${postId}):`,
                    error
                );
                failedPosts.push({
                    postId,
                    title: post.title,
                    message:
                        error?.response?.data?.message ??
                        error?.message ??
                        'Errore sconosciuto durante l’eliminazione.',
                });
            }
        }

        const message = failedPosts.length
            ? `Eliminati ${deletedPostIds.length} post; ${failedPosts.length} non eliminati.`
            : `Eliminati ${deletedPostIds.length} post.`;

        return res.status(
            failedPosts.length > 0 && deletedPostIds.length === 0
                ? 502
                : 200
        ).json({
            message,
            deletedPostIds,
            failedPosts,
        });
    } catch (error: any) {
        console.error(
            'Errore durante l’eliminazione multipla dei post:',
            error
        );

        return res.status(500).json({
            message: 'Errore durante l’eliminazione multipla dei post.',
        });
    }
};