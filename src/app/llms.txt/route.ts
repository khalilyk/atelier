import { abs, DEFAULT_DESC, SITE_NAME, truncate } from "@/lib/seo";
import { publicCatalog } from "@/lib/seo-catalog";
import { getCompany } from "@/lib/get-content";

export const dynamic = "force-dynamic";

// llms.txt: a plain-language map of the site for AI assistants (llmstxt.org).
export async function GET() {
  const [c, entries] = await Promise.all([getCompany(), publicCatalog()]);
  const groups = new Map<string, typeof entries>();
  for (const e of entries) groups.set(e.group, [...(groups.get(e.group) || []), e]);

  const out: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${DEFAULT_DESC}`,
    "",
    `${SITE_NAME} (${c.name}${c.abn ? `, ${c.abn}` : ""}) is based in Sydney and supplies residential builders, architects, designers and homeowners across Australia. It offers two window and door collections (Classic and Signature Luxe), custom joinery (kitchens, wardrobes, laundries, vanities, living and study) and coordinated bathroom packages. Every project is specified from the client's plans, quality inspected and delivered Australia-wide, with installation available through licensed partners.`,
    "",
    "## Contact",
    "",
    ...[c.email && `- Email: ${c.email}`, c.phone && `- Phone: ${c.phone}`, `- Enquiries: ${abs("/contact")}`].filter(Boolean) as string[],
  ];
  for (const [group, list] of groups) {
    out.push("", `## ${group}`, "");
    for (const e of list) out.push(`- [${e.title}](${abs(e.path)}): ${truncate(e.description, 180)}`);
  }
  out.push("");
  return new Response(out.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
