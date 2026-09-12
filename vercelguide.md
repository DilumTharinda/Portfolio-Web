# Deploying to Vercel (Frontend + Backend)

## Read this first — what's different about Vercel

Vercel doesn't run a persistent server like your VM did. Instead, your Express app runs as a **serverless function** — it wakes up per request, runs, and shuts down. Two direct consequences for your specific app:

1. **No local file storage.** Your `multer.diskStorage` code in `index.ts` writes uploaded images to a folder on disk (`server/public/uploads`). On Vercel, that folder is wiped after every request — uploaded images would vanish immediately. You need to upload to cloud object storage instead. Good news: your `package.json` already includes `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`, and there's a `server/services/storageProxy.ts` file already in your repo — this strongly suggests the app was originally built with S3-style uploads in mind before the disk-based multer code was added later. I'll show you the disk→S3 swap below, but I'd need to see `storageProxy.ts`'s actual contents to give you the exact working code rather than a generic guess — paste it if you want the precise patch instead of a fill-in-the-blanks version.

2. **No MySQL container.** Vercel hosts no databases. You need an external always-on MySQL, same as we discussed — **Aiven's free tier** is the natural fit here.

Also: your server currently calls `app.listen(port, ...)` inside a `startServer()` async function that also does port-scanning logic (`findAvailablePort`) — none of that applies on Vercel, which manages the HTTP layer itself. The fix (shown in Part 3) is to export the Express `app` object directly and only call `.listen()` when running locally.

---

## Part 1 — Set up Aiven MySQL (the database)

**1.** Go to `https://aiven.io` → **Sign up** (no card required).

**2.** Click **Create service** → select **MySQL**.

**3.** Choose a cloud/region (any, doesn't need to match Vercel's).

**4.** Select the **Free plan**.

**5.** Name it `portfolio-db` → **Create service**. Wait a few minutes for it to provision (status turns green).

**6.** Click into the service → **Overview** tab → copy the **Service URI** (looks like `mysql://avnadmin:PASSWORD@host:port/defaultdb?ssl-mode=REQUIRED`). This is your `DATABASE_URL`.

**7.** Note: Aiven's free MySQL requires SSL — your `drizzle.config.ts` and `DATABASE_URL` connection both need to allow that. If your `drizzle-orm`/`mysql2` setup doesn't already pass SSL options, this is one of the things worth checking once you're testing the connection (Part 6).

---

## Part 2 — Handle file uploads (S3-compatible storage)

Pick one:

**Option A — Vercel Blob (simplest, native to Vercel, has a free tier)**
- In your Vercel project dashboard (after Part 4): **Storage** tab → **Create Database** → **Blob** → follow prompts. Gives you a `BLOB_READ_WRITE_TOKEN` env var automatically.
- Requires swapping your upload code to use `@vercel/blob`'s `put()` function instead of multer's disk storage.

**Option B — AWS S3 (matches your existing dependencies)**
- Create a free-tier AWS account, create an S3 bucket, generate an IAM user with `s3:PutObject`/`s3:GetObject` permissions, get `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.
- Since your app already imports `@aws-sdk/client-s3`, this likely requires the least new code — but I need to see `storageProxy.ts` to confirm whether it's already wired for this or needs updating.

Tell me which you'd rather use, and share `storageProxy.ts` if you have it — I'll give you the exact code change instead of leaving this as a gap.

---

## Part 3 — Modify `server/index.ts` to export the app instead of listening directly

Find this part of your file:
```ts
async function startServer() {
  const app = express();
  const server = createServer(app);
  // ... all your middleware/routes ...
  server.listen(port, () => { ... });
}
startServer().catch(console.error);
```

Restructure it so the Express app is created and configured at the top level, and only calls `.listen()` when not running on Vercel:

```ts
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ... registerStorageProxy(app), registerOAuthRoutes(app), your /api/upload route
//     (rewritten for S3/Blob instead of disk storage — see Part 2),
//     the tRPC middleware, the dev-login route, etc. — same as before,
//     just no longer inside an async startServer() wrapper ...

