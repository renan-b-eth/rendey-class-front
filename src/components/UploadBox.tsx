"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function UploadBox({ classroomId, studentId }: any) {
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    if (classroomId) fd.append("classroomId", classroomId);
    if (studentId) fd.append("studentId", studentId);

    await fetch("/api/uploads", {
      method: "POST",
      body: fd,
    });

    alert("Arquivo salvo na base de conhecimento.");
  }

  return (
    <div className="border p-4 rounded">
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <Button onClick={upload} className="mt-2">Enviar arquivo</Button>
    </div>
  );
}
