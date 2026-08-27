import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import vendorApplicationRoutes from "./routes/vendorApplication.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js";
import adminCategoryRoutes from "./routes/adminCategory.routes.js";
import adminBrandRoutes from "./routes/adminBrand.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import adminUserRoutes from "./routes/adminUser.routes.js";
import adminStatsRoutes from "./routes/adminStats.routes.js";
import cartRoutes from "./routes/cart.routes.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Autoriser les requêtes sans Origin (curl, Postman, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origine non autorisée par CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendor-application", vendorApplicationRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/brands", adminBrandRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/cart", cartRoutes);


// Middleware de gestion des erreurs
app.use(errorMiddleware);

export default app;