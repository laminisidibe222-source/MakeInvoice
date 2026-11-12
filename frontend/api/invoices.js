// /api/invoices — create invoice with server-side quota enforcement.
// Read access goes through /api/query; this endpoint owns the write path.
import { query } from "./_lib/db.js";
import { requireAuth } from "./_lib/auth.js";

const INVOICE_COLUMNS = [
  "invoice_number",
  "client_name",
  "client_address",
  "client_email",
  "client_phone",
  "issue_date",
  "due_date",
  "items",
  "tax_rate",
  "discount",
  "subtotal",
  "tax_amount",
  "discount_amount",
  "total",
  "notes",
  "status",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }
  const auth = await requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const body = req.body ?? {};

  try {
    // Quota check
    const [profile] = await query(
      `select invoices_generated, invoices_limit
         from public.profiles
        where id = $1`,
      [auth.user.id]
    );
    if (!profile) return res.status(500).json({ error: "Profile not found." });
    if (Number(profile.invoices_generated) >= Number(profile.invoices_limit)) {
      return res.status(403).json({
        error: "Quota reached. Please upgrade your plan.",
        code: "QUOTA_EXCEEDED",
      });
    }

    // Whitelist invoice columns from the client payload
    const values = { user_id: auth.user.id };
    for (const col of INVOICE_COLUMNS) {
      if (body[col] !== undefined) values[col] = body[col];
    }
    if (!values.invoice_number || String(values.invoice_number).trim() === "") {
      return res.status(400).json({ error: "invoice_number is required." });
    }

    const cols = Object.keys(values);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const [invoice] = await query(
      `insert into public.invoices (${cols.map((c) => `"${c}"`).join(", ")})
       values (${placeholders})
       returning *`,
      cols.map((c) => values[c])
    );

    // Increment counter
    await query(
      `update public.profiles
          set invoices_generated = invoices_generated + 1,
              updated_at = now()
        where id = $1`,
      [auth.user.id]
    );

    return res.status(200).json(invoice);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    console.error("[invoices] error:", err);
    return res.status(500).json({ error: message });
  }
}
