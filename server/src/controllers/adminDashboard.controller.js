import prisma from "../config/db.js";

// --- Helpers de bornes de dates (fuseau serveur) ---
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfWeek = (d) => {
    // Semaine calée sur lundi comme premier jour
    const day = d.getDay(); // 0 = dimanche, 1 = lundi, ...
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - diffToMonday);
    return startOfDay(monday);
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);

        const [
            productCount,
            pendingOrders,
            clientCount,
            deliveredOrders,
            categoriesWithCount,
            productsWithStock,
        ] = await Promise.all([
            prisma.product.count({ where: { actif: true } }),
            prisma.vendorOrder.count({ where: { statut: "en_attente" } }),
            prisma.user.count({ where: { role: "client" } }),
            prisma.vendorOrder.findMany({
                where: { statut: "livree" },
                select: {
                    montant_net: true,
                    order: { select: { date_commande: true } },
                },
            }),
            prisma.category.findMany({
                where: { parent_id: null },
                include: {
                    children: {
                        include: { _count: { select: { products: true } } },
                    },
                    _count: { select: { products: true } },
                },
            }),
            prisma.product.findMany({
                where: { actif: true },
                select: {
                    id: true,
                    variants: { select: { stock: true } },
                },
            }),
        ]);

        // Chiffre d'affaires total (livré)
        const revenue = deliveredOrders.reduce((sum, o) => sum + Number(o.montant_net), 0);

        // Ventes sur une fenêtre glissante, même base que le CA total
        const ventesDepuis = (depuis) =>
            deliveredOrders
                .filter((o) => o.order && new Date(o.order.date_commande) >= depuis)
                .reduce((sum, o) => sum + Number(o.montant_net), 0);

        const ventesJour = ventesDepuis(todayStart);
        const ventesSemaine = ventesDepuis(weekStart);
        const ventesMois = ventesDepuis(monthStart);

        // Produits en rupture : actifs, sans variante en stock (ou sans variante du tout)
        const rupturesStock = productsWithStock.filter(
            (p) => p.variants.length === 0 || p.variants.every((v) => v.stock === 0)
        ).length;

        // Aplati : univers + ses sous-catégories, avec le nombre de produits de chacune
        const categoryStats = categoriesWithCount.flatMap((parent) => {
            const rows = parent.children.length
                ? parent.children.map((child) => ({ nom: child.nom, count: child._count.products }))
                : [{ nom: parent.nom, count: parent._count.products }];
            return rows;
        });

        res.status(200).json({
            success: true,
            stats: {
                produits_actifs: productCount,
                commandes_en_attente: pendingOrders,
                chiffre_affaires: revenue,
                clients: clientCount,
                ruptures_stock: rupturesStock,
                ventes_jour: ventesJour,
                ventes_semaine: ventesSemaine,
                ventes_mois: ventesMois,
                produits_par_categorie: categoryStats,
            },
        });
    } catch (error) {
        next(error);
    }
};