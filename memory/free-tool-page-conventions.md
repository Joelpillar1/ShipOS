---
name: free-tool-page-conventions
description: Shared conventions every ShipOS free-tool page must follow (banner, font sizing, wiring)
metadata:
  type: feedback
---

ShipOS free-tool marketing pages (e.g. CharacterCounter, BestTimeToPost, LinkedInTextFormatter, EngagementRateCalculator, ImageSizeGuide, HashtagGenerator, UTMLinkBuilder, InstagramGridPreviewer, LinkedInPreviewer) must stay visually consistent with each other.

**Why:** The user explicitly asked to "always check the font sizing with others" and that the standardized closing banner "Schedule your social posts while you sleep" be present on every tool page.

**How to apply:**
- Closing **conversion banner** is standardized: card style `border-2 border-black border-t-8 border-t-[#d75a34] bg-card ... shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[...white] dark:border-white`, ShipOS logo (h-6), heading `text-2xl sm:text-3xl font-bold tracking-tight` reading **"Schedule your social posts while you sleep"** (sentence case), body `text-sm sm:text-base font-normal`, a row of 9 social brand SVG icons (LinkedIn, Instagram, Facebook, X, YouTube, Threads, Pinterest, Bluesky, TikTok), and a `Start 7-Day Free Trial` button (`h-12 px-10 ... text-base`). Copy the block verbatim from an existing page; only change the description sentence and the `?ref=` param.
- **Font sizing:** headings are NOT uppercase/`font-black`/`text-xs`; use the larger readable scale (`text-sm`/`text-base` body, larger non-uppercase headings). A linter in this repo auto-rewrites these — match the existing pages rather than fighting it.
- Pricing section mirrors the landing page (pill + Monthly/Annual toggle + Most Popular/Best Value cards) reading from `PLANS`. See [[shipos-free-tools-suite]].
- Wiring for every new tool: lazy route + redirects in `src/App.tsx`, add path to `PRERENDER_ROUTES` in `vite.config.ts`, and add a footer link in `src/components/Footer.tsx`. Each page uses `<SEO>` with `jsonLd` (WebApplication + breadcrumb + FAQ + softwareApplication), an "answer block", and a citable reference table for GEO.
