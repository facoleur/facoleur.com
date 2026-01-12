import { normalizeInputUrl, runContentAudit } from "@/lib/content-audit/analyzer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL manquante ou invalide." },
        { status: 400 },
      );
    }

    const normalizedUrl = normalizeInputUrl(url);
    const result = await runContentAudit(normalizedUrl);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur inattendue.";
    const lowerMessage = message.toLowerCase();
    const isInputError =
      lowerMessage.includes("url") || lowerMessage.includes("http");
    const status = isInputError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
