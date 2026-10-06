import { apiClient } from "./apiClient";

const WORDPRESS_SITES_PATH = "/wordpress-sites";

export type WordpressSite = {
    _id: string;
    name: string;
    wpUrl: string;
    username: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateWordpressSiteInput = {
    name: string;
    wpUrl: string;
    username: string;
    appPasswordEncrypted: string;
    enabled?: boolean;
};

export type UpdateWordpressSiteInput = Partial<CreateWordpressSiteInput>;

type WordpressSitesResponse = {
    sites: WordpressSite[];
};

type WordpressSiteResponse = {
    site: WordpressSite;
};

type WordpressSiteMessageResponse = {
    message: string;
};

export async function getWordpressSites(): Promise<WordpressSite[]> {
    const response = await apiClient.get<WordpressSitesResponse>(WORDPRESS_SITES_PATH);
    return response.data.sites;
}

export async function getWordpressSiteById(siteId: string): Promise<WordpressSite> {
    const response = await apiClient.get<WordpressSiteResponse>(`${WORDPRESS_SITES_PATH}/${siteId}`);
    return response.data.site;
}

export async function createWordpressSite(
    input: CreateWordpressSiteInput,
): Promise<WordpressSite> {
    const response = await apiClient.post<WordpressSiteResponse>(`${WORDPRESS_SITES_PATH}/create`, input);
    return response.data.site;
}

export async function updateWordpressSite(
    siteId: string,
    input: UpdateWordpressSiteInput,
): Promise<WordpressSite> {
    const response = await apiClient.put<WordpressSiteResponse>(
        `${WORDPRESS_SITES_PATH}/${siteId}`,
        input,
    );
    return response.data.site;
}

export async function deleteWordpressSite(siteId: string): Promise<WordpressSiteMessageResponse> {
    const response = await apiClient.delete<WordpressSiteMessageResponse>(
        `${WORDPRESS_SITES_PATH}/${siteId}`,
    );
    return response.data;
}