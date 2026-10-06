"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToWordpress = exports.deletePostFromWordpress = exports.publishPostOnWordpress = void 0;
const axios_1 = __importDefault(require("axios"));
const getWordpressApiUrl = (site) => `${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;
const getWordpressCategoriesApiUrl = (site) => `${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/categories`;
const getAuthConfig = (site) => ({
    auth: {
        username: site.username,
        password: site.appPasswordEncrypted,
    },
});
const resolveWordpressCategoryId = (site, categoryName) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedName = categoryName.trim();
    const response = yield axios_1.default.get(getWordpressCategoriesApiUrl(site), Object.assign(Object.assign({}, getAuthConfig(site)), { params: { search: normalizedName, per_page: 100 } }));
    const category = response.data.find((item) => item.name.trim().toLowerCase() === normalizedName.toLowerCase());
    if (!category) {
        throw new Error(`Categoria WordPress non trovata: "${normalizedName}".`);
    }
    return category.id;
});
const publishPostOnWordpress = (site_1, post_1, ...args_1) => __awaiter(void 0, [site_1, post_1, ...args_1], void 0, function* (site, post, status = 'publish') {
    var _a, _b, _c;
    const categoryId = ((_a = post.category) === null || _a === void 0 ? void 0 : _a.trim())
        ? yield resolveWordpressCategoryId(site, post.category)
        : undefined;
    const payload = {
        title: post.title,
        content: post.content,
        excerpt: (_b = post.excerpt) !== null && _b !== void 0 ? _b : '',
        slug: post.slug,
        status,
        featured_media: (_c = post.featuredMedia) !== null && _c !== void 0 ? _c : 0,
        categories: categoryId === undefined ? [] : [categoryId],
    };
    const response = post.wordpressPostId
        ? yield axios_1.default.post(`${getWordpressApiUrl(site)}/${post.wordpressPostId}`, payload, getAuthConfig(site))
        : yield axios_1.default.post(getWordpressApiUrl(site), payload, getAuthConfig(site));
    return response.data;
});
exports.publishPostOnWordpress = publishPostOnWordpress;
const deletePostFromWordpress = (site, wordpressPostId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.delete(`${getWordpressApiUrl(site)}/${wordpressPostId}`, Object.assign(Object.assign({}, getAuthConfig(site)), { params: { force: true } }));
    return response.data;
});
exports.deletePostFromWordpress = deletePostFromWordpress;
const uploadImageToWordpress = (site_1, imageBuffer_1, fileName_1, ...args_1) => __awaiter(void 0, [site_1, imageBuffer_1, fileName_1, ...args_1], void 0, function* (site, imageBuffer, fileName, contentType = 'image/jpeg') {
    const mediaUrl = `${site.wpUrl.replace(/\/+$/, '')}/wp-json/wp/v2/media`;
    const response = yield axios_1.default.post(mediaUrl, imageBuffer, Object.assign(Object.assign({}, getAuthConfig(site)), { headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
        }, maxBodyLength: Infinity, maxContentLength: Infinity }));
    return response.data;
});
exports.uploadImageToWordpress = uploadImageToWordpress;
