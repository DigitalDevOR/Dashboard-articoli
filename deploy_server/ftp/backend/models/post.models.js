"use strict";
/*
    "post_content": "<p>Giulia De Lellis ha recentemente espresso la sua indignazione per la pubblicazione non autorizzata di foto della figlia Priscilla su una rivista. L'influencer ha sempre mantenuto una linea chiara riguardo alla privacy della bambina, evitando di mostrarne il volto sui social. In passato, aveva dichiarato: \"Le cose belle le proteggo. Ho imparato a fare questa cosa e mi fa sentire meglio. La percepisco più al sicuro così\".<\/p><h2>La reazione di Giulia De Lellis alla pubblicazione non autorizzata<\/h2><p>La recente pubblicazione di foto non autorizzate di Priscilla ha suscitato una forte reazione da parte di Giulia De Lellis. L'influencer ha espresso la sua indignazione sui social, sottolineando come l'uso di immagini di minori senza il consenso dei genitori rappresenti una grave violazione della privacy. Ha affermato: \"È stato superato un limite. La foto di mia figlia usata senza consenso, i bambini non sono strumenti per generare curiosità. Dovreste vergognarvi\".<\/p><h2>La posizione di Giulia De Lellis sulla privacy dei minori<\/h2><p>Giulia De Lellis ha sempre adottato una politica rigorosa riguardo alla privacy della figlia Priscilla. Sin dalla nascita della bambina, avvenuta nell'ottobre 2025, l'influencer ha scelto di non mostrarne il volto sui social media. Questa decisione è stata motivata dal desiderio di proteggere la piccola dall'esposizione mediatica e di garantire la sua sicurezza. Giulia ha spiegato qualche mese fa su Instagram: \"Le cose belle le proteggo. Ho imparato a fare questa cosa e mi fa sentire meglio. La percepisco più al sicuro così\".&nbsp;<\/p><h2>Precedenti violazioni della privacy<\/h2><p>Non è la prima volta che Giulia De Lellis si trova a dover affrontare violazioni della privacy riguardanti la figlia. Nel settembre 2025, prima ancora della nascita di Priscilla, sui social era circolata la falsa notizia dell'arrivo della bambina, accompagnata dalla foto di una neonata. L'influencer aveva denunciato l'accaduto, definendolo \"vergognoso\" e sottolineando la gravità della diffusione di fake news e dell'uso improprio di immagini di minori.<\/p>",
    "post_title": "Giulia De Lellis denuncia l'uso non autorizzato di foto della figlia Priscilla: \"I bambini non sono strumenti per generare curiosità\"",
    "post_excerpt": "L'influencer esprime indignazione per la pubblicazione non autorizzata di immagini della figlia Priscilla, ribadendo la necessità di rispettare la privacy dei minori.",
    "post_name": "giulia-de-lellis-denuncia-luso-non-autorizzato-di-foto-della-figlia-priscilla-i-bambini-non-sono-strumenti-per-generare-curiosita",
    "status": "publish || draft || pending || private || future",
    "featured_media": 1234
*/
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
const mongoose_1 = __importStar(require("mongoose"));
require("./wordpressSite.model");
const PostSchema = new mongoose_1.Schema({
    siteId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
PostSchema.pre('save', function (next) {
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
PostSchema.index({ siteId: 1, wordpressPostId: 1 }, {
    unique: true,
    partialFilterExpression: { wordpressPostId: { $exists: true } },
});
PostSchema.index({ siteId: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('Post', PostSchema);
