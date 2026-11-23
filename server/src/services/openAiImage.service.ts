import OpenAI from 'openai';

const stripHtml = (value: string) =>
	value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const generateArticleImage = async (
	title: string,
	content: string,
	category?: string,
): Promise<Buffer> => {
	const apiKey =
		process.env.EMBEDDING_ARTICOLI_AI_KEY || process.env.OPENAI_API_KEY;

	if (!apiKey) {
		throw new Error(
			'Chiave API OpenAI mancante (EMBEDDING_ARTICOLI_AI_KEY o OPENAI_API_KEY).',
		);
	}

	const context = stripHtml(content).slice(0, 800);
	const openai = new OpenAI({ apiKey });
	const response = await openai.images.generate({
		model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.6-flare',
		prompt: [
			'Crea un’immagine editoriale fotografica, orizzontale, per accompagnare un articolo di notizie.',
			'Rappresenta il tema in modo accurato e sobrio, senza testo, scritte, loghi o watermark.',
			'Devi assolutamente evitare di inventare volti o immagini che possano violare qualche legge poichè verranno pubblicate su un sito pubblico',
			`Titolo: ${title}`,
			category ? `Categoria: ${category}` : '',
			context ? `Contesto: ${context}` : '',
		]
			.filter(Boolean)
			.join('\n'),
		size: '1536x1024',
	});

	const imageData = response.data?.[0]?.b64_json;

	if (!imageData) {
		throw new Error('OpenAI non ha restituito i dati dell’immagine generata.');
	}

	const imageBuffer = Buffer.from(imageData, 'base64');

	if (!imageBuffer.length) {
		throw new Error('OpenAI ha restituito un’immagine vuota.');
	}

	return imageBuffer;
};
