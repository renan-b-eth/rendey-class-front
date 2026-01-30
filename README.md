# Rendey Class — Frontend Day 1 (Vercel-safe)

This is a **frontend-only** build of Rendey Class designed to **deploy cleanly on Vercel** without any ENV keys.

## Quick start

```bash
npm install
npm run dev
```

## Deploy to Vercel

- Framework: **Next.js**
- Root Directory: **repo root**
- Build Command: `npm run build`
- Install Command: `npm install`

✅ Works without env vars.

## What’s included (Day 1)

- Landing page
- Dashboard
- Lessons (create/edit/delete) stored locally (Zustand + localStorage)
- AI Agents page (mock generator)
- Export PDF (real download) using `@react-pdf/renderer`

## Next steps (Day 2)

Add ENV keys and swap local storage for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Connect real agents:
- `NEXT_PUBLIC_AI_API_BASE` (your Hugging Face backend)