// Only listen locally — Vercel provides its own HTTP layer
if (process.env.VERCEL !== "1") {
  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

export default app;
```

The one-time startup seeding (`seedInitialData()`) also needs to move outside the removed `startServer()` wrapper — call it once at module load, wrapped in a top-level `try/catch` (not `await`, since top-level await behaves inconsistently across serverless cold starts):
```ts
import("./models/seed").then(({ seedInitialData }) => seedInitialData()).catch(err => console.error("[Database] Seed failed:", err));
```

---

## Part 4 — Create `vercel.json` at your project root

Vercel now supports zero-config Express deployment (as of mid-2026) if your app is exported from an `index.ts`/`server.ts`/`app.ts` at the root — but your structure is a monorepo (`client/` + `server/`), so we still need to tell Vercel explicitly where the frontend build and backend function live.

```json
{
  "buildCommand": "npm run build:client",
  "outputDirectory": "client/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then create a thin entry file Vercel can find at the root:
```
mkdir -p api
```
```ts
// api/index.ts
export { default } from "../server/index";
```

---

## Part 5 — Push these changes to GitHub

```
git add -A
git commit -m "chore: adapt server for Vercel serverless deployment"
git push
```

---

## Part 6 — Import the project into Vercel

**1.** Go to `https://vercel.com` → sign in with GitHub.

**2.** Click **Add New → Project**.

**3.** Select `DilumTharinda/Portfolio-Web` from your repo list → **Import**.

**4.** Framework Preset: Vercel should detect **Vite**. Leave Build Command/Output Directory as whatever your `vercel.json` specifies (it should auto-read from the file).

**5.** Expand **Environment Variables** and add all of these (same values you used on the VM, minus anything VM-specific):
```
NODE_ENV=production
DATABASE_URL=<your Aiven Service URI from Part 1>
CORS_ORIGIN=https://dilumtharinda.tech
VITE_APP_ID=my-portfolio-app
JWT_SECRET=<generate with: openssl rand -hex 32>
OWNER_OPEN_ID=admin@production
ADMIN_PASSWORD=<choose one>
OAUTH_SERVER_URL=http://localhost:4000
```
Plus whichever S3/Blob credentials you set up in Part 2.

**6.** Click **Deploy**. Watch the build logs — this is where any leftover build errors (missing deps, path issues) will surface.

---

## Part 7 — Run the database migration

Vercel doesn't give you SSH access, so run `drizzle-kit push` from your own laptop instead, pointed at Aiven:

```
cd /path/to/your/local/repo
DATABASE_URL="your-aiven-uri" npx drizzle-kit push --config drizzle.config.ts
```

---

## Part 8 — Point your domain at Vercel

**1.** In your Vercel project → **Settings → Domains** → add `dilumtharinda.tech` and `www.dilumtharinda.tech`.

**2.** Vercel shows you the DNS records to add. Typically:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`

**3.** Go to your get.tech DNS dashboard and update these records to match exactly what Vercel shows you (the values can change, always use what's shown in your own dashboard, not just the example above).

**4.** Wait for propagation, then Vercel automatically issues and manages your HTTPS certificate — no Certbot needed, ever.

---

## Part 9 — Delete the old GitHub Actions workflow

Your `.github/workflows/deploy.yml` SSHes into a VM that no longer exists in this setup — Vercel deploys automatically on every push by itself, no workflow file needed:

```
git rm .github/workflows/deploy.yml
git commit -m "remove VM deploy workflow, Vercel auto-deploys now"
git push
```

---

## What you gain vs. the VM approach

No more SSH, no more Nginx, no more PM2, no more Certbot renewal, no more risk of an idle-instance reclamation wiping everything out — Vercel's free tier has no such expiry trap. Trade-off: less control, and the two architectural changes above (uploads, DB) are permanent, not optional.

---

## Next steps

Share `server/services/storageProxy.ts` and confirm whether you want S3 or Vercel Blob for uploads, and I'll give you the exact working code for Part 2 and the upload route in Part 3, instead of the general pattern shown here.