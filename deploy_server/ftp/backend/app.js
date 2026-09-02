"use strict";
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
        "http://192.168.101.252:5173"
    ],
    credentials: true,
}));
app.use(express_1.default.json());
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
//app.use("/api/auth", authRoutes);
// Health check
app.get("/", (req, res) => {
    res.json({
        message: "API dashboard is running",
        status: "running",
        timestamp: new Date().toISOString(),
    });
});
exports.default = app;
