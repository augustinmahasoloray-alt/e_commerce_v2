// server/src/routes/brand.routes.js
import { Router } from "express";
import { getAllBrands } from "../controllers/adminBrand.controller.js";

const router = Router();

// Route publique en lecture seule, utilisée par la Boutique (client React)
// pour connaître les marques disponibles par univers.
router.get("/", getAllBrands);

export default router;