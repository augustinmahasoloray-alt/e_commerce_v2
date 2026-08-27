import { Router } from "express";
import * as addressController from "../controllers/address.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, addressController.getMyAddresses);
router.get("/default", authMiddleware, addressController.getMyDefaultAddress);
router.post("/", authMiddleware, addressController.createAddress);
router.delete("/:id", authMiddleware, addressController.deleteAddress);

export default router;