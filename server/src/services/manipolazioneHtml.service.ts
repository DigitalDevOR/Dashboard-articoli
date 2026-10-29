import * as cheerio from 'cheerio';

export function normalizeArticleHtml(html: string): string {
    return html.replace(/<[^>]*>/g, (tag) =>
        tag.replace(/\\+"/g, '"')
    );
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function addTableOfContents(html: string): string {
    const normalizedHtml = normalizeArticleHtml(html);
    const $ = cheerio.load(normalizedHtml, null, false);

    if (hasTableOfContents($)) {
        return normalizedHtml;
    }

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
        return normalizedHtml;
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
    const $ = cheerio.load(normalizeArticleHtml(html), null, false);

    // Rimuove il titolo creato appositamente per l'indice
    $('.article-toc-title').remove();

    const headingIds = new Set(
        $('h2[id]')
            .map((_, element) => $(element).attr('id'))
            .get()
    );

    $('ul').each((_, element) => {
        if (isTableOfContents($(element), headingIds)) {
            const list = $(element);
            list.remove();
        }
    });

    return $.html();
}

function hasTableOfContents($: cheerio.CheerioAPI): boolean {
    const headingIds = new Set(
        $('h2[id]')
            .map((_, element) => $(element).attr('id'))
            .get()
    );

    return $('ul')
        .toArray()
        .some((element) =>
            isTableOfContents($(element), headingIds)
        );
}

function isTableOfContents(
    list: cheerio.Cheerio<any>,
    headingIds: Set<string | undefined>
): boolean {
    const links = list.find('a');

    if (links.length === 0) {
        return false;
    }

    return links.toArray().every((element) => {
        const href = list.find(element).attr('href');

        if (!href?.startsWith('#')) {
            return false;
        }

        try {
            return headingIds.has(decodeURIComponent(href.slice(1)));
        } catch {
            return false;
        }
    });
}