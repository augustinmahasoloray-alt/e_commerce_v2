import { PrismaClient, Prisma } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Remplit les jours manquants avec 0 pour avoir une courbe continue sur 30 jours
function fillLast30Days(rows, valueKey) {
    const map = new Map(
        rows.map((r) => [new Date(r.jour).toISOString().slice(0, 10), Number(r[valueKey])])
    );

    const result = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({ date: key, valeur: map.get(key) ?? 0 });
    }
    return result;
}

export const getStatistics = async (req, res, next) => {
    try {
        const vendor = await prisma.vendor.findFirst();

        if (!vendor) {
            return res.status(200).json({
                succes: true,
                ventes: fillLast30Days([], "total"),
                topProduits: [],
                topCategories: [],
                nouveauxUtilisateurs: fillLast30Days([], "total"),
            });
        }

        const [ventesRaw, topProduits, topCategories, nouveauxUtilisateursRaw] = await Promise.all([
            prisma.$queryRaw`
                SELECT date_trunc('day', o.date_commande) AS jour,
                       SUM(vo.montant_total) AS total
                FROM vendor_orders vo
                JOIN orders o ON o.id = vo.order_id
                WHERE vo.vendor_id = ${vendor.id}
                  AND vo.statut != 'annulee'
                  AND o.date_commande >= NOW() - INTERVAL '30 days'
                GROUP BY jour
                ORDER BY jour ASC
            `,
            prisma.$queryRaw`
                SELECT p.id, p.nom,
                       SUM(oi.quantite) AS quantite_vendue
                FROM order_items oi
                JOIN product_variants pv ON pv.id = oi.variant_id
                JOIN products p ON p.id = pv.product_id
                JOIN vendor_orders vo ON vo.id = oi.vendor_order_id
                WHERE vo.vendor_id = ${vendor.id}
                  AND vo.statut != 'annulee'
                GROUP BY p.id, p.nom
                ORDER BY quantite_vendue DESC
                LIMIT 5
            `,
            prisma.$queryRaw`
                SELECT c.id, c.nom,
                       SUM(oi.quantite) AS quantite_vendue
                FROM order_items oi
                JOIN product_variants pv ON pv.id = oi.variant_id
                JOIN products p ON p.id = pv.product_id
                JOIN categories c ON c.id = p.category_id
                JOIN vendor_orders vo ON vo.id = oi.vendor_order_id
                WHERE vo.vendor_id = ${vendor.id}
                  AND vo.statut != 'annulee'
                GROUP BY c.id, c.nom
                ORDER BY quantite_vendue DESC
                LIMIT 8
            `,
            prisma.$queryRaw`
                SELECT date_trunc('day', date_creation) AS jour,
                       COUNT(*) AS total
                FROM users
                WHERE role = 'client'
                  AND date_creation >= NOW() - INTERVAL '30 days'
                GROUP BY jour
                ORDER BY jour ASC
            `,
        ]);

        res.status(200).json({
            succes: true,
            ventes: fillLast30Days(ventesRaw, "total"),
            topProduits: topProduits.map((p) => ({
                id: p.id,
                nom: p.nom,
                quantite: Number(p.quantite_vendue),
            })),
            topCategories: topCategories.map((c) => ({
                id: c.id,
                nom: c.nom,
                quantite: Number(c.quantite_vendue),
            })),
            nouveauxUtilisateurs: fillLast30Days(nouveauxUtilisateursRaw, "total"),
        });
    } catch (error) {
        next(error);
    }
};