// server/src/routes/category.routes.js
import { Router } from "express";
import { getAllCategories } from "../controllers/adminCategory.controller.js";

const router = Router();

// Route publique en lecture seule, utilisée par la Boutique (client React)
// pour construire dynamiquement les univers/sous-catégories.
// Réutilise le même contrôleur que l'admin : getAllCategories ne fait
// qu'un findMany, aucune action sensible, donc pas besoin d'auth ici.
router.get("/", getAllCategories);

export default router;