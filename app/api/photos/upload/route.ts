import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireUserId } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();

    const form = await req.formData();
    const projectId = String(form.get("projectId") || "");
    const file = form.get("file") as File | null;

    if (!projectId) return NextResponse.json({ error: "Falta projectId" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "Falta file" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Solo imágenes" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const ymd = new Date().toISOString().slice(0, 10);
    const id = crypto.randomUUID();
    const path = `${projectId}/${ymd}/${id}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("growops-photos")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (upErr) {
      console.error("UPLOAD ERROR:", upErr);
      return NextResponse.json({ error: "No se pudo subir" }, { status: 500 });
    }

    const { data: row, error: insErr } = await supabaseAdmin
      .from("project_photos")
      .insert({
        project_id: projectId,
        uploaded_by: userId,
        path,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: buffer.length,
      })
      .select("*")
      .single();

    if (insErr) {
      console.error("DB INSERT ERROR:", insErr);
      return NextResponse.json({ error: "Subió pero no guardó registro" }, { status: 500 });
    }

    return NextResponse.json({ success: true, photo: row });
  } catch (err: any) {
    console.error("PHOTOS UPLOAD ERROR:", err?.message || err, err?.stack);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
