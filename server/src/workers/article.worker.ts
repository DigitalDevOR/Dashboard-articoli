import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.config";
import type { Article } from "../types/article.types";
import WordpressSite from "../models/wordpressSite.model";
import Post from "../models/post.models";
import {
  checkArticleDuplicate,
} from "../services/postSimilarity.service";
import {
  downloadGettyImage,
} from "../services/gettyImages.service";
import {
  uploadImageToWordpress,
  updateWordpressImageAltText,
} from "../services/wordpress.service";
import {
  addTableOfContents,
  normalizeArticleHtml,
} from "../services/manipolazioneHtml.service"

async function processArticle(
  article: Article
): Promise<void> {

  /*
   * STEP 1
   * Verifica presenza del nome del sito.
   */
  if (!article.nomeSito?.trim()) {
    throw new Error(
      "nomeSito mancante nell'articolo ricevuto"
    );
  }

  /*
   * STEP 2
   * Recuperiamo il sito WordPress associato
   * al nome ricevuto dal workflow n8n.
   */
  const site = await WordpressSite.findOne({
    name: article.nomeSito.trim(),
    enabled: true,
  });

  if (!site) {
    throw new Error(
      `Sito WordPress non trovato o disabilitato: "${article.nomeSito}"`
    );
  }

  const articleHtml = normalizeArticleHtml(article.articleText);

  console.log(
    `Sito associato: ${site.name} (${site._id.toString()})`
  );

  /*
   * STEP 3
   * Controllo duplicato.
   *
   * checkArticleDuplicate:
   *
   * - genera UNA SOLA VOLTA l'embedding
   * - esegue MongoDB Vector Search
   * - recupera il post più simile
   * - se similarityScore >= 0.90
   *   interroga la LLM
   *
   * Restituisce anche l'embedding,
   * così lo riutilizziamo successivamente
   * per salvare il Post.
   */
  const duplicateCheck = await checkArticleDuplicate(
    site._id.toString(),
    article.articleTitle,
    articleHtml
  );

  const {
    isDuplicate,
    embedding,
  } = duplicateCheck;

  /*
   * Un duplicato NON è un errore tecnico.
   *
   * Interrompiamo semplicemente il flusso
   * senza fare throw.
   */
  if (isDuplicate) {
    console.log(
      `Articolo duplicato: "${article.articleTitle}". Elaborazione interrotta.`
    );

    return;
  }

  console.log(
    `Articolo nuovo: "${article.articleTitle}". Continuo elaborazione.`
  );

  /*
   * STEP 4
   * Download Getty opzionale.
   *
   * Se:
   *
   * - gettyDownloadURL non esiste
   * - Getty restituisce errore
   * - Getty restituisce un'immagine vuota
   *
   * continuiamo comunque senza immagine.
   */
  let imageBuffer: Buffer | null = null;

  if (article.gettyDownloadURL?.trim()) {
    try {
      imageBuffer = await downloadGettyImage(
        article.gettyDownloadURL
      );

      if (!imageBuffer.length) {
        console.warn(
          `Getty ha restituito un'immagine vuota per "${article.articleTitle}". Continuo senza immagine.`
        );

        imageBuffer = null;
      } else {
        console.log(
          `Immagine Getty scaricata correttamente: ${imageBuffer.length} bytes`
        );
      }

    } catch (error) {
      console.error(
        `Errore download Getty per "${article.articleTitle}". Continuo senza immagine:`,
        error
      );

      imageBuffer = null;
    }

  } else {
    console.log(
      `Nessuna immagine Getty disponibile per "${article.articleTitle}". Continuo senza immagine.`
    );
  }

  /*
   * STEP 5
   * Upload immagine WordPress opzionale.
   *
   * Questi valori resteranno undefined
   * se non abbiamo immagine o se l'upload fallisce.
   */
  let wordpressImageId: number | undefined;
  let imageUrl: string | undefined;

  if (imageBuffer) {
    try {

      const fileName = article.gettyImageId?.trim()
        ? `${article.gettyImageId}.jpg`
        : `article-image-${Date.now()}.jpg`;

      const wordpressMedia =
        await uploadImageToWordpress(
          site,
          imageBuffer,
          fileName
        );

      /*
       * Controlliamo che WordPress abbia restituito
       * almeno un ID media valido.
       */
      if (
        !wordpressMedia ||
        typeof wordpressMedia.id !== "number"
      ) {
        console.warn(
          `Upload WordPress completato ma risposta media non valida per "${article.articleTitle}". Continuo senza immagine.`
        );

      } else {
        wordpressImageId =
          wordpressMedia.id;

        if (
          typeof wordpressMedia.source_url === "string" &&
          wordpressMedia.source_url.trim()
        ) {
          imageUrl =
            wordpressMedia.source_url;
        }

        console.log(
          `Immagine caricata su WordPress correttamente. Media ID: ${wordpressImageId}`
        );

        if (imageUrl) {
          console.log(
            `WordPress image URL: ${imageUrl}`
          );
        }
      }

    } catch (error) {

      /*
       * Anche l'errore upload WordPress
       * NON interrompe l'elaborazione.
       */
      console.error(
        `Errore upload immagine su WordPress per "${article.articleTitle}". Continuo senza immagine:`,
        error
      );

      wordpressImageId = undefined;
      imageUrl = undefined;
    }

  } else {
    console.log(
      `Nessuna immagine da caricare su WordPress per "${article.articleTitle}".`
    );
  }

  /*
   * STEP 6
   * Creazione del Post nel database.
   *
   * Riutilizziamo l'embedding già generato
   * durante il controllo duplicati.
   *
   * NON viene effettuata una seconda chiamata
   * OpenAI per generare l'embedding.
   */
  const post = await Post.create({
    siteId: site._id,

    title:
      article.articleTitle.trim(),

    content:
      addTableOfContents(articleHtml),

    category:
      article.category?.trim() || undefined,

    excerpt:
      article.seo?.excerpt ?? undefined,

    slug:
      article.seo?.slug || undefined,

    sourceUrl:
      article.articleURL?.trim() || undefined,

    sourcePublishedAt:
      article.articleDate && !Number.isNaN(Date.parse(article.articleDate))
        ? new Date(article.articleDate)
        : undefined,

    seo: article.seo,

    status:
      "draft",

    /*
     * Se l'upload WordPress è riuscito
     * questi valori saranno presenti.
     *
     * Altrimenti rimarranno undefined.
     */
    imageUrl: imageUrl ?? article.imageThumbURL,

    wordpressImageId,

    /*
     * L'immagine caricata diventa anche
     * la featured image del Post.
     */
    featuredMedia:
      wordpressImageId,

    /*
     * Embedding già generato nello STEP 3.
     */
    embedding,
  });

  if (wordpressImageId && article.seo?.imageAlt?.trim()) {
    try {
      await updateWordpressImageAltText(
        site,
        wordpressImageId,
        article.seo.imageAlt.trim(),
      );
    } catch (error) {
      console.error(
        `Impossibile aggiornare il testo alternativo dell'immagine per "${article.articleTitle}":`,
        error,
      );
    }
  }

  console.log(
    `Post creato nel database: "${post.title}" (${post._id.toString()})`
  );
}


export const startArticleWorker = (): Worker<Article> => {

  const worker = new Worker<Article>(
    "articles",

    async (job) => {
      try {

        const article = job.data;

        console.log(
          `Elaborazione articolo: "${article.articleTitle}"`
        );

        await processArticle(article);

      } catch (error) {

        console.error(
          `Errore elaborazione job ${job.id}:`,
          error
        );

        /*
         * Gli errori tecnici reali vengono rilanciati.
         *
         * BullMQ considererà il job FAILED.
         */
        throw error;
      }
    },

    {
      connection: redisConnection,
    }
  );


  /*
   * Job terminato correttamente.
   *
   * Anche un articolo duplicato viene
   * considerato COMPLETED perché il flusso
   * termina con un semplice return.
   */
  worker.on("completed", (job) => {
    console.log(
      `Job ${job.id} completato`
    );
  });


  /*
   * Errore tecnico nel processor.
   */
  worker.on("failed", (job, error) => {
    console.error(
      `Job ${job?.id} fallito:`,
      error
    );
  });


  /*
   * Errori generali Worker / Redis.
   */
  worker.on("error", (error) => {
    console.error(
      "Errore Worker:",
      error
    );
  });


  return worker;
};