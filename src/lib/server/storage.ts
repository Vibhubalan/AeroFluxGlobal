import { createHash, createHmac } from "node:crypto";

const emptyHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function envValue(name: string, fallback: string) {
  return process.env[name] || process.env[fallback] || "";
}

export function storageConfigured(): boolean {
  return Boolean(envValue("NEON_S3_ENDPOINT", "AWS_ENDPOINT_URL_S3") && envValue("NEON_S3_ACCESS_KEY", "AWS_ACCESS_KEY_ID") && envValue("NEON_S3_SECRET_KEY", "AWS_SECRET_ACCESS_KEY"));
}

function settings() {
  const endpoint = envValue("NEON_S3_ENDPOINT", "AWS_ENDPOINT_URL_S3").replace(/\/$/, "");
  const url = new URL(endpoint);
  return {
    host: url.host,
    origin: url.origin,
    bucket: process.env.NEON_S3_BUCKET || "assets",
    access: envValue("NEON_S3_ACCESS_KEY", "AWS_ACCESS_KEY_ID"),
    secret: envValue("NEON_S3_SECRET_KEY", "AWS_SECRET_ACCESS_KEY"),
    region: envValue("NEON_S3_REGION", "AWS_REGION") || "eu-central-1",
  };
}

async function signedRequest(method: "PUT" | "GET", key: string, body?: Buffer, contentType?: string) {
  const { host, origin, bucket, access, secret, region } = settings();
  const uri = `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const day = stamp.slice(0, 8);
  const payloadHash = body ? createHash("sha256").update(body).digest("hex") : emptyHash;
  const headerList: Array<[string, string]> = [
    ["host", host],
    ["x-amz-content-sha256", payloadHash],
    ["x-amz-date", stamp],
  ];
  if (contentType) headerList.push(["content-type", contentType]);
  headerList.sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalHeaders = headerList.map(([name, value]) => `${name}:${value}\n`).join("");
  const signedHeaderNames = headerList.map(([name]) => name).join(";");
  const canonical = `${method}\n${uri}\n\n${canonicalHeaders}\n${signedHeaderNames}\n${payloadHash}`;
  const scope = `${day}/${region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${createHash("sha256").update(canonical).digest("hex")}`;
  const dateKey = createHmac("sha256", `AWS4${secret}`).update(day).digest();
  const regionKey = createHmac("sha256", dateKey).update(region).digest();
  const serviceKey = createHmac("sha256", regionKey).update("s3").digest();
  const signingKey = createHmac("sha256", serviceKey).update("aws4_request").digest();
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`;
  const headers: Record<string, string> = { Authorization: authorization };
  for (const [name, value] of headerList) headers[name] = value;
  const response = await fetch(`${origin}${uri}`, {
    method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  });
  return response;
}

export async function putStoredFile(key: string, body: Buffer, contentType: string) {
  const response = await signedRequest("PUT", key, body, contentType);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.includes("NoSuchBucket") ? "Create the Neon storage bucket named in NEON_S3_BUCKET." : "Could not store that file in Neon.");
  }
}

export async function getStoredFile(key: string) {
  const response = await signedRequest("GET", key);
  if (!response.ok) return null;
  return {
    body: Buffer.from(await response.arrayBuffer()),
    type: response.headers.get("content-type") || "application/octet-stream",
  };
}

export function mediaUrl(key: string) {
  return `/api/media/${key}`;
}

export function readUpload(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string" || value.size <= 0) return null;
  const name = "name" in value && value.name ? value.name : "attachment";
  return {
    name,
    type: value.type || "application/octet-stream",
    size: value.size,
    bytes: () => value.arrayBuffer().then((data) => Buffer.from(data)),
  };
}
