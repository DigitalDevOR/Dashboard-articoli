import Post from '../models/post.models';
import type { IPost } from '../models/post.models';
import WordpressSite from '../models/wordpressSite.model';

import { generateEmbedding } from '../services/embedding.service';

type MockPost = Pick<
	IPost,
	'title' | 'content' | 'category' | 'excerpt' | 'slug' | 'status'
>;

const mockSite = {
	name: 'kiss kiss staging',
	wpUrl: 'https://stg-kisskiss-kkstaging.kinsta.cloud/',
	username: 'AntonioFalcone',
	appPasswordEncrypted: 'CpAEncwU92LksckMWQPZMGt8',
	enabled: true,
};

const mockPosts: MockPost[] = [
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

export const seedMockDataPosts = async () => {
	await Post.syncIndexes();

	let site = await WordpressSite.findOne({
		name: mockSite.name,
		wpUrl: mockSite.wpUrl,
	});

	if (!site) {
		try {
			site = await WordpressSite.create(mockSite);
		} catch (error: any) {
			if (error?.code !== 11000) {
				throw error;
			}

			site = await WordpressSite.findOne({
				name: mockSite.name,
				wpUrl: mockSite.wpUrl,
			});
		}
	}

	if (!site) {
		throw new Error(
			'Impossibile recuperare o creare il sito WordPress mock.'
		);
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
			const embedding = await generateEmbedding(
				mockPost.title,
				mockPost.content
			);

			/*
			 * text-embedding-3-small restituisce 1536 dimensioni.
			 *
			 * Facciamo questo controllo per evitare di salvare
			 * accidentalmente un embedding non compatibile
			 * con il Vector Search Index.
			 */
			if (embedding.length !== 1536) {
				throw new Error(
					`Embedding non valido per "${mockPost.slug}". ` +
					`Dimensioni ricevute: ${embedding.length}`
				);
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
			const post = await Post.findOneAndUpdate(
				{
					siteId: site._id,
					slug: mockPost.slug,
				},
				{
					$set: {
						...mockPost,
						siteId: site._id,
						embedding,
					},
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				}
			);

			if (!post) {
				throw new Error(
					`Impossibile recuperare o creare il post mock "${mockPost.slug}".`
				);
			}

			console.log(
				`Post mock "${post.title}" salvato con embedding di ${post.embedding?.length ?? 0} dimensioni.`
			);

			posts.push(post);

		} catch (error: any) {

			if (error?.code === 11000) {
				const existingPost = await Post.findOne({
					siteId: site._id,
					slug: mockPost.slug,
				});

				if (existingPost) {
					posts.push(existingPost);
					continue;
				}
			}

			throw new Error(
				`Impossibile recuperare o creare il post mock "${mockPost.slug}": ` +
				`${error?.message ?? error}`,
			);
		}
	}

	console.log(
		`Mock data post inseriti: ${posts.length} post per il sito ${site.name}.`
	);

	return {
		site,
		posts,
	};
};