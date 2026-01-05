import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_TABLE = "audit_leads";
const configuredTable =
  process.env.AUDIT_UNLOCK_TABLE ??
  process.env.AUDIT_TABLE ??
  process.env.NEON_AUDIT_TABLE ??
  DEFAULT_TABLE;
const AUDIT_TABLE = /^[a-zA-Z0-9_]+$/.test(configuredTable)
  ? configuredTable
  : DEFAULT_TABLE;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, auditedSite, auditScore } = body ?? {};

    if (!email || !auditedSite || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email et URL audité sont requis." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Email invalide. Exemple: prenom@domaine.com" },
        { status: 400 },
      );
    }

    const numericScore = Number(auditScore);
    if (!Number.isFinite(numericScore)) {
      return NextResponse.json(
        { error: "Score d’audit invalide." },
        { status: 400 },
      );
    }

    const connectionString =
      process.env.NEON_DATABASE_URL ??
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL;

    if (!connectionString) {
      return NextResponse.json(
        { error: "Configuration de base de données manquante." },
        { status: 500 },
      );
    }

    const sql = neon(connectionString);
    // const emailHash = crypto
    //   .createHash("sha256")
    //   .update(normalizedEmail)
    //   .digest("hex");

    const insertQuery = `INSERT INTO ${AUDIT_TABLE} (email_hash, audited_site, audit_score)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING;`;

    await sql.query(insertQuery, [normalizedEmail, auditedSite, numericScore]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur serveur inattendue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
