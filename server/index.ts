import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./services/oauth";
import { registerStorageProxy } from "./services/storageProxy";
import { appRouter } from "./routes";
import { createContext } from "./middleware/context";
import { sdk } from "./services/sdk";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { put } from "@vercel/blob";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();

// Enable CORS for client
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173",
  credentials: true,
}));

// Health check for Nginx/monitoring
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

async function uploadToBlob(file: Express.Multer.File, folder: string) {
  const extension = path.extname(file.originalname).toLowerCase();
  const safeName = `${folder}/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to the deployed project.");
  }
  return put(safeName, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: false,
    token,
  });
}

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(415).json({ error: 'Only image files are allowed' });
    }
    const blob = await uploadToBlob(req.file, 'portfolio/images');
    return res.json({ url: blob.url });
  } catch (error) {
    console.error('[Upload] Image upload failed:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Image upload failed' });
  }
});

app.post('/api/upload-cv', uploadCV.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CV file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(415).json({ error: 'Only PDF files are allowed' });
    }
    const blob = await uploadToBlob(req.file, 'portfolio/cv');
    return res.json({ url: blob.url });
  } catch (error) {
    console.error('[Upload] CV upload failed:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'CV upload failed' });
  }
});

// --- Local Dev Admin Login (bypasses Manus OAuth) ---
if (process.env.NODE_ENV === "development") {
  app.get("/api/dev-login", async (req, res) => {
    try {
      const { upsertUser } = await import("./models/User");
      const devOpenId = "dev-admin-local";

      // Ensure the dev admin user exists in the database
      await upsertUser({
        openId: devOpenId,
        name: "Local Admin",
        email: "admin@localhost",
        loginMethod: "dev",
        role: "admin",
        lastSignedIn: new Date(),
      });

      // Create a session token
      const sessionToken = await sdk.createSessionToken(devOpenId, {
        name: "Local Admin",
        expiresInMs: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      // Set the session cookie
      res.cookie("app_session_id", sessionToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      console.log("[Dev] Admin session created for dev-admin-local");
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[Dev] Dev login failed:", error);
      res.status(500).json({ error: "Dev login failed", details: String(error) });
    }
  });
  console.log("[Dev] Dev login available at /api/dev-login");
}

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Seed initial portfolio data on startup
import("./models/seed").then(({ seedInitialData }) => seedInitialData()).catch(err => console.error("[Database] Seed failed:", err));

// Only listen locally — Vercel provides its own HTTP layer
if (process.env.VERCEL !== "1") {
  const port = parseInt(process.env.PORT || "3001");
  app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

export default app;
