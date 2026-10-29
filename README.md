# Dashboard Articoli

Dashboard per ricevere articoli da un workflow, salvarli come bozze, modificarli
e pubblicarli su uno o piu siti WordPress. Il flusso supporta metadati Yoast SEO,
immagini, categorie e controllo dei duplicati.

## Prerequisiti

### Servizi applicativi

| Servizio | Necessita | Note |
| --- | --- | --- |
| Node.js e npm | Si | Per backend e frontend. |
| MongoDB compatibile con Atlas Vector Search | Si | Il server crea e attende l'indice vector `post_embedding_vector_index` sulla collection `posts`. La definizione usa `embedding` con 1536 dimensioni e `siteId` come filtro. MongoDB deve supportare `$vectorSearch`, `$listSearchIndexes` e `createSearchIndexes`; un MongoDB locale senza Search/Vector Search non basta. |
| Redis | Si | BullMQ usa Redis per la coda `articles`; deve essere raggiungibile per accodare e processare gli articoli. |
| Credenziale API OpenAI | Si | `EMBEDDING_ARTICOLI_AI_KEY` e usata per gli embedding e per il controllo semantico dei duplicati. Senza una chiave valida o credito/API accessibili, l'elaborazione degli articoli fallisce. |
| Credenziali Getty Images | Solo se si richiedono immagini Getty | `GETTY_API_KEY` e `GETTY_API_SECRET` servono per scaricare l'immagine indicata da `gettyDownloadURL`. Se il download o l'upload WordPress fallisce, l'articolo continua senza immagine Getty. |
| Sito WordPress | Si per pubblicare | Deve essere raggiungibile dal backend e avere la REST API WordPress disponibile. |
| Yoast SEO | Solo per sincronizzare i campi SEO | Yoast deve essere installato e attivo. Le sue meta key devono essere registrate ed esposte nella REST API come descritto sotto. |

### Configurazione del backend e del frontend

Configurare le variabili nell'ambiente del servizio backend (non nel codice):

| Variabile | Uso |
| --- | --- |
| `MONGODB_URI` | URI di connessione a MongoDB. Obbligatoria. |
| `REDIS_HOST`, `REDIS_PORT` | Host e porta Redis; i valori predefiniti sono `localhost` e `6379`. In Docker usare il nome host del servizio Redis. |
| `EMBEDDING_ARTICOLI_AI_KEY` | Chiave API OpenAI per embedding e controllo duplicati. |
| `GETTY_API_KEY`, `GETTY_API_SECRET` | Credenziali Getty, se il workflow invia `gettyDownloadURL`. |
| `PORT` | Porta HTTP del backend; predefinita `2567`. |
| `FRONTEND_URL` | Origine del frontend consentita da CORS. |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Segreti distinti e casuali per i token di autenticazione. |

Nel frontend impostare `VITE_API_BASE_URL` all'URL del backend. Se il valore
termina gia in `/api`, viene usato cosi com'e; altrimenti il frontend aggiunge
`/api`. Se la variabile manca, usa il percorso relativo `/api`.

Non inserire chiavi API, password, Application Password WordPress o segreti JWT
nel repository. Usare il sistema di secret management dell'ambiente di
deploy e sostituire/ruotare le credenziali che siano state esposte o committate.

## WordPress: accesso REST e pubblicazione

Per ogni sito registrato nella dashboard:

1. Inserire l'URL WordPress canonico, senza percorsi REST aggiuntivi, ad esempio
   `https://example.it`.
2. Creare un utente WordPress dedicato alla dashboard e generare una
   **Application Password** dal profilo utente. Usare HTTPS in produzione.
3. Configurare sito, username e Application Password nella dashboard e lasciare
   il sito abilitato.
4. Verificare che il backend possa raggiungere
   `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/categories` e
   `/wp-json/wp/v2/media`. Firewall, proxy, plugin di sicurezza o regole WAF
   possono bloccare le richieste REST.

