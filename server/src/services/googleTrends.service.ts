import axios from 'axios';
import { load } from 'cheerio';

const GOOGLE_TRENDS_RSS_URL =
	'https://trends.google.it/trending/rss?geo=IT';

const stopWords = new Set([
	'alla', 'alle', 'anche', 'come', 'con', 'dalla', 'dalle', 'dello',
	'della', 'delle', 'degli', 'dopo', 'dove', 'fare', 'fino', 'hanno',
	'il', 'in', 'la', 'le', 'lo', 'ma', 'nel', 'nella', 'nelle', 'nello',
	'non', 'per', 'piu', 'sul', 'sulla', 'sulle', 'sono', 'tra', 'una',
	'uno',
]);

export interface GoogleTrend {
	title: string;
}

const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const getKeywords = (value: string) =>
	normalize(value)
		.split(' ')
		.filter((word) => word.length >= 3 && !stopWords.has(word));

export const fetchGoogleTrends = async (): Promise<GoogleTrend[]> => {
	const response = await axios.get<string>(GOOGLE_TRENDS_RSS_URL, {
		timeout: 10000,
		responseType: 'text',
	});

	const $ = load(response.data, { xmlMode: true });
	const channel = $('channel');

	if (!channel.length) {
		throw new Error('Google Trends non ha restituito un feed RSS valido.');
	}

	const trends = channel
		.children('item')
		.map((_index, item) => ({
			title: $(item).find('title').first().text().trim(),
		}))
		.get()
		.filter((trend) => trend.title.length > 0);

	if (trends.length === 0) {
		throw new Error('Il feed Google Trends non contiene trend.');
	}

	return trends;
};

export const findMatchingGoogleTrend = (
	articleTitle: string,
	trends: GoogleTrend[],
): GoogleTrend | undefined => {
	const articleKeywords = new Set(getKeywords(articleTitle));

	if (articleKeywords.size === 0) {
		return undefined;
	}

	return trends.find((trend) => {
		const trendKeywords = getKeywords(trend.title);

		if (trendKeywords.length === 0) {
			return false;
		}

		const matchingKeywords = trendKeywords.filter((keyword) =>
			articleKeywords.has(keyword),
		);

		if (trendKeywords.length === 1) {
			return trendKeywords[0].length >= 4 && matchingKeywords.length === 1;
		}

		return (
			matchingKeywords.length >= 2 &&
			matchingKeywords.length / trendKeywords.length >= 0.6
		);
	});
};

export const checkArticleGoogleTrend = async (
	articleTitle: string,
): Promise<GoogleTrend | undefined> => {
	const trends = await fetchGoogleTrends();
	return findMatchingGoogleTrend(articleTitle, trends);
};
