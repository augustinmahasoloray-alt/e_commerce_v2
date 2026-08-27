import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { attachVendor, requireOwnership } from "../middlewares/vendor.middleware.js";

const router = Router();

// ============ ROUTES PUBLIQUES ============

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// ============ ROUTES VENDEUR (+ admin en modération) ============

router.get(
  "/me/mine",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  productController.getMyProducts
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["vendeur", "admin"]),
  attachVendor,
  productController.createProduct
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["vendeur", "admin"]),
  attachVendor,
  requireOwnership("product"),
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["vendeur", "admin"]),
  attachVendor,
  requireOwnership("product"),
  productController.deleteProduct
);

router.post(
  "/:id/images",
  authMiddleware,
  roleMiddleware(["vendeur", "admin"]),
  attachVendor,
  requireOwnership("product"),
  upload.single("image"),
  productController.addProductImage
);

router.put(
  "/:id/images/:imageId",
  authMiddleware,
  roleMiddleware(["vendeur", "admin"]),
  attachVendor,
  requireOwnership("product"), // req.params.id = ID produit ici, pas imageId
  upload.single("image"),
  productController.updateProductImage
);

export default router;