L'utente WordPress deve poter creare e modificare articoli, pubblicarli e
caricare media. Se l'articolo specifica una categoria, la categoria deve gia
esistere su WordPress e il suo nome deve corrispondere esattamente (ignorando
maiuscole/minuscole) al campo `category`. Se non viene trovata, la pubblicazione
viene rifiutata.

## Yoast SEO: abilitare la scrittura REST

Yoast espone informazioni SEO in lettura, ma la dashboard scrive i valori
tramite l'endpoint WordPress standard
`POST /wp-json/wp/v2/posts/{id}`. Per accettare i tre metadati inviati dalla
dashboard, WordPress deve registrare le meta key per il tipo di contenuto `post`
con `show_in_rest` e consentire la modifica all'utente autenticato.

Il modo piu affidabile e creare un piccolo plugin WordPress dedicato, ad
esempio `wp-content/plugins/dashboard-yoast-rest/dashboard-yoast-rest.php`,
con questo contenuto:

```php
<?php
/**
 * Plugin Name: Dashboard Yoast REST Meta
 * Description: Espone in REST i metadati Yoast usati dalla dashboard.
 * Version: 1.0.0
 */

add_action('init', function () {
    $meta_keys = [
        '_yoast_wpseo_focuskw',
        '_yoast_wpseo_title',
        '_yoast_wpseo_metadesc',
    ];

    foreach ($meta_keys as $meta_key) {
        register_post_meta('post', $meta_key, [
            'type'              => 'string',
            'single'            => true,
            'show_in_rest'      => true,
            'auth_callback'     => function ($allowed, $key, $post_id) {
                return current_user_can('edit_post', $post_id);
            },
        ]);
    }
});
```

Attivare il plugin dalla bacheca WordPress. Se si usa un plugin per snippet PHP,
lo snippet deve essere eseguito anche nel contesto REST e non solo nella
bacheca di amministrazione.

| Campo ricevuto dalla dashboard | Meta key WordPress |
| --- | --- |
| `seo.focusKeyphrase` | `_yoast_wpseo_focuskw` |
| `seo.seoTitle` | `_yoast_wpseo_title` |
| `seo.metaDescription` | `_yoast_wpseo_metadesc` |

La sincronizzazione Yoast avviene **dopo** che WordPress ha creato/pubblicato il
post. Se l'endpoint rifiuta i meta, il post resta pubblicato, ma la risposta
della dashboard segnala che i dati SEO non sono stati sincronizzati. Controllare
in quel caso:

- plugin Yoast attivo e meta key corrette per la versione installata;
- plugin di registrazione attivo e registrazione applicata al tipo `post`;
- `show_in_rest` abilitato per tutte e tre le meta key;
- Application Password valida e utente autorizzato a modificare il post;
- REST API non filtrata da firewall, WAF o plugin di sicurezza;
- risposta dell'endpoint di aggiornamento nei log del backend e di WordPress.

`seo.slug` e `seo.excerpt` aggiornano invece i campi standard dello stesso post
WordPress. `seo.imageAlt`, quando un media e disponibile, aggiorna `alt_text`
del media tramite `/wp-json/wp/v2/media/{id}`; non e una meta key Yoast.
`seo.imageAltNote` e `seo.secondaryKeywords` vengono conservati dalla dashboard
ma non sincronizzati con meta Yoast.

## Formato del webhook articolo

Il workflow invia un `POST` JSON al percorso radice del backend (`/`). Il body
deve includere `nomeSito`, `articleTitle` e `articleText`; gli altri campi sono
opzionali.

```json
{
  "nomeSito": "kiss kiss staging",
  "articleTitle": "Titolo articolo",
  "articleText": "<h1>Titolo articolo</h1><h2 id=\"sezione\">Sezione</h2><p>Testo...</p>",
  "articleURL": "https://example.it/articolo",
  "articleDate": "2026-10-28T14:33:23.000Z",
  "category": "Cronaca Italia",
  "imageThumbURL": "https://example.it/immagine.jpg",
  "gettyImageId": "123456",
  "gettyImageTitle": "Titolo immagine",
  "gettyDownloadURL": "https://api.gettyimages.com/v3/downloads/images/123456",
  "gettyProductType": "premiumaccess",
  "gettyAgreementName": "Accordo licenza",
  "seo": {
    "focusKeyphrase": "Parola chiave",
    "seoTitle": "Titolo SEO",
    "metaDescription": "Descrizione SEO",
    "slug": "slug-articolo",
    "imageAlt": "Testo alternativo dell'immagine",
    "imageAltNote": "Nota per la compilazione dell'ALT",
    "excerpt": "Riassunto dell'articolo",
    "secondaryKeywords": "keyword uno, keyword due"
  }
}
```

