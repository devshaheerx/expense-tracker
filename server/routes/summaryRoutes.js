// routes/summaryRoutes.js
import express from "express";
import {
  categoryBreakdown,
  monthlyTrend,
  overview,
  categoryTrend,
  budgetVsActual,
} from "../controllers/summaryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/category", categoryBreakdown);
router.get("/trend", monthlyTrend);
router.get("/overview", overview);
router.get("/category-trend", categoryTrend);
router.get("/budget-vs-actual", budgetVsActual);

export default router;
