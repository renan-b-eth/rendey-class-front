# Rendey Class — Setup (Vercel + Postgres + Stripe + Cloudflare R2)

## 0) Security first (please do this now)
You shared secret keys in chat. Assume they are compromised.
- **Stripe:** Dashboard → Developers → API keys → roll/revoke the secret key and regenerate.
- **Cloudflare R2:** Dashboard → R2 → Manage API Tokens → revoke and create new.

Never commit secrets in code or paste them in public places.

---

## 1) Run locally

### Requirements
- Node 18+
- A Postgres database (Neon/Supabase/Railway/etc.)

### Install
```bash
npm install
```

### Create `.env.local`
```bash
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CHANGE_ME_32+_CHARS

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB

# Agents backend (FastAPI)
AGENTS_API_BASE_URL=http://localhost:7860

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pricing (optional overrides)
SUBSCRIPTION_BASIC_USD=9.99
SUBSCRIPTION_BASIC_MONTHLY_CREDITS=300
SUBSCRIPTION_PRO_USD=19.99
SUBSCRIPTION_PRO_MONTHLY_CREDITS=1000

# Cloudflare R2
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET=<YOUR_BUCKET>
R2_ACCESS_KEY_ID=<YOUR_KEY>
R2_SECRET_ACCESS_KEY=<YOUR_SECRET>
# Optional: if your bucket is public behind a custom domain
R2_PUBLIC_BASE_URL=https://files.yourdomain.com
```

### Migrate DB + generate prisma client
```bash
npx prisma migrate dev
```

### Start
```bash
npm run dev
```

---

## 2) Deploy on Vercel (no manual patches)

### Environment variables (Vercel → Project → Settings → Environment Variables)
Add **the same** variables from `.env.local` (use production values).
Minimum required:
- `NEXTAUTH_URL` = your Vercel production URL
- `NEXTAUTH_SECRET` = generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `DATABASE_URL`
- `AGENTS_API_BASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

### Prisma migrations in production
On Vercel, add a **Build Command** (Project Settings → Build & Development) like:
```bash
npx prisma migrate deploy && npm run build
```
This ensures the database schema is always in sync.

---

## 3) Stripe configuration (credits + subscriptions)

### A) Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL:
   - `https://<your-domain>/api/stripe/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `invoice.paid`
4. Copy the signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.

### B) Products/prices
This project can work without creating Products/Prices because it uses `price_data` inline.
If you prefer managing Prices in Stripe, you can later switch to price IDs.

### C) Credit logic
- One-time purchase (`payment`) adds credits once.
- Subscription (`subscription`) adds credits on every `invoice.paid`.

---

## 4) Cloudflare R2 configuration

### A) Create bucket
Cloudflare Dashboard → R2 → Create Bucket.

### B) Create API token
R2 → Manage API Tokens → Create Token with permissions:
- Object Read/Write

### C) Public downloads (optional)
If you want the uploaded files to be publicly reachable, create a custom domain (recommended):
- R2 → Bucket → Settings → Public access → Custom domain
Then set:
- `R2_PUBLIC_BASE_URL=https://files.yourdomain.com`

If you keep the bucket private, you should later implement signed downloads.

---

## 5) What’s included in this version
- CRUD Turmas/Alunos (já no projeto)
- Agents: list + run (proxy para FastAPI)
- Credits paywall: every agent run consumes 1 credit (401/402 handled)
- Stripe: one-time credit packs + monthly subscription credits via webhooks
- Uploads: saves file into Cloudflare R2 and registers as Upload + KnowledgeItem
- Export (PDF): existing endpoint kept

