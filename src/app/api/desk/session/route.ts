import { NextResponse } from "next/server";
import { clearDeskCookie, deskPasswordOk, deskSignedIn, setDeskCookie } from "@/lib/server/desk-session";

export async function GET() {
  return NextResponse.json({ ok: await deskSignedIn() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { user?: string; password?: string } | null;
  if (!body || !deskPasswordOk(String(body.user ?? ""), String(body.password ?? ""))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await setDeskCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearDeskCookie();
  return NextResponse.json({ ok: true });
}
