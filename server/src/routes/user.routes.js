import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", authMiddleware, userController.getMyProfile);
router.put("/me", authMiddleware, userController.updateMyProfile);
router.get("/", authMiddleware, roleMiddleware(["admin"]), userController.getUsers);
router.put("/:id/role", authMiddleware, roleMiddleware(["admin"]), userController.updateUserRole);

export default router;