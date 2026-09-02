import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import hbs from "hbs";


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
      "http://192.168.101.252:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
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
//app.use("/api/auth", authRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API dashboard is running",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});


export default app;
