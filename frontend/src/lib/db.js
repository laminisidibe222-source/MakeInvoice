// ─── Read-only data client for Neon ─────────────────────────────
// The browser posts query descriptions to /api/query, which scopes rows to
// the caller (profiles → id, invoices/payments → user_id). Writes go through
// dedicated endpoints (/api/invoices, /api/pay/*, /api/auth).
//
// The call-site API deliberately mirrors supabase-js for selects:
//   from("invoices").select("*").order("created_at", { ascending: false }).limit(5)
import { apiFetch } from "./api.js";

export function from(table) {
  return new QueryBuilder(table);
}

export class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.selectStr = "*";
    this.filters = [];
    this.orderItems = [];
    this.limitN = null;
    this.singleMode = null;
    this.countHead = false;
  }

  select(cols = "*", opts) {
    this.selectStr = cols;
    if (opts?.count === "exact" && opts.head) this.countHead = true;
    return this;
  }

  eq(col, value) {
    this.filters.push({ col, op: "eq", value });
    return this;
  }
  neq(col, value) {
    this.filters.push({ col, op: "neq", value });
    return this;
  }
  gt(col, value) {
    this.filters.push({ col, op: "gt", value });
    return this;
  }
  gte(col, value) {
    this.filters.push({ col, op: "gte", value });
    return this;
  }
  lt(col, value) {
    this.filters.push({ col, op: "lt", value });
    return this;
  }
  lte(col, value) {
    this.filters.push({ col, op: "lte", value });
    return this;
  }
  in(col, values) {
    this.filters.push({ col, op: "in", value: values });
    return this;
  }

  order(col, opts) {
    this.orderItems.push({ col, ascending: opts?.ascending !== false });
    return this;
  }

  limit(n) {
    this.limitN = Math.max(1, Math.trunc(n));
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybe";
    return this;
  }
  single() {
    this.singleMode = "one";
    return this;
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute() {
    const body = {
      table: this.table,
      op: "select",
      select: this.selectStr,
      filters: this.filters,
      order: this.orderItems,
      limit: this.limitN,
      single: this.singleMode,
      countHead: this.countHead,
    };
    const { data: payload, error } = await apiFetch("/api/query", { body });
    if (error) return { data: null, error, count: undefined };
    if (payload && typeof payload === "object" && ("data" in payload || "error" in payload)) {
      return { data: payload.data ?? null, error: payload.error ?? null, count: payload.count };
    }
    return { data: payload ?? null, error: null };
  }
}
