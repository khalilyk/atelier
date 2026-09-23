import { NextRequest, NextResponse } from "next/server";
import { vcards, team } from "@/lib/admin-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let card = await vcards.findById(id);

  // Fall back to a team member so every team profile has an auto-generated vCard.
  if (!card) {
    const member = (await team.list()).find((m) => m.id === id);
    if (member) {
      card = {
        id: member.id,
        name: member.name,
        title: member.role,
        company: "Atelier Supply Group Pty Ltd",
        email: member.email,
        phone: member.phone ?? "",
        mobile: "",
        website: "https://ateliersupplygroup.com.au",
        address: "",
        linkedin: "",
        createdAt: "",
      };
    }
  }

  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.name}`,
    card.title ? `TITLE:${card.title}` : "",
    card.company ? `ORG:${card.company}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.phone ? `TEL;TYPE=WORK,VOICE:${card.phone}` : "",
    card.mobile ? `TEL;TYPE=CELL:${card.mobile}` : "",
    card.website ? `URL:${card.website}` : "",
    card.address ? `ADR;TYPE=WORK:;;${card.address};;;;` : "",
    card.linkedin ? `X-SOCIALPROFILE;type=linkedin:${card.linkedin}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${card.name.replace(/\s+/g, "_")}.vcf"`,
    },
  });
}
