// src/scripts/seedAdmin.js
//
// Crée en une seule fois : le compte User (role=admin) + le profil Vendor lié.
// Usage :
//   node src/scripts/seedAdmin.js <email> <mot_de_passe> <nom> <prenom> [nom_boutique]
//
// Exemple :
//   node src/scripts/seedAdmin.js augustin@stepup.shop MonMotDePasse123 MAHASOLORAY Augustin StepUp

import prisma from "../config/db.js";
import { hashPassword } from "../services/auth.service.js";

const MAX_ADMIN_ACCOUNTS = 2;

async function main() {
    const [email, password, nom, prenom, nomBoutiqueArg] = process.argv.slice(2);

    if (!email || !password || !nom || !prenom) {
        console.error(
            "Usage : node src/scripts/seedAdmin.js <email> <mot_de_passe> <nom> <prenom> [nom_boutique]"
        );
        process.exit(1);
    }

    // Même garde-fou que la route /api/admin/auth/register
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount >= MAX_ADMIN_ACCOUNTS) {
        console.error(`✗ Limite atteinte : ${MAX_ADMIN_ACCOUNTS} comptes admin existent déjà.`);
        process.exit(1);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.error(`✗ Un utilisateur existe déjà avec l'email ${email}.`);
        process.exit(1);
    }

    const nomBoutique = nomBoutiqueArg || "StepUp";
    const slug = nomBoutique
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // retire les accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existingVendorSlug = await prisma.vendor.findUnique({ where: { slug } });
    if (existingVendorSlug) {
        console.error(`✗ Un vendor existe déjà avec le slug "${slug}". Passe un nom_boutique différent.`);
        process.exit(1);
    }

    const mot_de_passe_hash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            mot_de_passe_hash,
            nom,
            prenom,
            role: "admin",
        },
    });

    const vendor = await prisma.vendor.create({
        data: {
            user_id: user.id,
            nom_boutique: nomBoutique,
            slug,
            statut: "valide",
            date_validation: new Date(),
        },
    });

    console.log("✓ Compte admin créé avec succès :");
    console.log(`  User   : ${user.email} (id: ${user.id})`);
    console.log(`  Vendor : ${vendor.nom_boutique} (id: ${vendor.id}, slug: ${vendor.slug})`);
    console.log("\nTu peux maintenant te connecter sur /admin/index.html avec cet email/mot de passe.");
}

main()
    .catch((err) => {
        console.error("✗ Erreur :", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// node src/scripts/seedAdmin.js augustin@stepup.shop TonMotDePasse123 MAHASOLORAY Augustin StepUp