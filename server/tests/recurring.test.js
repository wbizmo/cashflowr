import test from "node:test";
import assert from "node:assert/strict";

import Goal from "../models/Goal.js";
import Recurring from "../models/Recurring.js";
import { nextOccurrence } from "../controllers/recurringController.js";

test("monthly recurrence clamps end-of-month dates", () => {
  const january31 = new Date("2026-01-31T09:30:00.000Z");
  assert.equal(nextOccurrence(january31, "monthly").toISOString(), "2026-02-28T09:30:00.000Z");

  const leapJanuary31 = new Date("2028-01-31T09:30:00.000Z");
  assert.equal(nextOccurrence(leapJanuary31, "monthly").toISOString(), "2028-02-29T09:30:00.000Z");
});

test("weekly and quarterly recurrence preserve expected cadence", () => {
  assert.equal(
    nextOccurrence(new Date("2026-08-29T00:00:00.000Z"), "weekly").toISOString(),
    "2026-09-05T00:00:00.000Z"
  );
  assert.equal(
    nextOccurrence(new Date("2026-01-30T00:00:00.000Z"), "quarterly").toISOString(),
    "2026-04-30T00:00:00.000Z"
  );
});

test("goal and recurring models reject non-positive money", () => {
  const goal = new Goal({ name: "Emergency", targetAmount: 0 });
  const recurring = new Recurring({ title: "Rent", amount: 0, type: "expense", frequency: "monthly", nextDueDate: new Date() });
  assert.ok(goal.validateSync()?.errors.targetAmount);
  assert.ok(recurring.validateSync()?.errors.amount);
});