`articleDate` deve essere una data interpretabile da JavaScript, preferibilmente
in formato ISO 8601. `articleText` e HTML: le virgolette escaped dentro i tag
vengono normalizzate dal worker. Se sono presenti titoli `h2`, il worker genera
un indice con link interni quando non ne trova gia uno che punti a quegli
heading. Inviare JSON valido e mantenere il testo HTML come stringa.

La risposta `202` indica che il job e stato accodato, non che sia gia stato
elaborato. Il worker verifica il sito abilitato, controlla i duplicati, prova
eventualmente a scaricare/caricare l'immagine e salva l'articolo come bozza
locale.

**Proteggere il webhook:** il percorso radice che accoda gli articoli non
richiede attualmente autenticazione applicativa. In produzione renderlo
raggiungibile solo dal workflow fidato, usando firewall, rete privata o un
reverse proxy con autenticazione. Non esporlo pubblicamente senza protezione.

## Flusso e dipendenze operative

1. Il webhook riceve e valida il payload, poi accoda un job BullMQ in Redis.
2. Il worker cerca un sito abilitato il cui nome corrisponda esattamente a
   `nomeSito`.
3. OpenAI crea un embedding da titolo e HTML; MongoDB Vector Search cerca
   possibili duplicati. Quando un candidato supera la soglia configurata, OpenAI
   esegue un secondo controllo semantico.
4. Se l'articolo non e duplicato, il worker tenta il download Getty solo se
   arriva `gettyDownloadURL`. Errori Getty o upload media WordPress vengono
   registrati e il flusso prosegue senza immagine.
5. Il post e salvato localmente come bozza. In seguito un utente autorizzato lo
   puo modificare e pubblicare dalla dashboard.
6. La pubblicazione usa la REST API WordPress. Se ci sono metadati SEO, prova
   anche a scrivere i tre campi Yoast descritti sopra.

| Sintomo | Dipendenza da controllare |
| --- | --- |
| Il server non si avvia | `MONGODB_URI`, raggiungibilita MongoDB, permessi MongoDB, supporto Vector Search e indice pronto, Redis raggiungibile. |
| Il webhook non restituisce `202` | Body JSON valido e campi obbligatori `nomeSito`, `articleTitle`, `articleText`; connettivita Redis. |
| Il job fallisce prima di salvare la bozza | Nome sito inesistente/disabilitato, chiave OpenAI, credito o permessi API, Vector Search/index, errori MongoDB. |
| La bozza viene salvata senza immagine | `gettyDownloadURL`, credenziali/permessi Getty, risposta immagine JPEG, raggiungibilita REST media WordPress, capacita e limiti upload del server. Il worker continua senza immagine in caso di errore. |
| La pubblicazione WordPress fallisce | URL e REST API, Application Password, permessi dell'utente, categoria non esistente/non corrispondente, media o regole di sicurezza del sito. |
| Il post si pubblica ma i meta Yoast no | Meta key non registrate con `show_in_rest`, plugin custom non attivo, capability `edit_post` negata, Yoast non attivo o REST filtrata. La dashboard mostra un avviso e conserva la pubblicazione. |

## Avvio e build

Installare le dipendenze separatamente:

```bash
cd server
npm install

cd ../client
npm install
```

Avviare Redis e MongoDB compatibile con Vector Search, configurare le variabili
d'ambiente e poi avviare i processi in terminali separati:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Per generare il frontend:

```bash
cd client
npm run build
```
