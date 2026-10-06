import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.EMBEDDING_ARTICOLI_AI_KEY,
});

interface ArticleForDuplicateCheck {
    title: string;
    content: string;
}

interface DuplicateLlmResult {
    isDuplicate: boolean;
}

/**
 * Confronta un nuovo articolo con un articolo già esistente
 * per capire se raccontano sostanzialmente lo stesso evento.
 *
 * Ritorna:
 * true  -> articolo duplicato
 * false -> articolo non duplicato
 */
export const compareArticlesWithLLM = async (
    newArticle: ArticleForDuplicateCheck,
    existingArticle: ArticleForDuplicateCheck
): Promise<boolean> => {

const prompt = `
Devi stabilire se due articoli di notizie descrivono sostanzialmente lo stesso evento.

Regole:

- Considera DUPLICATO se il nuovo articolo racconta sostanzialmente lo stesso fatto già presente nell'articolo esistente.
- Considera DUPLICATO anche se usa parole, titoli o formulazioni differenti ma descrive lo stesso evento.
- Considera NON DUPLICATO se parla dello stesso argomento ma di un evento diverso.
- Considera NON DUPLICATO se contiene uno sviluppo sostanziale nuovo.
- Considera NON DUPLICATO se rappresenta un aggiornamento importante che giustifica una nuova notizia.
- Non basarti solo sui nomi, persone, luoghi o argomenti comuni.
- Valuta soprattutto se il fatto principale raccontato è lo stesso.

ARTICOLO ESISTENTE

Titolo:
${existingArticle.title}

Contenuto:
${existingArticle.content}

NUOVO ARTICOLO

Titolo:
${newArticle.title}

Contenuto:
${newArticle.content}
`.trim();

    const response = await openai.responses.create({
        model: 'gpt-5.4-nano',

        input: prompt,

        text: {
            format: {
                type: 'json_schema',

                name: 'duplicate_check',

                schema: {
                    type: 'object',

                    properties: {
                        isDuplicate: {
                            type: 'boolean',
                        },
                    },

                    required: [
                        'isDuplicate',
                    ],

                    additionalProperties: false,
                },

                strict: true,
            },
        },
    });

    if (!response.output_text) {
        throw new Error(
            'OpenAI non ha restituito una risposta valida per il controllo duplicati'
        );
    }

    const result = JSON.parse(
        response.output_text
    ) as DuplicateLlmResult;

    if (typeof result.isDuplicate !== 'boolean') {
        throw new Error(
            'Risposta OpenAI non valida: isDuplicate non è un booleano'
        );
    }

    return result.isDuplicate;
};