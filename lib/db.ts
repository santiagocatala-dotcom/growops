import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en .env.local");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
