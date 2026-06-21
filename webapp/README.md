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

Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph image URLs use the
deployed domain.

Store links, contact, Privacy Policy, Terms, pricing, and testimonials remain
clearly marked placeholders until production values are provided.
