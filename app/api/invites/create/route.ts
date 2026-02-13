import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../../../../lib/db";

function getUserId(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { projectId, role = "operator", days = 7 } = await req.json();
    if (!projectId) return NextResponse.json({ error: "Falta projectId" }, { status: 400 });

    // Solo owner/admin puede invitar
    const m = await pool.query(
      "select role from project_members where project_id=$1 and user_id=$2",
      [projectId, userId]
    );
    if (!m.rowCount || !["owner", "admin"].includes(m.rows[0].role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await pool.query(
      "insert into invites (project_id, role, token, expires_at) values ($1,$2,$3,$4)",
      [projectId, role, token, expiresAt.toISOString()]
    );

    const inviteUrl = `http://localhost:3000/invite/${token}`;
    return NextResponse.json({ success: true, inviteUrl, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
