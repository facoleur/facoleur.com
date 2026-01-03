import { auditUrl } from "@/lib/seo/audit";
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

    let validatedUrl: string;
    try {
      // Validation rapide pour éviter les entrées non HTTP.
      const candidate = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      new URL(candidate);
      validatedUrl = candidate;
    } catch {
      // Deuxième tentative en http:// si l’URL n’a pas de schéma valide.
      try {
        const fallback = `http://${url}`;
        new URL(fallback);
        validatedUrl = fallback;
      } catch {
        return NextResponse.json(
          { error: "URL non valide. Utiliser http(s)://domaine." },
          { status: 400 },
        );
      }
    }

    const result = await auditUrl(validatedUrl);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur inattendue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
