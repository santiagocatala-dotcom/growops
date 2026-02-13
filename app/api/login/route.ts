import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { verifyPassword, createToken } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const r = await pool.query(
      "SELECT id, password_hash FROM app_users WHERE username=$1",
      [username.toLowerCase()]
    );

    if (!r.rowCount) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await verifyPassword(r.rows[0].password_hash, password);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = createToken(r.rows[0].id);

    const res = NextResponse.json({ success: true });
    // cookie de sesión (30 días)
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
