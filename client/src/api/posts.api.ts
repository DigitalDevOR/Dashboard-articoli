import { apiClient } from './apiClient';

export type PostStatus = 'publish' | 'draft' | 'pending' | 'private' | 'future';

export type PostSeo = {
    focusKeyphrase?: string | null;
    seoTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    imageAlt?: string | null;
    imageAltNote?: string | null;
    excerpt?: string | null;
    secondaryKeywords?: string | null;
};

export type Post = {
    _id: string;
    siteId: string;
    wordpressPostId?: number;
    title: string;
    content: string;
    category?: string;
    excerpt?: string;
    slug?: string;
    sourceUrl?: string;
    sourcePublishedAt?: string;
    seo?: PostSeo;
    status: PostStatus;
    imageUrl?: string;
    wordpressImageId?: number;
    featuredMedia?: number;
    createdAt: string;
    updatedAt: string;
};

export type PostInput = {
    title: string;
    content: string;
    category?: string;
    excerpt?: string;
    slug?: string;
    seo?: PostSeo;
    status?: PostStatus;
    imageUrl?: string;
    wordpressImageId?: number;
    featuredMedia?: number;
    imageData?: string;
    imageFileName?: string;
    imageContentType?: string;
};

export type UpdatePostInput = Partial<PostInput>;

export type PostFilters = {
    title: string;
    category: string;
    status: PostStatus | '';
    dateFrom: string;
    dateTo: string;
};

export type PostsLimit = number | 'all';

export type PostsResponse = {
    posts: Post[];
    pagination: {
        page: number;
        limit: PostsLimit;
        totalPosts: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type PostResponse = { post: Post; message: string };
export type PostMessageResponse = { message: string; post?: Post };
export type BulkDeletePostsResponse = {
    message: string;
    deletedPostIds: string[];
    failedPosts: Array<{
        postId: string;
        title?: string;
        message: string;
    }>;
};

const postsPath = (siteId: string) => `/posts/site/${siteId}`;

export async function getPosts(siteId: string, page = 1, limit: PostsLimit = 10, filters?: Partial<PostFilters>): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(postsPath(siteId), {
        params: { page, limit, ...filters },
    });
    return response.data;
}

export async function createPost(siteId: string, input: PostInput): Promise<Post> {
    const response = await apiClient.post<PostResponse>(postsPath(siteId), input);
    return response.data.post;
}

export async function updatePost(siteId: string, postId: string, input: UpdatePostInput): Promise<Post> {
    const response = await apiClient.put<PostResponse>(`${postsPath(siteId)}/${postId}`, input);
    return response.data.post;
}

export async function deletePost(siteId: string, postId: string): Promise<PostMessageResponse> {
    const response = await apiClient.delete<PostMessageResponse>(`${postsPath(siteId)}/${postId}`);
    return response.data;
}

export async function bulkDeletePosts(siteId: string, postIds: string[]): Promise<BulkDeletePostsResponse> {
    const response = await apiClient.post<BulkDeletePostsResponse>(
        `${postsPath(siteId)}/bulk-delete`,
        { postIds },
    );
    return response.data;
}

export async function publishPost(siteId: string, postId: string): Promise<PostResponse> {
    const response = await apiClient.post<PostResponse>(`${postsPath(siteId)}/${postId}/publish`);
    return response.data;
}