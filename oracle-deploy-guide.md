# Deploying "executive-tech-portfolio" to Oracle Cloud Free Tier (with GitHub Actions CI/CD)

Your repo layout:

```
portfolio/
├─ client/        Vite + React 19, builds a static SPA
├─ server/        Express + tRPC API, MySQL via Drizzle
├─ drizzle/        schema + migrations
└─ package.json    root orchestrator (dev:client / dev:server / build:client / build:server)
```

**Target architecture on the VM**

```
Internet → Nginx (80/443, TLS) ─┬─► static files: client/dist  (SPA)
                                  └─► reverse proxy /api, /uploads → Node (PM2, 127.0.0.1:3000)
                                                              │
                                                              └─► MySQL (Docker container on same VM)
```
Nginx serves the frontend and the backend on the **same domain**, so you don't need CORS in production at all — one less thing to break.

CI/CD: GitHub Actions builds nothing on GitHub — it SSHes into your Oracle VM, pulls the latest code, builds it there (the Ampere A1 free VM has plenty of RAM for this), runs DB migrations, and restarts PM2. Push to `main` → live in ~30–60s.

---

## Part 0 — Code changes needed before you deploy

### 0.1 Server: bind to all interfaces + configurable CORS origin

Open `server/index.ts` and make two changes.

**a) CORS origin from env, not hardcoded to localhost:**

```ts
// server/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:5173",
  credentials: true,
}));
```

**b) Bind explicitly to 0.0.0.0 and add a health check** (Nginx/monitoring will use it):

```ts
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ...

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}/`);
});
```

> Since Nginx will put both the client and `/api` behind the same domain in production, `CORS_ORIGIN` mainly matters for local dev — you can leave it pointing at `http://localhost:5173` there and set it to your real domain only if you ever split origins.

### 0.2 Remove sandbox-only Vite plugins from the production build

Your uploaded `vite_config_ts.bak` and the client's `vite.config.ts` reference `vite-plugin-manus-runtime`, `vite-plugin-web-dev-previewer`, and `jsxLocPlugin` — these are dev-sandbox tools that may not resolve or may misbehave outside that environment. Guard them so a production build never depends on them:

```ts
// client/vite.config.ts
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

const devPlugins = isDev
  ? await Promise.all([
      import("@builder.io/vite-plugin-jsx-loc").then(m => m.jsxLocPlugin()),
      import("vite-plugin-web-dev-previewer").then(m => m.webDevPreviewerPlugin()),
      import("vite-plugin-manus-runtime").then(m => m.default()),
    ])
  : [];

export default defineConfig({
  plugins: [react(), ...devPlugins],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "..", "shared"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
```

Adjust the alias paths to match whatever your real `client/vite.config.ts` currently has — the point is only: **wrap the three sandbox plugins in an `isDev` check** so `npm run build` never needs them.

### 0.3 Add a root-level build script

```jsonc
// package.json (root)
"scripts": {
  "dev:client": "npm run dev --prefix client",
  "dev:server": "npm run dev --prefix server",
  "build:client": "npm run build --prefix client",
  "build:server": "npm run build --prefix server",
  "build": "npm run build:client && npm run build:server",
  "db:push": "npm run db:push --prefix server"
}
```

### 0.4 Serve uploads from a persistent path

`server/index.ts` writes uploads to `server/public/uploads`. On redeploys this folder will be wiped if it's inside the git-tracked build path. Point it outside the repo:

```ts
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "public/uploads");
```

and set `UPLOAD_DIR=/var/www/portfolio/uploads` in production (created once, outside the repo checkout, so `git pull` never touches it).

### 0.5 Commit these changes, push to GitHub

```bash
git add -A
git commit -m "chore: production-ready config (env CORS, host binding, guarded dev plugins)"
git push origin main
```

If your code isn't on GitHub yet:

```bash
cd /path/to/portfolio
git init
git add -A
git commit -m "initial commit"
gh repo create your-username/portfolio --private --source=. --push
# or manually: create the repo on github.com, then
git remote add origin git@github.com:your-username/portfolio.git
git branch -M main
git push -u origin main
```

---

## Part 1 — Provision the Oracle Cloud VM

1. **Console → Compute → Instances → Create Instance**
2. Name: `portfolio-vm`
3. **Image and shape → Change shape**: choose **Ampere (Arm-based)**, shape `VM.Standard.A1.Flex`, **2 OCPU / 12 GB RAM** (leaves headroom in the 4 OCPU / 24 GB Always-Free allotment for a 2nd instance later; use all 4/24 on one VM if you prefer).
   - Image: **Ubuntu 24.04 (Canonical Ubuntu)** — Always Free eligible.
   - If Ampere capacity shows "out of capacity" in your region, retry later or pick a different Always Free-eligible availability domain.
