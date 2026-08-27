import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 📌 Récupérer le panier de l'utilisateur
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
            },
        });

        if (!cart) {
            return res.json({ items: [], total: 0 });
        }

        // Calculer le total
        const total = cart.items.reduce(
            (sum, item) => sum + Number(item.variant.product.prix) * item.quantite,
            0
        );

        res.json({ ...cart, total });
    } catch (error) {
        console.error("Erreur getCart:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Ajouter un produit au panier (via variant_id)
export const addToCart = async (req, res) => {
    try {
        const { variantId, quantite = 1 } = req.body;
        const userId = req.user.id;

        // 1. Vérifier que la variante existe et que le produit est actif
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true },
        });

        if (!variant || !variant.product.actif) {
            return res.status(404).json({ error: "Produit non trouvé ou inactif" });
        }

        // 2. Vérifier le stock
        if (variant.stock < quantite) {
            return res.status(400).json({ error: "Stock insuffisant" });
        }

        // 3. Trouver ou créer le panier
        let cart = await prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { user_id: userId },
                include: { items: true },
            });
        }

        // 4. Vérifier si la variante est déjà dans le panier
        const existingItem = cart.items.find((item) => item.variant_id === variantId);

        if (existingItem) {
            // Mettre à jour la quantité
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantite: existingItem.quantite + quantite },
            });
        } else {
            // Ajouter un nouvel item
            await prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    variant_id: variantId,
                    quantite,
                },
            });
        }

        // 5. Retourner le panier mis à jour
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
            },
        });

        // Recalculer le total
        const total = updatedCart.items.reduce(
            (sum, item) => sum + Number(item.variant.product.prix) * item.quantite,
            0
        );

        res.json({ ...updatedCart, total });
    } catch (error) {
        console.error("Erreur addToCart:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Supprimer un item du panier
export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        // Vérifier que l'item appartient au panier de l'utilisateur
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!item || item.cart.user_id !== userId) {
            return res.status(404).json({ error: "Item non trouvé" });
        }

        await prisma.cartItem.delete({
            where: { id: item.id },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Erreur removeFromCart:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Vider le panier
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { user_id: userId },
        });

        if (!cart) {
            return res.json({ success: true });
        }

        await prisma.cartItem.deleteMany({
            where: { cart_id: cart.id },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Erreur clearCart:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};