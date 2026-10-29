/*
    "post_content": "<p>Giulia De Lellis ha recentemente espresso la sua indignazione per la pubblicazione non autorizzata di foto della figlia Priscilla su una rivista. L'influencer ha sempre mantenuto una linea chiara riguardo alla privacy della bambina, evitando di mostrarne il volto sui social. In passato, aveva dichiarato: \"Le cose belle le proteggo. Ho imparato a fare questa cosa e mi fa sentire meglio. La percepisco più al sicuro così\".<\/p><h2>La reazione di Giulia De Lellis alla pubblicazione non autorizzata<\/h2><p>La recente pubblicazione di foto non autorizzate di Priscilla ha suscitato una forte reazione da parte di Giulia De Lellis. L'influencer ha espresso la sua indignazione sui social, sottolineando come l'uso di immagini di minori senza il consenso dei genitori rappresenti una grave violazione della privacy. Ha affermato: \"È stato superato un limite. La foto di mia figlia usata senza consenso, i bambini non sono strumenti per generare curiosità. Dovreste vergognarvi\".<\/p><h2>La posizione di Giulia De Lellis sulla privacy dei minori<\/h2><p>Giulia De Lellis ha sempre adottato una politica rigorosa riguardo alla privacy della figlia Priscilla. Sin dalla nascita della bambina, avvenuta nell'ottobre 2025, l'influencer ha scelto di non mostrarne il volto sui social media. Questa decisione è stata motivata dal desiderio di proteggere la piccola dall'esposizione mediatica e di garantire la sua sicurezza. Giulia ha spiegato qualche mese fa su Instagram: \"Le cose belle le proteggo. Ho imparato a fare questa cosa e mi fa sentire meglio. La percepisco più al sicuro così\".&nbsp;<\/p><h2>Precedenti violazioni della privacy<\/h2><p>Non è la prima volta che Giulia De Lellis si trova a dover affrontare violazioni della privacy riguardanti la figlia. Nel settembre 2025, prima ancora della nascita di Priscilla, sui social era circolata la falsa notizia dell'arrivo della bambina, accompagnata dalla foto di una neonata. L'influencer aveva denunciato l'accaduto, definendolo \"vergognoso\" e sottolineando la gravità della diffusione di fake news e dell'uso improprio di immagini di minori.<\/p>",
    "post_title": "Giulia De Lellis denuncia l'uso non autorizzato di foto della figlia Priscilla: \"I bambini non sono strumenti per generare curiosità\"",
    "post_excerpt": "L'influencer esprime indignazione per la pubblicazione non autorizzata di immagini della figlia Priscilla, ribadendo la necessità di rispettare la privacy dei minori.",
    "post_name": "giulia-de-lellis-denuncia-luso-non-autorizzato-di-foto-della-figlia-priscilla-i-bambini-non-sono-strumenti-per-generare-curiosita",
    "status": "publish || draft || pending || private || future",
    "featured_media": 1234
*/

import mongoose, { Document, Schema } from 'mongoose';
import './wordpressSite.model';

export type WordpressPostStatus =
    | 'publish'
    | 'draft'
    | 'pending'
    | 'private'
    | 'future';

export interface IPostSeo {
    focusKeyphrase?: string | null;
    seoTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    imageAlt?: string | null;
    imageAltNote?: string | null;
    excerpt?: string | null;
    secondaryKeywords?: string | null;
}

export interface IPost extends Document {
    siteId: mongoose.Types.ObjectId;
    wordpressPostId?: number;
    imageUrl?: string;
    wordpressImageId?: number;
    title: string;
    content: string;
    category?: string;
    excerpt?: string;
    slug?: string;
    sourceUrl?: string;
    sourcePublishedAt?: Date;
    seo?: IPostSeo;
    status: WordpressPostStatus;
    featuredMedia?: number;
    embedding?: number[];
}

const PostSeoSchema = new Schema<IPostSeo>({
    focusKeyphrase: { type: String },
    seoTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String },
    imageAlt: { type: String },
    imageAltNote: { type: String },
    excerpt: { type: String },
    secondaryKeywords: { type: String },
}, {
    _id: false,
});

const PostSchema = new Schema<IPost>({
    siteId: {
        type: Schema.Types.ObjectId,
        ref: 'WordpressSite',
        required: true,
    },
    wordpressPostId: {
        type: Number,
        sparse: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    wordpressImageId: {
        type: Number,
        required: false,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, trim: true },
    excerpt: { type: String, default: '' },
    slug: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    sourcePublishedAt: { type: Date },
    seo: { type: PostSeoSchema, default: undefined },
    status: {
        type: String,
        enum: ['publish', 'draft', 'pending', 'private', 'future'],
        default: 'draft',
        required: true,
    },
    featuredMedia: { type: Number },
    embedding: {
        type: [Number],
        required: false,
        default: undefined,
    },
}, {
    timestamps: true,
});

PostSchema.pre<IPost>('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    next();
});

PostSchema.index({ siteId: 1, slug: 1 }, { unique: true, sparse: true });

PostSchema.index(
    { siteId: 1, wordpressPostId: 1 },
    {
        unique: true,
        partialFilterExpression: { wordpressPostId: { $exists: true } },
    },
);

PostSchema.index({ siteId: 1, createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema);