import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

//outes nécessitent une authentification
router.get("/", authMiddleware, getCart); // GET /api/cart
router.post("/", authMiddleware, addToCart); // POST /api/cart
router.delete("/items/:itemId", authMiddleware, removeFromCart); // DELETE /api/cart/items/:itemId
router.delete("/", authMiddleware, clearCart); // DELETE /api/cart

export default router;