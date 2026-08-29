import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRecurringItem,
  deleteRecurringItem,
  getRecurringItems,
  postRecurringItem,
  updateRecurringItem,
} from "../controllers/recurringController.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getRecurringItems).post(createRecurringItem);
router.post("/:id/post", postRecurringItem);
router.route("/:id").put(updateRecurringItem).delete(deleteRecurringItem);

export default router;
