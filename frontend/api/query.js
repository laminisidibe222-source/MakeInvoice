// /api/query — read-only access for the browser SPA.
// The frontend never holds a Neon connection string; it POSTs query
// descriptions here with its session JWT. Every statement is scoped to the
// caller (profiles → id, invoices/payments → user_id). Writes from the
// browser are rejected; mutations go through /api/invoices and /api/pay/*
// where quota and plan logic live.
import { query } from "./_lib/db.js";
import { requireAuth } from "./_lib/auth.js";

const TABLES = {
  profiles: {
    userColumn: "id",
    columns: [
      "id",
      "email",
      "full_name",
      "company_name",
      "company_address",
      "company_phone",
      "plan",
      "invoices_generated",
      "invoices_limit",
      "created_at",
      "updated_at",
    ],
  },
  invoices: {
    userColumn: "user_id",
    columns: [
      "id",
      "user_id",
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
      "created_at",
      "updated_at",
    ],
  },
  payments: {
    userColumn: "user_id",
    columns: [
      "id",
      "user_id",
      "plan",
      "amount",
      "currency",
      "provider",
      "provider_token",
      "status",
      "metadata",
      "created_at",
      "updated_at",
    ],
  },
};

const MAX_LIMIT = 1000;

function fail(res, status, message) {
  return res.status(status).json({ data: null, error: { message } });
}

function stripQualifier(col) {
  const idx = col.lastIndexOf(".");
  return (idx === -1 ? col : col.slice(idx + 1)).trim();
}

function quoteIdent(ident) {
  // Identifiers are validated against whitelists before quoting.
  return `"${ident.replace(/"/g, '""')}"`;
}

function splitTopLevel(input) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of input) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function selectProjection(table, selectRaw) {
  const cfg = TABLES[table];
  const colSet = new Set(cfg.columns);
  const parts = splitTopLevel(selectRaw || "*");
  const out = [];
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    if (part === "*") {
      for (const c of cfg.columns) out.push(`${quoteIdent(table)}.${quoteIdent(c)}`);
      continue;
    }
    const c = stripQualifier(part);
    if (!colSet.has(c))
      throw new Error(`Column "${c}" is not selectable on ${table}.`);
    out.push(`${quoteIdent(table)}.${quoteIdent(c)}`);
  }
  return out.join(", ");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "Method not allowed. Use POST.");
  }
  if (!process.env.DATABASE_URL) {
    return fail(res, 500, "DATABASE_URL is not configured on the server.");
  }
  const auth = await requireAuth(req);
  if (!auth.ok) return fail(res, auth.status, auth.error);

  const body = req.body ?? {};
  const table = String(body.table ?? "").trim();
  const cfg = TABLES[table];
  if (!cfg) return fail(res, 400, `Unknown table "${table}".`);

  const op = String(body.op ?? "select").trim().toLowerCase();
  if (op !== "select") {
    return fail(
      res,
      403,
      `Writes to "${table}" are not allowed from the browser; mutations go through dedicated endpoints.`
    );
  }

  try {
    const params = [];
    const countHead = body.countHead === true;

    const colSet = new Set(cfg.columns);
    const whereParts = [
      `${quoteIdent(table)}.${quoteIdent(cfg.userColumn)} = $${params.push(auth.user.id)}`,
    ];
    const filters = Array.isArray(body.filters) ? body.filters : [];
    for (const f of filters) {
      const col = stripQualifier(String(f.col));
      if (!colSet.has(col))
        throw new Error(`Column "${f.col}" is not filterable on ${table}.`);
      const ident = `${quoteIdent(table)}.${quoteIdent(col)}`;
      switch (f.op) {
        case "eq":
          params.push(f.value);
          whereParts.push(`${ident} = $${params.length}`);
          break;
        case "neq":
          params.push(f.value);
          whereParts.push(`${ident} <> $${params.length}`);
          break;
        case "gt":
          params.push(f.value);
          whereParts.push(`${ident} > $${params.length}`);
          break;
        case "gte":
          params.push(f.value);
          whereParts.push(`${ident} >= $${params.length}`);
          break;
        case "lt":
          params.push(f.value);
          whereParts.push(`${ident} < $${params.length}`);
          break;
        case "lte":
          params.push(f.value);
          whereParts.push(`${ident} <= $${params.length}`);
          break;
        case "in":
          params.push(Array.isArray(f.value) ? f.value : [f.value]);
          whereParts.push(`${ident} = any($${params.length})`);
          break;
        case "is_null":
          whereParts.push(`${ident} is null`);
          break;
        case "is_not_null":
          whereParts.push(`${ident} is not null`);
          break;
        default:
          throw new Error(`Unsupported filter "${String(f.op)}".`);
      }
    }

    let orderSql = "";
    const orderClauses = (Array.isArray(body.order) ? body.order : [])
      .map((o) => {
        const col = stripQualifier(String(o?.col ?? ""));
        if (!colSet.has(col))
          throw new Error(`Column "${o?.col}" is not orderable on ${table}.`);
        const dir = o?.ascending === false ? "desc" : "asc";
        return `${quoteIdent(table)}.${quoteIdent(col)} ${dir}`;
      })
      .filter(Boolean);
    if (orderClauses.length) orderSql = ` order by ${orderClauses.join(", ")}`;

    let limitSql = "";
    if (typeof body.limit === "number" && Number.isFinite(body.limit)) {
      limitSql = ` limit ${Math.min(Math.max(1, Math.trunc(body.limit)), MAX_LIMIT)}`;
    }

    const projection = countHead
      ? "count(*)::int as count"
      : selectProjection(table, String(body.select ?? "*"));
    const text =
      `select ${projection} from ${quoteIdent(table)}` +
      ` where ${whereParts.join(" and ")}` +
      orderSql +
      limitSql;
    const rows = await query(text, params);

    if (countHead) {
      return res
        .status(200)
        .json({ data: null, error: null, count: Number(rows[0]?.count ?? 0) });
    }

    const single = body.single;
    if (single === "one" || single === "maybe") {
      const row = rows[0] ?? null;
      if (single === "one" && !row)
        return res.status(200).json({ data: null, error: { message: "No rows returned." } });
      return res.status(200).json({ data: row, error: null });
    }
    return res.status(200).json({ data: rows, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed.";
    return fail(res, 400, message);
  }
}
