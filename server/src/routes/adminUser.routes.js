import { Router } from "express";
import * as adminUserController from "../controllers/adminUser.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), adminUserController.listUsers);
router.put("/:id/statut", authMiddleware, roleMiddleware(["admin"]), adminUserController.updateUserStatus);

export default router;