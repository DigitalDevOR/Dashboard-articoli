import * as cheerio from 'cheerio';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function addTableOfContents(html: string): string {
    // Se l'indice è già presente, restituisce l'HTML originale
    if (hasTableOfContents(html)) {
        return html;
    }

    const $ = cheerio.load(html, null, false);

    const usedIds = new Set<string>();
    const items: Array<{ id: string; text: string }> = [];

    const createSlug = (text: string): string => {
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
        const heading = $(element);

        const text = heading.text().trim();

        if (!text) {
            return;
        }

        let id = heading.attr('id')?.trim();

        if (!id) {
            id = createSlug(text);
            heading.attr('id', id);
        } else if (usedIds.has(id)) {
            id = createSlug(id);
            heading.attr('id', id);
        } else {
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
    .map(
        ({ id, text }) =>
            `    <li><a href="#${id}">${escapeHtml(text)}</a></li>`
    )
    .join('\n')}
</ul>
`;

    return `${menu}\n${$.html()}`;
}

export function removeTableOfContents(html: string): string {
    const $ = cheerio.load(html, null, false);

    // Rimuove il titolo creato appositamente per l'indice
    $('.article-toc-title').remove();

    // Rimuove l'indice
    $('ul.wp-block-list').each((_, element) => {
        const list = $(element);

        const links = list.find('a');
        const anchorLinks = list.find('a[href^="#"]');

        const isTableOfContents =
            links.length > 0 &&
            links.length === anchorLinks.length;

        if (isTableOfContents) {
            list.remove();
        }
    });

    return $.html();
}

function hasTableOfContents(html: string): boolean {
    const $ = cheerio.load(html, null, false);

    const lists = $('ul.wp-block-list');

    for (const element of lists.toArray()) {
        const list = $(element);

        const links = list.find('a');
        const anchorLinks = list.find('a[href^="#"]');

        const isTableOfContents =
            links.length > 0 &&
            links.length === anchorLinks.length;

        if (isTableOfContents) {
            return true;
        }
    }

    return false;
}