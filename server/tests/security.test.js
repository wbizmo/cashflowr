import test from "node:test";
import assert from "node:assert/strict";

import { authorize, getBearerToken } from "../middleware/authMiddleware.js";
import {
  __resetRateLimitersForTests,
  createRateLimiter,
} from "../middleware/securityMiddleware.js";
import { normalizeEmail, validateLogin, validateRegistration } from "../utils/validation.js";

const responseMock = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    body: null,
    setHeader(name, value) { headers.set(name, value); },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    headers,
  };
};

test("registration normalization and password policy", () => {
  const result = validateRegistration({
    firstName: " Ada ",
    lastName: " Lovelace ",
    email: " ADA@EXAMPLE.COM ",
    password: "StrongPass123",
  });

  assert.equal(result.valid, true);
  assert.equal(result.value.email, "ada@example.com");
  assert.equal(result.value.firstName, "Ada");
});

test("registration rejects weak passwords", () => {
  const result = validateRegistration({
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "password",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("login validation is generic and email normalization is stable", () => {
  assert.equal(normalizeEmail(" TEST@Example.com "), "test@example.com");
  assert.equal(validateLogin({ email: "bad", password: "x" }).valid, false);
});

test("bearer token parser rejects malformed schemes", () => {
  assert.equal(getBearerToken({ headers: { authorization: "Basic abc" } }), null);
  assert.equal(getBearerToken({ headers: { authorization: "Bearer token-value" } }), "token-value");
});

test("RBAC middleware permits only configured roles", () => {
  const allowed = authorize("admin", "support");
  let called = false;
  allowed({ user: { role: "support" } }, responseMock(), () => { called = true; });
  assert.equal(called, true);

  const res = responseMock();
  allowed({ user: { role: "user" }, requestId: "req-1" }, res, () => {});
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("rate limiter rejects requests after the configured limit", () => {
  __resetRateLimitersForTests();
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 2,
    keyPrefix: "test",
    message: "limited",
  });
  const req = { ip: "127.0.0.1", requestId: "req-2" };

  let nextCalls = 0;
  limiter(req, responseMock(), () => { nextCalls += 1; });
  limiter(req, responseMock(), () => { nextCalls += 1; });
  const res = responseMock();
  limiter(req, res, () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.message, "limited");
});
