import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", authMiddleware, orderController.createOrder);
router.get("/mine", authMiddleware, orderController.getMyOrders);
router.get("/:id", authMiddleware, orderController.getOrder);
router.put("/:id/statut", authMiddleware, roleMiddleware(["admin"]), orderController.updateOrderStatus);

export default router;