import crypto from "crypto";
import { mustGetEnv, getEnv } from "@/lib/env";

function hmac(key: Buffer | string, msg: string) {
  return crypto.createHmac("sha256", key).update(msg, "utf8").digest();
}

function sha256Hex(data: Uint8Array) {
  // crypto aceita Uint8Array normalmente
  return crypto.createHash("sha256").update(data).digest("hex");
}

function toAmzDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const HH = pad(d.getUTCHours());
  const MM = pad(d.getUTCMinutes());
  const SS = pad(d.getUTCSeconds());
  return {
    dateStamp: `${yyyy}${mm}${dd}`,
    amz: `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`,
  };
}

function awsV4SigningKey(secret: string, dateStamp: string, region: string, service: string) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export function r2PublicBaseUrl(): string | undefined {
  const base = getEnv("R2_PUBLIC_BASE_URL");
  return base ? base.replace(/\/$/, "") : undefined;
}

export function r2Endpoint(): URL {
  const raw = mustGetEnv("R2_ENDPOINT");
  const u = new URL(raw);
  u.pathname = u.pathname.replace(/\/$/, "");
  return u;
}

export function r2Bucket(): string {
  return mustGetEnv("R2_BUCKET");
}

function encodeKeyPath(key: string) {
  // preserva "/" e codifica só cada segmento
  return key.split("/").map(encodeURIComponent).join("/");
}

function toWholeArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // força criação de um ArrayBuffer REAL
  return bytes.slice().buffer;
}

export async function r2PutObject(params: {
  key: string;
  body: Uint8Array; // ✅ padronizado
  contentType: string;
}): Promise<{ url: string }> {
  const endpoint = r2Endpoint();
  const bucket = r2Bucket();
  const accessKeyId = mustGetEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = mustGetEnv("R2_SECRET_ACCESS_KEY");

  const region = "auto";
  const service = "s3";

  const url = new URL(endpoint.toString());
  url.pathname = `/${bucket}/${params.key}`;

  const { dateStamp, amz } = toAmzDate(new Date());

  const payloadHash = sha256Hex(params.body);

  const canonicalUri = url.pathname
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/")
    .replace(/%2F/g, "/");

  const canonicalQuery = "";

  const canonicalHeaders =
    `host:${url.host}\n` +
    `content-type:${params.contentType}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amz}\n`;

  const signedHeaders = "host;content-type;x-amz-content-sha256;x-amz-date";

  const canonicalRequest =
    `PUT\n${canonicalUri}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest, "utf8")
    .digest("hex");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amz}\n${scope}\n${canonicalRequestHash}`;

  const signingKey = awsV4SigningKey(secretAccessKey, dateStamp, region, service);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "content-type": params.contentType,
      "x-amz-date": amz,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
    body: toWholeArrayBuffer(params.body), // ✅ ArrayBuffer = BodyInit OK (sem briga de typing)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`R2 upload failed (${res.status}): ${txt.slice(0, 500)}`);
  }

  const publicBase = r2PublicBaseUrl();
  const publicUrl = publicBase ? `${publicBase}/${encodeKeyPath(params.key)}` : url.toString();
  return { url: publicUrl };
}
