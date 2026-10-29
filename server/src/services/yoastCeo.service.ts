import axios from 'axios';

import type { IPostSeo } from '../models/post.models';
import type { IWordpressSite } from '../models/wordpressSite.model';

export type YoastSeoSyncResult =
	| 'updated'
	| 'failed'
	| 'not-requested';

const getWordpressPostApiUrl = (
	site: IWordpressSite,
	postId: number,
) => `${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts/${postId}`;

export const syncYoastSeo = async (
	site: IWordpressSite,
	wordpressPostId: number,
	seo: IPostSeo | undefined,
): Promise<YoastSeoSyncResult> => {
	if (!seo) {
		return 'not-requested';
	}

	const meta: Record<string, string> = {};

	if (seo.focusKeyphrase !== undefined) {
		meta._yoast_wpseo_focuskw = seo.focusKeyphrase ?? '';
	}

	if (seo.seoTitle !== undefined) {
		meta._yoast_wpseo_title = seo.seoTitle ?? '';
	}

	if (seo.metaDescription !== undefined) {
		meta._yoast_wpseo_metadesc = seo.metaDescription ?? '';
	}

	if (Object.keys(meta).length === 0) {
		return 'not-requested';
	}

	try {
		await axios.post(
			getWordpressPostApiUrl(site, wordpressPostId),
			{ meta },
			{
				auth: {
					username: site.username,
					password: site.appPasswordEncrypted,
				},
			},
		);

		return 'updated';
	} catch (error) {
		console.error(
			`WordPress non ha accettato i metadati SEO per il post ${wordpressPostId} sul sito "${site.name}". Verificare che le meta key Yoast siano esposte in REST:`,
			error,
		);
		return 'failed';
	}
};