export const queryKeys = {
    auth: {
        currentUser: ["auth", "current-user"] as const,
    },
    users: {
        all: ["users"] as const,
    },
    roles: {
        all: ["roles"] as const,
    },
    permissions: {
        all: ["permissions"] as const,
        detail: (permissionId: string) => ["permissions", permissionId] as const,
    },
    wordpressSites: {
        all: ["wordpress-sites"] as const,
        detail: (siteId: string) => ["wordpress-sites", siteId] as const,
    },
    posts: {
        all: (siteId: string) => ["posts", siteId] as const,
        list: (siteId: string, page: number, limit: number | 'all', filters: object = {}) => ["posts", siteId, page, limit, filters] as const,
    },
};