4. **Networking**: create a new VCN with the wizard defaults (public subnet), and check **"Assign a public IPv4 address."**
5. **Add SSH keys**: generate a keypair locally and paste the public key:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/oracle_portfolio -C "portfolio-deploy"
   ```
   Paste the contents of `~/.ssh/oracle_portfolio.pub` into the console.
6. **Boot volume**: default 50 GB is fine (Always Free covers up to 200 GB total across volumes).
7. Click **Create**, wait for it to reach "Running," and note the **public IP**.

### 1.1 Open the required ports in the Security List (this is the #1 thing people forget)

Console → your VCN → **Security Lists** → default security list → **Add Ingress Rules**:

| Source CIDR | Protocol | Port |
|---|---|---|
| 0.0.0.0/0 | TCP | 22 (SSH — already present) |
| 0.0.0.0/0 | TCP | 80 (HTTP) |
| 0.0.0.0/0 | TCP | 443 (HTTPS) |

Ubuntu images on OCI also ship with `iptables`/`netfilter-persistent` rules that block everything except SSH by default — you'll open those on the VM itself in Part 2.

### 1.2 (Optional but recommended) Reserve the public IP

Console → **Networking → IP Management → Reserved Public IPs** → create one and attach it to the instance's VNIC, so the IP survives a stop/start. Point your domain's `A` record at this IP now if you have one.

---

## Part 2 — Initial server setup

SSH in:

```bash
ssh -i ~/.ssh/oracle_portfolio ubuntu@<VM_PUBLIC_IP>
```

### 2.1 Open the OS firewall

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 2.2 Base packages, Node.js 22 LTS, PM2, Nginx

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git ufw

node -v   # v22.x
npm -v

sudo npm install -g pm2

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2.3 MySQL via Docker (simplest, fully self-contained on the free VM)

```bash
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# log out and back in for the group change to apply
exit
```
```bash
ssh -i ~/.ssh/oracle_portfolio ubuntu@<VM_PUBLIC_IP>

mkdir -p ~/mysql-data
docker run -d \
  --name portfolio-mysql \
  --restart unless-stopped \
  -e MYSQL_ROOT_PASSWORD='CHANGE_ME_STRONG_PASSWORD' \
  -e MYSQL_DATABASE=portfolio \
  -p 127.0.0.1:3306:3306 \
  -v ~/mysql-data:/var/lib/mysql \
  mysql:8.4
```
`-p 127.0.0.1:3306:3306` binds MySQL to localhost only — it's never exposed to the internet, only reachable from the Node app on the same box.

> **Alternative:** Oracle's Always Free tier also includes a standalone **MySQL HeatWave DB System** (50 GB). It's managed (backups, patching) but lives inside your VCN and needs a private endpoint + slightly more networking setup. For a portfolio site, the Docker container above is simpler and perfectly adequate; switch to HeatWave later if you want managed backups — same `DATABASE_URL` connection string either way.

### 2.4 Clone the repo and do a first manual deploy (to make sure everything works before wiring up CI)

```bash
sudo mkdir -p /var/www/portfolio
sudo chown ubuntu:ubuntu /var/www/portfolio
git clone git@github.com:your-username/portfolio.git /var/www/portfolio
# if the repo is private and you don't want to manage a deploy key here yet,
# clone over HTTPS with a fine-scoped GitHub PAT instead:
# git clone https://<TOKEN>@github.com/your-username/portfolio.git /var/www/portfolio

cd /var/www/portfolio
mkdir -p uploads   # persistent upload dir, outside the git tree structure the app writes to
```

Create the production env file (**not committed to git**):

```bash
nano /var/www/portfolio/.env
```
```ini
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://root:CHANGE_ME_STRONG_PASSWORD@127.0.0.1:3306/portfolio
CORS_ORIGIN=https://yourdomain.com
UPLOAD_DIR=/var/www/portfolio/uploads
# any OAuth/S3/JWT secrets your app needs, e.g.:
# JWT_SECRET=...
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

Install deps and build:

```bash
npm ci --prefix client
npm ci --prefix server
npm run build   # runs build:client + build:server from root package.json

npm run db:push --prefix server   # drizzle-kit push, creates tables from drizzle/schema.ts
```

### 2.5 Run the API with PM2

