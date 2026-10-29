import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import hbs from "hbs";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import roleRoutes from "./routes/role.routes";
import cookieParser from "cookie-parser";
import wordpressSiteRoutes from "./routes/wordpressSite.routes";
import permissionRoutes from "./routes/permission.routes";
import postRoutes from "./routes/post.routes";
import { articleQueue } from "./queues/article.queue";
import type { Article } from "./types/article.types";
import { readFile, writeFile, mkdir } from "fs/promises";


const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isArticleSeo = (value: unknown) =>
  isRecord(value) &&
  Object.values(value).every(
    (field) => field === null || typeof field === "string",
  );

const isArticle = (value: unknown): value is Article => {
  if (
    !isRecord(value) ||
    typeof value.nomeSito !== "string" ||
    typeof value.articleTitle !== "string" ||
    typeof value.articleText !== "string"
  ) {
    return false;
  }

  const optionalStringFields = [
    "articleURL",
    "articleDate",
    "category",
    "imageThumbURL",
    "gettyImageId",
    "gettyImageTitle",
    "gettyDownloadURL",
    "gettyProductType",
    "gettyAgreementName",
  ];

  return optionalStringFields.every(
    (field) => value[field] === undefined || typeof value[field] === "string",
  ) && (value.seo === undefined || isArticleSeo(value.seo));
};

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context).replace(/</g, "\\u003c");
});

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "templates"));

// Serve la cartella public come statica
app.use(express.static(path.join(__dirname, "public")));

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8000",
      "http://192.168.101.252:5173"
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "betmaster-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://mongodb:27017/betmasterleague",
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/wordpress-sites", wordpressSiteRoutes);
app.use("/api/posts", postRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API dashboard is running",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

/*app.post("/", async (req, res) => {
  try {
    const request = req.body ?? {};
    const requestJsonPath = path.join(__dirname, "request.json");
    const outputJsonPath = path.join(__dirname, "data", "config.json");

    let fileData = {};

    try {
      const fileRead = await readFile(requestJsonPath, "utf-8");
      if (fileRead.trim()) {
        fileData = JSON.parse(fileRead);
      }
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        console.warn("request.json is empty or malformed, continuing with empty object:", error.message);
      }
    }

    await mkdir(path.dirname(outputJsonPath), { recursive: true });
    await writeFile(
      outputJsonPath,
      JSON.stringify({ ...fileData, ...request }, null, 2),
      "utf-8"
    );

    res.status(200).json({
      success: true,
      message: "Dati salvati correttamente",
      data: request,
    });
  } catch (error) {
    console.error("Error saving request data:", error);
    res.status(500).json({
      success: false,
      message: "Errore nel salvataggio dei dati",
    });
  }
});
*/
app.post("/", async (req, res) => {
  try {
    const article: unknown = req.body;

    if (!isArticle(article)) {
      return res.status(400).json({
        success: false,
        message:
          "Articolo non valido: nomeSito, articleTitle e articleText sono obbligatori; i campi SEO devono essere stringhe o null.",
      });
    }

    const job = await articleQueue.add(
      "process-article",
      article
    );

    return res.status(202).json({
      success: true,
      jobId: job.id,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Errore durante l'inserimento dell'articolo in coda",
    });

  }
});

export default app;
