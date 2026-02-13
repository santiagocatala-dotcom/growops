import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username y password requeridos" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      "INSERT INTO app_users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username.toLowerCase(), passwordHash]
    );

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });

  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username ya existe" },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
