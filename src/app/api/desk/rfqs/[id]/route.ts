import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import { deskSignedIn } from "@/lib/server/desk-session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { id } = await context.params;
  const result = await dbQuery(
    `SELECT id, created_at, company, name, email, phone, product, quote_items, message, attachment_path,
            (attachment_data IS NOT NULL OR attachment_path LIKE 'enquiries/%') AS has_attachment
     FROM rfq_submissions WHERE id = $1`,
    [Number(id)],
  );
  const row = result.rows[0];
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}
