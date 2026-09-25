import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import { deskSignedIn } from "@/lib/server/desk-session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const result = await dbQuery(
      "SELECT id, created_at, company, name, email, product, mail_sent FROM rfq_submissions ORDER BY id DESC LIMIT 200",
    );
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read responses.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
