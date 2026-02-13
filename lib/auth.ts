import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

// crear hash de password
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// verificar password
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// crear token
export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

// verificar token
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// obtener userId desde cookie
export async function requireUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No autenticado");
  }

  const payload = verifyToken(token);

  if (!payload?.userId) {
    throw new Error("Token inválido");
  }

  return payload.userId;
}
// test redeploy

