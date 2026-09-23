import { abs } from "@/lib/seo";
import { settings } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

// Search engines and AI assistants (ChatGPT, Claude, Perplexity, Gemini) are all
// welcome on public pages; the admin, APIs and the basket stay out of the index.
const PRIVATE = ["/admin", "/api/", "/quote"];
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot",
];

export async function GET() {
  const block = (agent: string) => [`User-agent: ${agent}`, "Allow: /", ...PRIVATE.map((p) => `Disallow: ${p}`)].join("\n");
  let extra = "";
  try {
    // Extra rules typed into Admin → SEO (the old default "Allow everything" is ignored).
    const raw = ((await settings.get()).robotsTxt || "").trim();
    if (raw && raw.replace(/\s+/g, " ") !== "User-agent: * Allow: /") extra = `\n\n${raw}`;
  } catch {}
  const body = [block("*"), ...AI_BOTS.map(block)].join("\n\n") + extra + `\n\nSitemap: ${abs("/sitemap.xml")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
