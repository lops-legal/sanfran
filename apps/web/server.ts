import express from "express";
import cron from "node-cron";
import { requireRole } from "./middleware/rbac";
import { skillsRouter } from "./server/skillsRoutes";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", skillsRouter);

// Account deletion endpoint – placeholder implementation with RBAC
app.delete("/api/account/delete", requireRole(["user", "admin"]), (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  console.log(`Account deletion requested for userId=${userId}`);
  return res.json({ status: "deleted", userId });
});

// Lex Chat chatbot endpoint — proxies to FastAPI backend (port 8000) which uses NVIDIA API
app.post("/api/lex-chat", async (req, res) => {
  try {
    const backendUrl = process.env.LEX_BACKEND_URL || "http://localhost:8000/api/lex-chat";
    const fetchModule = await import("node-fetch");
    const fetch = fetchModule.default as any;
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return res.status(backendRes.status).json({ error: "Backend error", details: errorText });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    backendRes.body.pipe(res);
  } catch (error: any) {
    console.error("Error proxying to FastAPI:", error);
    res.status(502).json({ error: "Backend FastAPI indisponível.", details: error.message });
  }
});

/* Scheduled retention job – runs daily at midnight */
cron.schedule('0 0 * * *', () => {
  const { execSync } = require('child_process');
  try {
    console.log('Running retention job (daily)...');
    execSync('bash ../scripts/retention_job.sh', { stdio: 'inherit' });
    console.log('Retention job completed.');
  } catch (err) {
    console.error('Retention job failed', err);
  }
});

// Vite middleware development setup or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware.");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 3001 }
      },
      appType: "spa",
      clearScreen: false,
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Sanfran.md</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // produção...
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sanfran.md server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});