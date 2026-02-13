import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    // tu cookie real se llama "session"
    const token = req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId as string;

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Falta name" }, { status: 400 });
    }

    // Crear proyecto
    const pr = await pool.query(
      "INSERT INTO projects (name, created_by) VALUES ($1,$2) RETURNING id, name",
      [name, userId]
    );

    const projectId = pr.rows[0].id as string;

    // Owner
    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1,$2,'owner')",
      [projectId, userId]
    );

    // Áreas automáticas
    const areas = [
      { name: "Lab", is_active: true },
      { name: "Invernadero 1", is_active: true },
      { name: "Invernadero 2", is_active: true },
      { name: "Invernadero 3", is_active: true },
      { name: "Lona", is_active: false },
      { name: "Terreno", is_active: false },
    ];

    for (const a of areas) {
      await pool.query(
        "INSERT INTO areas (project_id, name, is_active) VALUES ($1,$2,$3)",
        [projectId, a.name, a.is_active]
      );
    }

    return NextResponse.json({ success: true, project: pr.rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
