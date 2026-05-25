import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { updateUserSettings } from "../controllers/userController.js";

const router = express.Router();

router.put("/settings", protect, updateUserSettings);

export default router;