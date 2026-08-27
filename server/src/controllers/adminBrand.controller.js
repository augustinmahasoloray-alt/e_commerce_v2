// server/src/controllers/adminBrand.controller.js
import prisma from "../config/db.js";

// GET /api/admin/brands
export const getAllBrands = async (req, res, next) => {
    try {
        const brands = await prisma.brand.findMany({
            include: { categories: { select: { id: true, nom: true } } },
            orderBy: { nom: "asc" },
        });

        res.status(200).json({ success: true, brands });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/brands
// Body : { nom, category_ids: [] }
// category_ids = les univers (catégories racines) où cette marque doit apparaître.
export const createBrand = async (req, res, next) => {
    try {
        const { nom, category_ids } = req.body;

        if (!nom || !nom.trim()) {
            return res.status(400).json({ success: false, message: "Le nom de la marque est requis." });
        }

        const existing = await prisma.brand.findFirst({ where: { nom: nom.trim() } });
        if (existing) {
            return res.status(409).json({ success: false, message: "Cette marque existe déjà." });
        }

        const ids = Array.isArray(category_ids) ? category_ids : [];

        const brand = await prisma.brand.create({
            data: {
                nom: nom.trim(),
                categories: ids.length > 0 ? { connect: ids.map((id) => ({ id })) } : undefined,
            },
            include: { categories: { select: { id: true, nom: true } } },
        });

        res.status(201).json({ success: true, brand });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/brands/:id
export const deleteBrand = async (req, res, next) => {
    try {
        const brand = await prisma.brand.findUnique({
            where: { id: req.params.id },
            include: { products: true },
        });

        if (!brand) {
            return res.status(404).json({ success: false, message: "Marque introuvable." });
        }
        if (brand.products.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Impossible de supprimer une marque utilisée par des produits.",
            });
        }

        await prisma.brand.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: "Marque supprimée." });
    } catch (error) {
        next(error);
    }
};