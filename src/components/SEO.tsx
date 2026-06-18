// ── <SEO> — per-page <head> manager ───────────────────────────────────────────
//
// Drop one of these at the top of any page to control its title, meta description,
// canonical URL, Open Graph / Twitter card, robots directives, and JSON-LD graphs.
// react-helmet-async hoists everything into <head>; during the production build our
// prerenderer snapshots the fully-resolved head so crawlers (incl. ones that don't
// run JS — Bing, social) receive complete metadata for each public route.

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  TWITTER_HANDLE,
  absoluteUrl,
  PRERENDER_READY_EVENT,
} from "@/lib/seo";

export interface SEOProps {
  /** Page title. The site name is appended automatically unless `title` already contains it. */
  title?: string;
  description?: string;
  /** Route path (e.g. "/pricing"). Used to build the canonical + og:url. Defaults to "/". */
  path?: string;
  /** Absolute or root-relative share image. Defaults to the brand OG image. */
  image?: string;
  /** og:type — "website" for landing/marketing pages, "article" for content. */
  type?: "website" | "article" | "product";
  /** Set true on auth/app pages so search engines don't index thin/duplicate UI. */
  noindex?: boolean;
  /** Extra keywords appended to the defaults. */
  keywords?: string[];
  /** One or more JSON-LD graph objects (from src/lib/seo.ts builders). */
  jsonLd?: object | object[];
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  jsonLd,
}: SEOProps) {
  const fullTitle =
    !title || title === DEFAULT_TITLE
      ? DEFAULT_TITLE
      : title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`;

  const canonical = absoluteUrl(path);
  const ogImage = image.startsWith("http") ? image : `${absoluteUrl(image)}`;
  const allKeywords = [...DEFAULT_KEYWORDS, ...(keywords ?? [])].join(", ");
  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  // Signal the build-time prerenderer that this page's head + content are mounted
  // and painted, so it snapshots fully-rendered HTML. We wait two animation frames
  // (so layout/paint has flushed and Helmet has committed its tags) before firing,
  // which avoids a race where an early synchronous dispatch captured an empty <div
  // id="root">. Harmless no-op in the browser at runtime.
  useEffect(() => {
    if (typeof document === "undefined") return;
    let raf1 = 0;
    let raf2 = 0;
    const fire = () => document.dispatchEvent(new Event(PRERENDER_READY_EVENT));
    if (typeof requestAnimationFrame === "function") {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(fire);
      });
    } else {
      fire();
    }
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonical} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} — ${title ?? "social media command center"}`} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} preview`} />

      {graphs.map((graph, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(graph)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEO;
