import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { r2PutObject, r2PublicBaseUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const classroomId = form.get("classroomId")?.toString() ?? null;
  const studentId = form.get("studentId")?.toString() ?? null;

  if (!file)
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);

  const uid = crypto.randomUUID();
  const key = `${session.user.id}/${new Date().toISOString().slice(0, 10)}/${uid}-${file.name}`;

  // Upload to Cloudflare R2
  await r2PutObject({
    key,
    body: bytes,
    contentType: file.type || "application/octet-stream",
  });

  const publicBase = r2PublicBaseUrl();
  const fileUrl = publicBase ? `${publicBase}/${key}` : `r2://${key}`;

  // Store upload metadata
  const upload = await prisma.upload.create({
    data: {
      userId: session.user.id,
      classroomId,
      studentId,
      filename: file.name,
      key,
      url: fileUrl,
      mimeType: file.type || "application/octet-stream",
      size: BigInt(bytes.length),
    },
  });

  // Also store a KnowledgeItem placeholder for future RAG/extraction
  const knowledge = await prisma.knowledgeItem.create({
    data: {
      userId: session.user.id,
      title: file.name,
      content: "",
      source: "UPLOAD",
      classroomId,
      studentId,
      uploadId: upload.id,
    },
  });

  return NextResponse.json({ ok: true, upload, knowledge });
}
