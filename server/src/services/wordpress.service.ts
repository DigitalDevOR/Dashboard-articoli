import axios from 'axios';

import { IPost } from '../models/post.models';
import { IWordpressSite } from '../models/wordpressSite.model';

const getWordpressApiUrl = (site: IWordpressSite) =>
	`${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;

const getWordpressCategoriesApiUrl = (site: IWordpressSite) =>
	`${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/categories`;

const getAuthConfig = (site: IWordpressSite) => ({
	auth: {
		username: site.username,
		password: site.appPasswordEncrypted,
	},
});

const resolveWordpressCategoryId = async (
	site: IWordpressSite,
	categoryName: string,
) => {
	const normalizedName = categoryName.trim();
	const response = await axios.get<Array<{ id: number; name: string }>>(
		getWordpressCategoriesApiUrl(site),
		{
			...getAuthConfig(site),
			params: { search: normalizedName, per_page: 100 },
		},
	);

	const category = response.data.find(
		(item) => item.name.trim().toLowerCase() === normalizedName.toLowerCase(),
	);

	if (!category) {
		throw new Error(`Categoria WordPress non trovata: "${normalizedName}".`);
	}

	return category.id;
};

export const publishPostOnWordpress = async (
	site: IWordpressSite,
	post: IPost,
	status: IPost['status'] = 'publish',
) => {
	const categoryId = post.category?.trim()
		? await resolveWordpressCategoryId(site, post.category)
		: undefined;

	const payload = {
		title: post.title,
		content: post.content,
		excerpt: post.excerpt ?? '',
		slug: post.slug,
		status,
		featured_media: post.featuredMedia ?? 0,
		categories: categoryId === undefined ? [] : [categoryId],
	};

	const response = post.wordpressPostId
		? await axios.post(
			`${getWordpressApiUrl(site)}/${post.wordpressPostId}`,
			payload,
			getAuthConfig(site),
		)
		: await axios.post(
			getWordpressApiUrl(site),
			payload,
			getAuthConfig(site),
		);

	return response.data;
};

export const deletePostFromWordpress = async (
	site: IWordpressSite,
	wordpressPostId: number,
) => {
	const response = await axios.delete(
		`${getWordpressApiUrl(site)}/${wordpressPostId}`,
		{
			...getAuthConfig(site),
			params: { force: true },
		},
	);

	return response.data;
};

export const uploadImageToWordpress = async (
    site: IWordpressSite,
    imageBuffer: Buffer,
    fileName: string,
    contentType = 'image/jpeg',
) => {
    const mediaUrl =
        `${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/media`;

    const response = await axios.post(
        mediaUrl,
        imageBuffer,
        {
            ...getAuthConfig(site),

            headers: {
                'Content-Type': contentType,
                'Content-Disposition':
                    `attachment; filename="${fileName}"`,
            },

            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        }
    );

    return response.data;
};