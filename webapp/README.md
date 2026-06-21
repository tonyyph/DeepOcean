# Deep Ocean Landing Page

Marketing site for the Deep Ocean mobile focus app. The page is built with
Next.js, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.

## Run locally

```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Content and design

- Product content: `src/content/landingContent.ts`
- Landing design tokens: `src/lib/landingTheme.ts`
- Page sections: `src/components/sections/`
- Mobile UI mockups: `src/components/mockups/PhoneMockup.tsx`
- Shared responsive styling: `src/app/globals.css`
- Reused app and widget artwork: `public/assets/`

Copy `.env.example` to `.env.local` when you need to override the canonical
site URL locally. Production uses `https://deepocean.io.vn` by default:

```bash
cp .env.example .env.local
```

## Production deployment

Vercel is the recommended host because this project is a Next.js app and does
not need a custom server.

1. Import `https://github.com/tonyyph/DeepOcean` in Vercel.
2. Set **Root Directory** to `webapp`.
3. Keep the detected framework preset as **Next.js**.
4. Add `NEXT_PUBLIC_SITE_URL=https://deepocean.io.vn` for Production.
5. Deploy, then add `deepocean.io.vn` and `www.deepocean.io.vn` in the Vercel
   project domain settings.
6. Make `deepocean.io.vn` the primary domain and redirect `www` to it.

Vercel supplies the exact DNS records after the domains are added. Configure
those records at the current authoritative DNS provider, then wait for Vercel
to report both domains as valid and HTTPS certificates as issued.

Store links, contact, Privacy Policy, Terms, pricing, and testimonials remain
clearly marked placeholders until production values are provided.
