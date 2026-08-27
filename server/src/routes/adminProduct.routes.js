// server/src/routes/adminProduct.routes.js
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategoriesAndBrands,
    getTopSellingProducts,
} from "../controllers/adminProduct.controller.js";

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "stepup-products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    },
});

const upload = multer({ storage });

// Toutes les routes de ce fichier exigent un token valide ET le rôle admin.
router.use(authMiddleware, adminMiddleware);

router.get("/meta/categories-brands", getCategoriesAndBrands);
router.get("/meta/top-ventes", getTopSellingProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", upload.array("images", 6), createProduct);
router.put("/:id", upload.array("images", 6), updateProduct);
router.delete("/:id", deleteProduct);

export default router;