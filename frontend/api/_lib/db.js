// Shared Neon client for serverless functions (/api/*).
// HTTP driver: one query per request, no persistent connections.
// `sql` is created lazily so a missing DATABASE_URL produces a clean 500
// inside the handler instead of a crash at import time.
import { neon } from "@neondatabase/serverless";

let client = null;

export function getSql() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Copy it from your Neon project (Dashboard → Connection string) into the environment."
    );
  }
  client = neon(url);
  return client;
}

/** Run a single raw query with positional params ($1, $2, …). */
export async function query(text, params = []) {
  const sql = getSql();
  return await sql(text, params);
}
