import { NextResponse } from "next/server";
import { getStoredFile } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const objectKey = key.join("/");
  if (!objectKey.startsWith("products/") || objectKey.includes("..")) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const file = await getStoredFile(objectKey);
  if (!file) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
