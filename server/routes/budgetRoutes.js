import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

router.route("/").post(protect, createBudget).get(protect, getBudgets);

router.route("/:id").put(protect, updateBudget).delete(protect, deleteBudget);

export default router;