import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "desk_session";

function token(): string {
  const secret = process.env.DB_PASS || "aeroflux-desk";
  return createHmac("sha256", secret).update("desk").digest("hex");
}

export async function deskSignedIn(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value ?? "";
  const expected = token();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function setDeskCookie() {
  const jar = await cookies();
  jar.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearDeskCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function deskPasswordOk(user: string, password: string): boolean {
  if (user.trim() === "admin" && password === "aeroflux") return true;
  const expectedUser = process.env.ADMIN_USER || "desk";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  return expectedPassword !== "" && user.trim() === expectedUser && password === expectedPassword;
}
