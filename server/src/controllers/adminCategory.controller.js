// server/src/controllers/adminCategory.controller.js
import prisma from "../config/db.js";

// GET /api/admin/categories
// Renvoie toutes les catégories racines (univers) avec leurs sous-catégories.
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parent_id: null },
            include: { children: { orderBy: { nom: "asc" } } },
            orderBy: { nom: "asc" },
        });

        res.status(200).json({ success: true, categories });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/categories
// Body : { nom, parent_id? }
// parent_id absent/null -> crée un nouvel univers (catégorie racine).
// parent_id fourni -> crée une sous-catégorie dans cet univers.
export const createCategory = async (req, res, next) => {
    try {
        const { nom, parent_id } = req.body;

        if (!nom || !nom.trim()) {
            return res.status(400).json({ success: false, message: "Le nom de la catégorie est requis." });
        }

        if (parent_id) {
            const parent = await prisma.category.findUnique({ where: { id: parent_id } });
            if (!parent) {
                return res.status(400).json({ success: false, message: "Catégorie parente introuvable." });
            }
            if (parent.parent_id) {
                return res.status(400).json({
                    success: false,
                    message: "Impossible de créer une sous-catégorie sous une sous-catégorie (2 niveaux max).",
                });
            }
        }

        const existing = await prisma.category.findFirst({
            where: { nom: nom.trim(), parent_id: parent_id || null },
        });
        if (existing) {
            return res.status(409).json({ success: false, message: "Cette catégorie existe déjà à cet endroit." });
        }

        const category = await prisma.category.create({
            data: { nom: nom.trim(), parent_id: parent_id || null },
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: req.params.id },
            include: { children: true, products: true },
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie introuvable." });
        }
        if (category.children.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer un univers qui contient encore des sous-catégories.",
            });
        }
        if (category.products.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer une catégorie utilisée par des produits.",
            });
        }

        await prisma.category.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: "Catégorie supprimée." });
    } catch (error) {
        next(error);
    }
};