import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { attachVendor, requireOwnership } from "../middlewares/vendor.middleware.js";

const router = Router();

// ============ CANDIDATURE ============

router.post("/vendors/apply", authMiddleware, vendorController.applyAsVendor);

// ============ ESPACE VENDEUR (statut = valide requis) ============

router.get(
  "/vendors/me",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  vendorController.getMyVendorProfile
);

router.patch(
  "/vendors/me",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  vendorController.updateMyVendorProfile
);

router.get(
  "/vendors/me/solde",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  vendorController.getMySolde
);

router.get(
  "/vendors/me/dashboard",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  vendorController.getMyDashboard
);

router.get(
  "/vendors/me/orders",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  vendorController.getMyOrders
);

// :id ici = l'id du VendorOrder (pas de l'Order global)
router.patch(
  "/vendors/me/orders/:id/statut",
  authMiddleware,
  roleMiddleware(["vendeur"]),
  attachVendor,
  requireOwnership("vendorOrder"),
  vendorController.updateOrderStatus
);

// ============ ADMIN ============

router.get("/admin/vendors", authMiddleware, roleMiddleware(["admin"]), vendorController.listVendors);
router.patch("/admin/vendors/:id/valider", authMiddleware, roleMiddleware(["admin"]), vendorController.validateVendor);
router.patch("/admin/vendors/:id/rejeter", authMiddleware, roleMiddleware(["admin"]), vendorController.rejectVendor);
router.patch("/admin/vendors/:id/suspendre", authMiddleware, roleMiddleware(["admin"]), vendorController.suspendVendor);

export default router;