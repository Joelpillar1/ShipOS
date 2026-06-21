---
name: shipos-free-tools-suite
description: The free SEO/GEO tools built to market ShipOS, and the page template they share
metadata:
  type: project
---

ShipOS (AI social media scheduler) is growing a suite of free, no-login marketing tools as a programmatic SEO + GEO (AI-answer-engine) play. Each tool = its own indexable, prerendered route that funnels into signup via `?ref=<tool>`.

Tools built (as of 2026-06-20): `/character-counter`, `/best-time-to-post`, `/linkedin-text-formatter`, `/engagement-rate-calculator`, `/social-media-image-sizes`, plus `/linkedin-hook-previewer`, `/instagram-grid-previewer`, `/hashtag-generator`, `/utm-link-builder` (some built in parallel by others).

Shared page template (model new tools on an existing page): `<SEO>` with keyword-rich meta + `jsonLd` (WebApplication + breadcrumbSchema + faqSchema + softwareApplicationSchema from `src/lib/seo.ts`); a top "answer block" paragraph (the AI-quotable snippet); the interactive tool; a citable 2026 reference **table**; how-it-works; tips; FAQ accordion; "Grow with ShipOS"; landing-style pricing; and the standardized closing banner. Conventions in [[free-tool-page-conventions]].

Still open ideas: Tweet/Thread Splitter, X/Facebook/Threads post previewers, Social Media Holidays calendar, AI Caption Generator (repo already has `src/lib/ai.ts`), and a `/tools` hub/index page to consolidate internal linking.
