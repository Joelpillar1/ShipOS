import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import prerender from "@prerenderer/rollup-plugin";

// Public routes that ship as fully-rendered static HTML so every crawler — including
// ones that don't execute JavaScript (Bing, DuckDuckGo, social link unfurlers) — gets
// complete content + metadata. Auth/app routes are intentionally excluded (they're
// behind login and marked noindex). Set DISABLE_PRERENDER=1 to skip (faster local builds).
const PRERENDER_ROUTES = [
  "/",
  "/pricing",
  "/terms",
  "/privacy",
  "/linkedin-hook-previewer",
  "/instagram-engagement-calculator",
  "/x-thread-formatter",
  "/social-post-limit-checker",
  "/linkedin-text-formatter",
  "/tiktok-money-calculator",
  "/youtube-engagement-calculator",
  "/linkedin-engagement-calculator",
  "/x-engagement-calculator",
  "/facebook-engagement-calculator",
  "/instagram-carousel-splitter",
  "/instagram-grid-maker"
];

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ...(command === "build" && process.env.DISABLE_PRERENDER !== "1" && process.env.VERCEL !== "1"
      ? [
          prerender({
            routes: PRERENDER_ROUTES,
            renderer: "@prerenderer/renderer-puppeteer",
            rendererOptions: {
              // The <SEO> component dispatches this event once a page's head + content
              // are mounted, telling the renderer the snapshot is ready.
              renderAfterDocumentEvent: "prerender-ready",
              // Safety net in case the event is ever missed.
              timeout: 30000,
              maxConcurrentRoutes: 1,
              headless: true,
              launchOptions: {
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
              },
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
