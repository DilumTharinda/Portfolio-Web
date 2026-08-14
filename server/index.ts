import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./services/oauth";
import { registerStorageProxy } from "./services/storageProxy";
import { appRouter } from "./routes";
import { createContext } from "./middleware/context";
import { sdk } from "./services/sdk";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Enable CORS for client running on port 5173
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
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
  try {
    const { seedInitialData } = await import("./models/seed");
    await seedInitialData();
    console.log("[Database] Initial data seeding checked/completed.");
  } catch (err) {
    console.error("[Database] Seed failed on startup:", err);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
