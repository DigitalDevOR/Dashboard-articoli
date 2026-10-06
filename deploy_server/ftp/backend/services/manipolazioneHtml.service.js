"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTableOfContents = addTableOfContents;
exports.removeTableOfContents = removeTableOfContents;
const cheerio = __importStar(require("cheerio"));
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function addTableOfContents(html) {
    // Se l'indice è già presente, restituisce l'HTML originale
    if (hasTableOfContents(html)) {
        return html;
    }
    const $ = cheerio.load(html, null, false);
    const usedIds = new Set();
    const items = [];
    const createSlug = (text) => {
        const baseSlug = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        const safeBaseSlug = baseSlug || 'sezione';
        let slug = safeBaseSlug;
        let counter = 2;
        while (usedIds.has(slug)) {
            slug = `${safeBaseSlug}-${counter}`;
            counter++;
        }
        usedIds.add(slug);
        return slug;
    };
    $('h2').each((_, element) => {
        var _a;
        const heading = $(element);
        const text = heading.text().trim();
        if (!text) {
            return;
        }
        let id = (_a = heading.attr('id')) === null || _a === void 0 ? void 0 : _a.trim();
        if (!id) {
            id = createSlug(text);
            heading.attr('id', id);
        }
        else if (usedIds.has(id)) {
            id = createSlug(id);
            heading.attr('id', id);
        }
        else {
            usedIds.add(id);
        }
        items.push({
            id,
            text,
        });
    });
    // Se non ci sono H2, non aggiunge alcun indice
    if (items.length === 0) {
        return html;
    }
    const menu = `
<h3 class="article-toc-title">In questo articolo troverai:</h3>
<ul class="wp-block-list">
${items
        .map(({ id, text }) => `    <li><a href="#${id}">${escapeHtml(text)}</a></li>`)
        .join('\n')}
</ul>
`;
    return `${menu}\n${$.html()}`;
}
function removeTableOfContents(html) {
    const $ = cheerio.load(html, null, false);
    // Rimuove il titolo creato appositamente per l'indice
    $('.article-toc-title').remove();
    // Rimuove l'indice
    $('ul.wp-block-list').each((_, element) => {
        const list = $(element);
        const links = list.find('a');
        const anchorLinks = list.find('a[href^="#"]');
        const isTableOfContents = links.length > 0 &&
            links.length === anchorLinks.length;
        if (isTableOfContents) {
            list.remove();
        }
    });
    return $.html();
}
function hasTableOfContents(html) {
    const $ = cheerio.load(html, null, false);
    const lists = $('ul.wp-block-list');
    for (const element of lists.toArray()) {
        const list = $(element);
        const links = list.find('a');
        const anchorLinks = list.find('a[href^="#"]');
        const isTableOfContents = links.length > 0 &&
            links.length === anchorLinks.length;
        if (isTableOfContents) {
            return true;
        }
    }
    return false;
}
