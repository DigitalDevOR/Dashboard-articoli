export interface ArticleSeo {
  focusKeyphrase?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  slug?: string | null;
  imageAlt?: string | null;
  imageAltNote?: string | null;
  excerpt?: string | null;
  secondaryKeywords?: string | null;
}

export interface Article {
  nomeSito: string;
  articleTitle: string;
  articleText: string;
  articleURL?: string;
  articleDate?: string;
  category?: string;
  imageThumbURL?: string;
  gettyImageId?: string;
  gettyImageTitle?: string;
  gettyDownloadURL?: string;
  gettyProductType?: string;
  gettyAgreementName?: string;
  seo?: ArticleSeo;
}