```bash
cd /var/www/portfolio/server
DOTENV_CONFIG_PATH=/var/www/portfolio/.env pm2 start dist/index.js --name portfolio-api --time

pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# ^ run the sudo command it prints, then:
pm2 save
```

Check it's alive:
```bash
pm2 status
pm2 logs portfolio-api --lines 50
curl http://127.0.0.1:3000/api/health
```

### 2.6 Configure Nginx (static SPA + reverse proxy, single domain)

```bash
sudo nano /etc/nginx/sites-available/portfolio
```
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/portfolio/client/dist;
    index index.html;

    # API + uploads → Node on 127.0.0.1:3000
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # SPA fallback — client-side routing (wouter)
    location / {
        try_files $uri /index.html;
    }

    client_max_body_size 50m;   # matches express body-parser limit for uploads
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Visit `http://<VM_PUBLIC_IP>` or `http://yourdomain.com` — the site should load.

### 2.7 Free HTTPS with Let's Encrypt

(Requires your domain's DNS `A` record already pointed at the VM's IP.)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl status certbot.timer   # auto-renewal, already enabled by default
```

Certbot rewrites your Nginx config to add the 443 server block and redirect 80→443 automatically.

---

## Part 3 — GitHub Actions CI/CD (auto-deploy on push)

### 3.1 Create a dedicated deploy key (don't reuse your personal SSH key)

On the VM:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-deploy"
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy   # copy this PRIVATE key, you'll paste it into GitHub next
```

### 3.2 Add GitHub repo secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `SSH_PRIVATE_KEY` | contents of `~/.ssh/github_deploy` (the private key) |
| `SSH_HOST` | your VM's public IP or domain |
| `SSH_USER` | `ubuntu` |

### 3.3 Add the workflow file

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Oracle VM

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            set -e
            cd /var/www/portfolio
            git fetch origin main
            git reset --hard origin/main

            npm ci --prefix client
            npm ci --prefix server

            npm run build

            DOTENV_CONFIG_PATH=/var/www/portfolio/.env npm run db:push --prefix server

            pm2 reload portfolio-api --update-env
            pm2 save
```

Commit and push it:
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Oracle VM auto-deploy workflow"
git push origin main
```

That last push is the first one that will actually trigger the pipeline — watch it in the repo's **Actions** tab. From now on, every push to `main` rebuilds and redeploys automatically in-place.

### 3.4 (Optional) Zero-downtime-ish safety net

`pm2 reload` does a graceful reload instead of a hard restart (brief overlap instead of downtime). If a bad deploy ever crashes the app, roll back fast from your laptop:

```bash
ssh -i ~/.ssh/oracle_portfolio ubuntu@<VM_PUBLIC_IP> \
  "cd /var/www/portfolio && git reset --hard <last-good-commit-sha> && npm run build && pm2 reload portfolio-api"
```

---

## Part 4 — Verification checklist

```bash
# On the VM
pm2 status                              # portfolio-api should be "online"
pm2 logs portfolio-api --lines 100      # check for startup errors
curl -I http://127.0.0.1:3000/api/health
sudo nginx -t && sudo systemctl status nginx
docker ps                               # portfolio-mysql should be Up
```

- [ ] `http://yourdomain.com` loads the React app
- [ ] `https://yourdomain.com` loads with a valid cert (green padlock)
- [ ] API calls from the frontend succeed (check Network tab, `/api/trpc/...` returns 200)
- [ ] File upload via `/api/upload` works and the image is reachable at `/uploads/<file>`
- [ ] `git push` to `main` triggers a green run in the **Actions** tab and the site updates within ~1 minute

## Common gotchas specific to your stack

- **Both** the Oracle Security List *and* the VM's own `iptables` must allow 80/443 — missing either one gives a "site can't be reached" even though everything on the server looks fine.
- `drizzle.config.ts` requires `DATABASE_URL` in the environment at the time `drizzle-kit push` runs — the workflow above sources it via `DOTENV_CONFIG_PATH` the same way your `dev` script does.
- If your Ampere A1 capacity request fails at signup, that's Oracle's regional capacity, not your account — retry over the next hours/days, or try an adjacent Always Free-eligible region.
- Idle Always Free instances can be reclaimed after long periods of near-zero CPU/network activity; a live site with any real traffic (or a simple cron `curl` health check every few hours) avoids this.
- Keep `.env` **out of git** — it already has a `dotenv` dependency, so add `.env` and `**/uploads/` to `.gitignore` if they aren't already there.
