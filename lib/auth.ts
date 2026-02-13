import argon2 from "argon2";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Falta JWT_SECRET en .env.local");
}

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "30d" });
}

