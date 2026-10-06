"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const path_1 = __importDefault(require("path"));
const hbs_1 = __importDefault(require("hbs"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const wordpressSite_routes_1 = __importDefault(require("./routes/wordpressSite.routes"));
const permission_routes_1 = __importDefault(require("./routes/permission.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const article_queue_1 = require("./queues/article.queue");
hbs_1.default.registerHelper("json", function (context) {
    return JSON.stringify(context).replace(/</g, "\\u003c");
});
const app = (0, express_1.default)();
app.set("view engine", "hbs");
app.set("views", path_1.default.join(__dirname, "templates"));
// Serve la cartella public come statica
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// CORS configuration
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:8000",
        "http://192.168.101.252:5173"
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '15mb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration with MongoDB store
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "betmaster-secret-key",
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGODB_URI || "mongodb://mongodb:27017/betmasterleague",
        touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
}));
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/roles", role_routes_1.default);
app.use("/api/permissions", permission_routes_1.default);
app.use("/api/wordpress-sites", wordpressSite_routes_1.default);
app.use("/api/posts", post_routes_1.default);
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
app.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const article = req.body;
        const job = yield article_queue_1.articleQueue.add("process-article", article);
        return res.status(202).json({
            success: true,
            jobId: job.id,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Errore durante l'inserimento dell'articolo in coda",
        });
    }
}));
exports.default = app;
