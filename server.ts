import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { analyzePrescriptionBase64 } from "./api/scan.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "20mb" }));

  // Vercel-compatible API route for prescription scanning
  app.post("/api/scan", async (req, res) => {
    const { image, mimeType, targetLang } = req.body || {};
    try {
      const result = await analyzePrescriptionBase64(
        image,
        mimeType,
        targetLang
      );
      res.status(200).json(result);
    } catch (error: any) {
      const fallback = await analyzePrescriptionBase64(
        undefined,
        mimeType,
        targetLang
      );
      res.status(200).json(fallback);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    let viteMiddleware: any = null;
    const { createServer: createViteServer } = await import("vite");

    // Start listening immediately so port 3000 is ready without waiting
    app.use((req, res, next) => {
      if (viteMiddleware) {
        return viteMiddleware(req, res, next);
      }
      next();
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Maatra server running on http://0.0.0.0:${PORT}`);
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    viteMiddleware = vite.middlewares;
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath, { maxAge: "1d" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Maatra server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();
