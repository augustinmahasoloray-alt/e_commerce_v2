// server/src/controllers/adminProduct.controller.js
import prisma from "../config/db.js";

// Formate un produit pour l'affichage dashboard : stock agrégé + statut dérivé
// + univers/sous-catégorie séparés (utile pour préremplir le formulaire d'édition)
function formatProduct(product) {
    const stockTotal = product.variants.reduce((sum, v) => sum + v.stock, 0);

    let statutStock;
    if (stockTotal === 0) statutStock = "Rupture";
    else if (stockTotal <= 3) statutStock = `Plus que ${stockTotal} unités`;
    else statutStock = "En stock";

    const hasParent = Boolean(product.category?.parent);

    return {
        id: product.id,
        nom: product.nom,
        description: product.description,
        prix: product.prix,
        prix_promo: product.prix_promo,
        actif: product.actif,
        etat: product.etat,
        livraison_gratuite: product.livraison_gratuite,
        livraison_express: product.livraison_express,
        categorie: product.category?.nom ?? null,
        // Univers (racine) et sous-catégorie séparés, pour préremplir les deux
        // champs distincts du formulaire (la catégorie liée au produit est soit
        // un univers directement, soit une sous-catégorie avec un parent).
        univers: hasParent ? product.category.parent.nom : (product.category?.nom ?? null),
        sous_categorie: hasParent ? product.category.nom : null,
        marque: product.brand?.nom ?? null,
        stock_total: stockTotal,
        statut_stock: statutStock,
        images: product.images.map((img) => ({ id: img.id, url: img.url })),
        variants: product.variants,
    };
}

// Convertit une valeur venant d'un <input type="checkbox"> / FormData
// ("true", "on", "1"...) en vrai booléen. Absent ou "false" -> false.
function parseBoolean(value) {
    return value === "true" || value === "on" || value === "1";
}

const PRODUCT_INCLUDE = {
    category: { include: { parent: true } },
    brand: true,
    variants: true,
    images: { orderBy: { ordre: "asc" } },
};

