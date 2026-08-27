import { Router } from "express";
import * as adminStatsController from "../controllers/adminStats.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), adminStatsController.getStatistics);

export default router;