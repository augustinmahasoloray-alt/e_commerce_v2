import express from "express";
import * as adminOrderController from "../controllers/adminOrder.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/", adminOrderController.listOrders);
router.get("/:id", adminOrderController.getOrder);
router.put("/:id/statut", adminOrderController.updateOrderStatus);

export default router;