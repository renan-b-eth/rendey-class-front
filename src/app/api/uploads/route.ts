import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { r2PutObject, r2PublicBaseUrl } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// PDF/DOCX/PPTX + imagens (opcional)
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/msword", // doc (opcional)
  "application/vnd.ms-powerpoint", // ppt (opcional)
  "image/png",
  "image/jpeg",
]);

function safeFileName(name: string) {
  return name.replace(/[^\w.\- ()\[\]]+/g, "_").slice(0, 180);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");

  // ids opcionais: use undefined (não null) pro Prisma
  const classroomIdRaw = form.get("classroomId")?.toString().trim();
  const studentIdRaw = form.get("studentId")?.toString().trim();
  const classroomId = classroomIdRaw ? classroomIdRaw : undefined;
  const studentId = studentIdRaw ? studentIdRaw : undefined;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Arquivo obrigatório" }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ ok: false, error: "Arquivo vazio" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `Arquivo muito grande. Máximo: ${MAX_MB}MB` },
      { status: 413 }
    );
  }

  const contentType = file.type || "application/octet-stream";

  // Se preferir não bloquear nada, remova esse if.
  if (contentType !== "application/octet-stream" && !ALLOWED_MIME.has(contentType)) {
    return NextResponse.json(
      { ok: false, error: `Tipo de arquivo não permitido (${contentType})` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const uid = crypto.randomUUID();
  const cleanName = safeFileName(file.name || "arquivo");
  const datePrefix = new Date().toISOString().slice(0, 10);

  const key = `${session.user.id}/${datePrefix}/${uid}-${cleanName}`;

  // Upload Cloudflare R2
  await r2PutObject({
    key,
    body: bytes,
    contentType,
  });

  const publicBase = r2PublicBaseUrl();
  const fileUrl = publicBase ? `${publicBase}/${key}` : `r2://${key}`;

  // ✅ Upload metadata (alinha 100% com o model Upload do seu Prisma)
  const upload = await prisma.upload.create({
    data: {
      userId: session.user.id,
      classroomId,
      studentId,
      filename: cleanName,
      key,
      fileUrl,
      mimeType: contentType,
      size: BigInt(bytes.byteLength),
    },
    select: {
      id: true,
      userId: true,
      classroomId: true,
      studentId: true,
      filename: true,
      key: true,
      fileUrl: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });

  // ✅ KnowledgeItem placeholder (alinha 100% com o model KnowledgeItem do seu Prisma)
  const knowledge = await prisma.knowledgeItem.create({
    data: {
      userId: session.user.id,
      classroomId,
      studentId,
      title: cleanName,
      content: "",
      source: "UPLOAD",
      fileUrl,
      mimeType: contentType,
    },
    select: {
      id: true,
      userId: true,
      classroomId: true,
      studentId: true,
      title: true,
      source: true,
      fileUrl: true,
      mimeType: true,
      createdAt: true,
    },
  });

  // ✅ BigInt não serializa em JSON: converte antes de retornar
  const uploadJson = {
    ...upload,
    size: upload.size ? upload.size.toString() : null,
  };

  return NextResponse.json({ ok: true, upload: uploadJson, knowledge });
}
