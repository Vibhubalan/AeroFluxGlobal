import { createHash, createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { mediaUrl, putStoredFile, storageConfigured } from "@/lib/server/storage";

function configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY &&
      process.env.R2_SECRET_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL,
  );
}

async function putR2(itemId: string, ext: string, body: Buffer): Promise<string> {
  const account = process.env.R2_ACCOUNT_ID || "";
  const access = process.env.R2_ACCESS_KEY || "";
  const secret = process.env.R2_SECRET_KEY || "";
  const bucket = process.env.R2_BUCKET || "";
  const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  const key = `products/${itemId}.${ext}`;
  const host = `${account}.r2.cloudflarestorage.com`;
  const uri = `/${bucket}/${key}`;
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const day = stamp.slice(0, 8);
  const payloadHash = createHash("sha256").update(body).digest("hex");
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${stamp}\n`;
  const signedHeaderNames = "host;x-amz-content-sha256;x-amz-date";
  const canonical = `PUT\n${uri}\n\n${canonicalHeaders}\n${signedHeaderNames}\n${payloadHash}`;
  const scope = `${day}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${createHash("sha256").update(canonical).digest("hex")}`;
  const dateKey = createHmac("sha256", `AWS4${secret}`).update(day).digest();
  const regionKey = createHmac("sha256", dateKey).update("auto").digest();
  const serviceKey = createHmac("sha256", regionKey).update("s3").digest();
  const signingKey = createHmac("sha256", serviceKey).update("aws4_request").digest();
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`;
  const response = await fetch(`https://${host}${uri}`, {
    method: "PUT",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": stamp,
      Authorization: authorization,
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(body),
  });
  if (!response.ok) {
    throw new Error("Image upload to R2 failed.");
  }
  return `${publicBase}/${key}`;
}

export async function storeProductImage(itemId: string, file: { name: string; type: string; size: number; bytes: () => Promise<Buffer> }): Promise<string> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!["jpg", "jpeg", "png", "webp"].includes(ext) || file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be a JPG, PNG, or WebP under 8 MB.");
  }
  const body = await file.bytes();
  const storedExt = ext === "jpeg" ? "jpg" : ext;
  if (storageConfigured()) {
    const key = `products/${itemId}.${storedExt}`;
    await putStoredFile(key, body, file.type || "application/octet-stream");
    return mediaUrl(key);
  }
  if (configured()) {
    return putR2(itemId, ext, body);
  }
  const dir = path.join(process.cwd(), "public", "images", "products");
  await mkdir(dir, { recursive: true });
  const target = path.join(dir, `${itemId}.${ext === "jpeg" ? "jpg" : ext}`);
  await writeFile(target, body);
  return `/images/products/${itemId}.${ext === "jpeg" ? "jpg" : ext}`;
}
