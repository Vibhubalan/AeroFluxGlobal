import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import { deskSignedIn } from "@/lib/server/desk-session";
import { getStoredFile } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { id } = await context.params;
  const result = await dbQuery<{ attachment_path: string | null; attachment_type: string | null; attachment_data: Buffer | null }>(
    "SELECT attachment_path, attachment_type, attachment_data FROM rfq_submissions WHERE id = $1",
    [Number(id)],
  );
  const row = result.rows[0];
  if (row?.attachment_path?.startsWith("enquiries/")) {
    const stored = await getStoredFile(row.attachment_path);
    if (!stored) return NextResponse.json({ error: "No attachment." }, { status: 404 });
    const filename = row.attachment_path.split("/").pop() || "attachment";
    return new NextResponse(new Uint8Array(stored.body), {
      headers: {
        "Content-Type": stored.type,
        "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      },
    });
  }
  if (!row?.attachment_data) return NextResponse.json({ error: "No attachment." }, { status: 404 });
  const filename = row.attachment_path || "attachment";
  return new NextResponse(new Uint8Array(row.attachment_data), {
    headers: {
      "Content-Type": row.attachment_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
    },
  });
}
