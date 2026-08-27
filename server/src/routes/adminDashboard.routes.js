import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import { getDashboardStats } from "../controllers/adminDashboard.controller.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", getDashboardStats);

export default router;