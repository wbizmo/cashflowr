import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createCategory)
  .get(protect, getCategories);

router
  .route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;