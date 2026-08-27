// server/src/routes/adminCategory.routes.js
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    getAllCategories,
    createCategory,
    deleteCategory,
} from "../controllers/adminCategory.controller.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getAllCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

export default router;