// GET /api/admin/products
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await prisma.product.findMany({
            include: PRODUCT_INCLUDE,
            orderBy: { date_creation: "desc" },
        });

        res.status(200).json({
            success: true,
            products: products.map(formatProduct),
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/products/:id
export const getProductById = async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: PRODUCT_INCLUDE,
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Produit introuvable" });
        }

        res.status(200).json({ success: true, product: formatProduct(product) });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/products
// Attend un multipart/form-data avec :
//  - champs texte : nom, description, category_id, brand_id, prix, prix_promo (optionnel)
//  - etat : "neuf" | "reconditionne" | "occasion" (optionnel, défaut "neuf")
//  - livraison_gratuite, livraison_express : "true"/"false" (optionnels, défaut false)
//  - variants : JSON.stringify([{ taille, couleur, stock, sku }, ...])
//  - images : plusieurs fichiers (req.files, via multer.array("images"))
export const createProduct = async (req, res, next) => {
    try {
        const {
            nom,
            description,
            category_id,
            brand_id,
            prix,
            prix_promo,
            etat,
            livraison_gratuite,
            livraison_express,
            variants,
        } = req.body;

        if (!nom || !category_id || !brand_id || !prix) {
            return res.status(400).json({
                success: false,
                message: "Champs obligatoires manquants (nom, category_id, brand_id, prix).",
            });
        }

        // Single-vendor : un seul profil Vendor existe en base, on le résout
        // automatiquement plutôt que de le demander dans le formulaire.
        const vendor = await prisma.vendor.findFirst();
        if (!vendor) {
            return res.status(400).json({
                success: false,
                message: "Aucun profil boutique (Vendor) n'existe encore. Crée-le une fois avant d'ajouter des produits.",
            });
        }

        let parsedVariants = [];
        try {
            parsedVariants = variants ? JSON.parse(variants) : [];
        } catch {
            return res.status(400).json({ success: false, message: "Format des variantes invalide." });
        }

        if (parsedVariants.length === 0) {
            return res.status(400).json({ success: false, message: "Au moins une variante est requise." });
        }

        const validConditions = ["neuf", "reconditionne", "occasion"];
        if (etat && !validConditions.includes(etat)) {
            return res.status(400).json({
                success: false,
                message: `État invalide. Valeurs acceptées : ${validConditions.join(", ")}.`,
            });
        }

        const imageFiles = req.files || [];

        const product = await prisma.product.create({
            data: {
                nom,
                description: description || null,
                category_id,
                brand_id,
                vendor_id: vendor.id,
                prix: parseFloat(prix),
                prix_promo: prix_promo ? parseFloat(prix_promo) : null,
                etat: etat || "neuf",
                livraison_gratuite: parseBoolean(livraison_gratuite),
                livraison_express: parseBoolean(livraison_express),
                variants: {
                    create: parsedVariants.map((v) => ({
                        taille: v.taille,
                        couleur: v.couleur,
                        stock: parseInt(v.stock, 10) || 0,
                        sku: v.sku,
                    })),
                },
                images: {
                    create: imageFiles.map((file, index) => ({
                        url: file.path,
                        ordre: index,
                    })),
                },
            },
            include: PRODUCT_INCLUDE,
        });

        res.status(201).json({ success: true, product: formatProduct(product) });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/products/:id
// Attend un multipart/form-data (mêmes champs que la création) plus :
//  - variants : JSON.stringify des variantes désirées ; celles avec un "id"
//    existant sont mises à jour, celles sans "id" sont créées, celles
//    présentes en base mais absentes du tableau envoyé sont supprimées.
//  - deleted_image_ids : JSON.stringify(["imgId1", "imgId2", ...]) — images
//    existantes à supprimer.
//  - images : nouveaux fichiers à ajouter (en plus des images existantes non supprimées).
export const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const {
            nom,
            description,
            category_id,
            brand_id,
            prix,
            prix_promo,
            actif,
            etat,
            livraison_gratuite,
            livraison_express,
            variants,
            deleted_image_ids,
        } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true, images: true },
        });

        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Produit introuvable." });
        }

        const validConditions = ["neuf", "reconditionne", "occasion"];
        if (etat && !validConditions.includes(etat)) {
            return res.status(400).json({
                success: false,
                message: `État invalide. Valeurs acceptées : ${validConditions.join(", ")}.`,
            });
        }

        // --- Variantes désirées (diff avec l'existant) ---
        let parsedVariants = null;
        if (variants !== undefined) {
            try {
                parsedVariants = JSON.parse(variants);
            } catch {
                return res.status(400).json({ success: false, message: "Format des variantes invalide." });
            }
            if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
                return res.status(400).json({ success: false, message: "Au moins une variante est requise." });
            }
        }

        // --- Images à supprimer ---
        let imageIdsToDelete = [];
        if (deleted_image_ids !== undefined && deleted_image_ids !== "") {
            try {
                imageIdsToDelete = JSON.parse(deleted_image_ids);
            } catch {
                return res.status(400).json({ success: false, message: "Format des images à supprimer invalide." });
            }
        }

        const newImageFiles = req.files || [];
        const remainingExistingCount = existingProduct.images.length - imageIdsToDelete.length;
        if (remainingExistingCount + newImageFiles.length > 6) {
            return res.status(400).json({
                success: false,
                message: "Un produit ne peut pas avoir plus de 6 images.",
            });
        }

        const product = await prisma.$transaction(async (tx) => {
            // 1) Champs simples du produit
            await tx.product.update({
                where: { id: productId },
                data: {
                    ...(nom !== undefined && { nom }),
                    ...(description !== undefined && { description: description || null }),
                    ...(category_id !== undefined && { category_id }),
                    ...(brand_id !== undefined && { brand_id }),
                    ...(prix !== undefined && { prix: parseFloat(prix) }),
                    ...(prix_promo !== undefined && { prix_promo: prix_promo ? parseFloat(prix_promo) : null }),
                    ...(actif !== undefined && { actif: parseBoolean(actif) }),
                    ...(etat !== undefined && { etat }),
                    ...(livraison_gratuite !== undefined && { livraison_gratuite: parseBoolean(livraison_gratuite) }),
                    ...(livraison_express !== undefined && { livraison_express: parseBoolean(livraison_express) }),
                },
            });

            // 2) Variantes : suppression de celles retirées, update des existantes, création des nouvelles
            if (parsedVariants) {
                const existingIds = existingProduct.variants.map((v) => v.id);
                const sentIds = parsedVariants.filter((v) => v.id).map((v) => v.id);
                const idsToDelete = existingIds.filter((id) => !sentIds.includes(id));

                if (idsToDelete.length > 0) {
                    await tx.productVariant.deleteMany({ where: { id: { in: idsToDelete } } });
                }

                for (const v of parsedVariants) {
                    const data = {
                        taille: v.taille,
                        couleur: v.couleur,
                        stock: parseInt(v.stock, 10) || 0,
                        sku: v.sku,
                    };
                    if (v.id && existingIds.includes(v.id)) {
                        await tx.productVariant.update({ where: { id: v.id }, data });
                    } else {
                        await tx.productVariant.create({ data: { ...data, product_id: productId } });
                    }
                }
            }

            // 3) Images : suppression des retirées (DB uniquement, pas de suppression Cloudinary
            //    ici — à ajouter séparément si besoin de faire le ménage sur le storage)
            if (imageIdsToDelete.length > 0) {
                await tx.productImage.deleteMany({ where: { id: { in: imageIdsToDelete } } });
            }

            if (newImageFiles.length > 0) {
                const currentMaxOrdre = await tx.productImage.count({ where: { product_id: productId } });
                await tx.productImage.createMany({
                    data: newImageFiles.map((file, index) => ({
                        product_id: productId,
                        url: file.path,
                        ordre: currentMaxOrdre + index,
                    })),
                });
            }

            return tx.product.findUnique({
                where: { id: productId },
                include: PRODUCT_INCLUDE,
            });
        });

        res.status(200).json({ success: true, product: formatProduct(product) });
    } catch (error) {
        // Une variante déjà référencée par une commande ne peut pas être supprimée (contrainte FK)
        if (error.code === "P2003") {
            return res.status(409).json({
                success: false,
                message: "Impossible de supprimer une variante déjà utilisée dans une commande.",
            });
        }
        next(error);
    }
};

