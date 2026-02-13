import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/session=([^;]+)/);
  if (!m) return NextResponse.json({ userId: null }, { status: 200 });

  try {
    const payload = jwt.verify(m[1], process.env.JWT_SECRET!) as any;
    return NextResponse.json({ userId: payload.userId }, { status: 200 });
  } catch {
    return NextResponse.json({ userId: null }, { status: 200 });
  }
}
