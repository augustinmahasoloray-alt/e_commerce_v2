// server/src/routes/adminBrand.routes.js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    getAllBrands,
    createBrand,
    deleteBrand,
} from "../controllers/adminBrand.controller.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getAllBrands);
router.post("/", createBrand);
router.delete("/:id", deleteBrand);

export default router;