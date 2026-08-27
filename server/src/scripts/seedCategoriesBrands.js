// server/src/scripts/seedCategoriesBrands.js
//
// Seed des catégories (univers + sous-catégories) et des marques,
// avec les marques déjà liées à leur univers via la relation
// many-to-many Brand <-> Category.
//
// Basé sur la structure vue dans Boutique.jsx (tableau `univers`).
// Idempotent : peut être relancé sans dupliquer (upsert sur le nom).

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DATA = [
    {
        universNom: "Chaussures",
        categories: ["Sneakers", "Running", "Talons", "Bottes", "Sandales", "Mocassins", "Enfants", "Accessoires"],
        brands: ["Nike", "Adidas", "Puma", "Clarks", "Timberland", "Birkenstock"],
    },
    {
        universNom: "Électronique",
        categories: ["PC Gaming", "Consoles", "Écrans", "Casques", "Claviers", "Smartphones"],
        brands: ["Asus", "MSI", "Sony", "Microsoft", "Samsung", "Razer", "Logitech", "Apple"],
    },
];

async function main() {
    for (const { universNom, categories, brands } of DATA) {
        // 1. Catégorie racine (univers)
        let univers = await prisma.category.findFirst({
            where: { nom: universNom, parent_id: null },
        });

        if (!univers) {
            univers = await prisma.category.create({
                data: { nom: universNom },
            });
            console.log(`✅ Univers créé : ${universNom}`);
        } else {
            console.log(`↷ Univers déjà présent : ${universNom}`);
        }

        // 2. Sous-catégories
        for (const catNom of categories) {
            const existing = await prisma.category.findFirst({
                where: { nom: catNom, parent_id: univers.id },
            });

            if (!existing) {
                await prisma.category.create({
                    data: { nom: catNom, parent_id: univers.id },
                });
                console.log(`  ✅ Sous-catégorie créée : ${universNom} > ${catNom}`);
            } else {
                console.log(`  ↷ Sous-catégorie déjà présente : ${universNom} > ${catNom}`);
            }
        }

        // 3. Marques, liées directement à l'univers
        for (const brandNom of brands) {
            let brand = await prisma.brand.findFirst({ where: { nom: brandNom } });

            if (!brand) {
                brand = await prisma.brand.create({
                    data: {
                        nom: brandNom,
                        categories: { connect: { id: univers.id } },
                    },
                });
                console.log(`  ✅ Marque créée et liée : ${brandNom} -> ${universNom}`);
            } else {
                await prisma.brand.update({
                    where: { id: brand.id },
                    data: { categories: { connect: { id: univers.id } } },
                });
                console.log(`  ↷ Marque déjà présente, liaison vérifiée : ${brandNom} -> ${universNom}`);
            }
        }
    }

    console.log("\nTerminé.");
}

main()
    .catch((err) => {
        console.error("Erreur :", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });