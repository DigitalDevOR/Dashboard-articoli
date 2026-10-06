import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    bulkDeletePosts,
    createPost,
    deletePost,
    getPosts,
    publishPost,
    updatePost,
    type PostInput,
    type PostFilters,
    type PostsLimit,
    type UpdatePostInput,
} from '../api/posts.api';
import { queryKeys } from './queryKeys';

export function usePosts(siteId: string, page: number, limit: PostsLimit, filters: PostFilters) {
    return useQuery({
        queryKey: queryKeys.posts.list(siteId, page, limit, filters),
        queryFn: () => getPosts(siteId, page, limit, filters),
        enabled: Boolean(siteId),
        placeholderData: (previousData) => previousData,
    });
}

function invalidatePosts(queryClient: ReturnType<typeof useQueryClient>, siteId: string) {
    return queryClient.invalidateQueries({ queryKey: queryKeys.posts.all(siteId) });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ siteId, input }: { siteId: string; input: PostInput }) => createPost(siteId, input),
        onSuccess: (_post, variables) => invalidatePosts(queryClient, variables.siteId),
    });
}

export function useUpdatePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ siteId, postId, input }: { siteId: string; postId: string; input: UpdatePostInput }) =>
            updatePost(siteId, postId, input),
        onSuccess: (_post, variables) => invalidatePosts(queryClient, variables.siteId),
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ siteId, postId }: { siteId: string; postId: string }) => deletePost(siteId, postId),
        onSuccess: (_response, variables) => invalidatePosts(queryClient, variables.siteId),
    });
}

export function useBulkDeletePosts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            siteId,
            postIds,
        }: {
            siteId: string;
            postIds: string[];
        }) => bulkDeletePosts(siteId, postIds),
        onSuccess: (_response, variables) =>
            invalidatePosts(queryClient, variables.siteId),
    });
}

export function usePublishPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ siteId, postId }: { siteId: string; postId: string }) => publishPost(siteId, postId),
        onSuccess: (_post, variables) => invalidatePosts(queryClient, variables.siteId),
    });
}