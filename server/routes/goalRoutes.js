import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  archiveGoal,
  contributeToGoal,
  createGoal,
  getGoals,
  updateGoal,
} from "../controllers/goalController.js";

const router = express.Router();
router.use(protect);

router.route("/").get(getGoals).post(createGoal);
router.patch("/:id/contribute", contributeToGoal);
router.patch("/:id/archive", archiveGoal);
router.put("/:id", updateGoal);

export default router;
