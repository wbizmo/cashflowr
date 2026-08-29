import test from "node:test";
import assert from "node:assert/strict";

import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { parseDateRange, parseExpectedVersion, parsePagination, pick } from "../utils/request.js";

test("pagination is bounded", () => {
  assert.deepEqual(parsePagination({ page: "2", limit: "999" }), { page: 2, limit: 100, skip: 100 });
  assert.deepEqual(parsePagination({ page: "no", limit: "0" }), { page: 1, limit: 25, skip: 0 });
});

test("pick prevents mass assignment", () => {
  assert.deepEqual(
    pick({ title: "Rent", amount: 10, user: "attacker", role: "admin" }, ["title", "amount"]),
    { title: "Rent", amount: 10 }
  );
});

test("If-Match version parsing supports quoted ETags", () => {
  const req = { get: () => 'W/"7"', body: {} };
  assert.equal(parseExpectedVersion(req), 7);
});

test("analytics ranges reject invalid or excessive windows", () => {
  assert.equal(parseDateRange({ from: "bad-date", to: "2026-01-01" }), null);
  assert.equal(parseDateRange({ from: "2020-01-01", to: "2026-01-01" }, 12), null);
});

test("transaction and budget amounts reject zero", () => {
  const transaction = new Transaction({ title: "Test", amount: 0, type: "expense" });
  const budget = new Budget({ amount: 0, month: 1, year: 2026 });
  assert.ok(transaction.validateSync()?.errors.amount);
  assert.ok(budget.validateSync()?.errors.amount);
});