// DELETE /api/admin/products/:id
export const deleteProduct = async (req, res, next) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: "Produit supprimé." });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/products/meta/categories-brands
// Renvoie catégories (avec parent/enfants) et marques (avec leurs univers liés),
// pour peupler les <select> du formulaire ET filtrer les marques par univers côté frontend.
export const getCategoriesAndBrands = async (req, res, next) => {
    try {
        const [categories, brands] = await Promise.all([
            prisma.category.findMany({
                include: { children: true },
                orderBy: { nom: "asc" },
            }),
            prisma.brand.findMany({
                include: { categories: { select: { id: true, nom: true } } },
                orderBy: { nom: "asc" },
            }),
        ]);

        res.status(200).json({ success: true, categories, brands });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/products/meta/top-ventes?limit=5
// Calcule les produits les plus vendus à partir des vraies commandes (OrderItem),
// plutôt qu'un champ manuel — pas de valeur stockée qui pourrait se désynchroniser.
export const getTopSellingProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;

        const orderItems = await prisma.orderItem.findMany({
            include: { variant: { select: { product_id: true } } },
        });

        const salesByProduct = {};
        for (const item of orderItems) {
            const productId = item.variant.product_id;
            salesByProduct[productId] = (salesByProduct[productId] || 0) + item.quantite;
        }

        const topProductIds = Object.entries(salesByProduct)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([productId]) => productId);

        if (topProductIds.length === 0) {
            return res.status(200).json({ success: true, topProducts: [] });
        }

        const products = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            include: {
                category: true,
                brand: true,
                images: { orderBy: { ordre: "asc" }, take: 1 },
            },
        });

        // findMany({ where: { id: { in } } }) ne garantit pas l'ordre : on réordonne
        // manuellement selon le classement réel des ventes.
        const topProducts = topProductIds
            .map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;
                return {
                    id: product.id,
                    nom: product.nom,
                    categorie: product.category?.nom ?? null,
                    marque: product.brand?.nom ?? null,
                    image: product.images[0]?.url ?? null,
                    quantite_vendue: salesByProduct[id],
                };
            })
            .filter(Boolean);

        res.status(200).json({ success: true, topProducts });
    } catch (error) {
        next(error);
    }
};