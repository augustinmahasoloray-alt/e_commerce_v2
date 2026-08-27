// routes/vendorApplication.routes.js
import express from "express";
import prisma from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Configuration de Multer pour Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "stepup-vendor-applications",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const upload = multer({ storage: storage });

// Soumettre une candidature avec une photo
router.post(
    "/apply",
    authMiddleware, // Middleware d'authentification
    upload.single("logo"),
    async (req, res) => {
        try {
            const {
                nom,
                prenom,
                email,
                telephone,
                nom_boutique,
                description,
                moyen_paiement,
                numero_paiement,
            } = req.body;

            // Validation des champs requis
            if (!nom || !prenom || !email || !nom_boutique || !moyen_paiement || !numero_paiement) {
                return res.status(400).json({
                    success: false,
                    message: "Tous les champs obligatoires doivent être remplis.",
                });
            }

            // URL de l'image uploadée (si elle existe)
            const logo_url = req.file ? req.file.path : null;

            const application = await prisma.vendorApplication.create({
                data: {
                    nom,
                    prenom,
                    email,
                    telephone: telephone || null,
                    nom_boutique,
                    description: description || null,
                    logo_url,
                    moyen_paiement,
                    numero_paiement,
                },
            });

            res.status(201).json({
                success: true,
                message: "Candidature soumise avec succès !",
                data: application,
            });
        } catch (error) {
            console.error("Erreur lors de la soumission :", error);
            res.status(500).json({
                success: false,
                message: "Une erreur est survenue : " + error.message,
            });
        }
    }
);

export default router;