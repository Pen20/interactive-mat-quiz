// server/index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import openaiRouter from "./openaiRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, ".."); // project root

const app = express();

/* ---------- security & performance ---------- */
app.set("trust proxy", 1); // needed if behind a proxy (Render/Heroku/Nginx)
app.use(
  helmet({
    contentSecurityPolicy: false, // keep simple; tighten later if desired
  })
);
app.use(compression());

// During development allow any origin; set FRONTEND_ORIGIN in prod.
const ORIGIN = process.env.FRONTEND_ORIGIN || true; // e.g. "https://yourdomain.com"
app.use(cors({ origin: ORIGIN }));

// Limit body size (protects your OpenAI proxy)
app.use(express.json({ limit: "200kb" }));

/* ---------- static assets ---------- */
// Serve only the asset folders publicly (avoid exposing /html directly)
app.use(
  "/css",
  express.static(path.join(ROOT, "css"), { maxAge: "1d", etag: true })
);
app.use(
  "/js",
  express.static(path.join(ROOT, "js"), { maxAge: "1d", etag: true })
);
app.use(
  "/assets",
  express.static(path.join(ROOT, "assets"), { maxAge: "7d", etag: true })
);

/* ---------- API (rate-limited) ---------- */
const openaiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/openai", openaiLimiter, openaiRouter);

/* ---------- pages ---------- */
// Home page (no-cache for HTML)
app.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(ROOT, "index.html"));
});

// Whitelist quiz pages under /html to avoid path traversal
const QUIZ_PAGES = new Set([
  "algebra-quiz.html",
  "equations-quiz.html",
  "determinant-quiz.html",
]);

app.get("/html/:page", (req, res, next) => {
  const { page } = req.params;
  if (!QUIZ_PAGES.has(page)) return next(); // 404 handler
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(ROOT, "html", page));
});

// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// 404 handler (don’t serve index.html for unknown paths)
app.use((_req, res) => {
  res.status(404).send("Not Found");
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3080;
// Bind to 0.0.0.0 so phones on the same network can access it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
