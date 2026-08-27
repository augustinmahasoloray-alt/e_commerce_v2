import prisma from "../config/db.js";

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Usage: node src/scripts/create-vendor.js <email-admin>");
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error(`Aucun utilisateur trouvé avec l'email : ${email}`);
        process.exit(1);
    }

    const existingVendor = await prisma.vendor.findUnique({
        where: { user_id: user.id },
    });

    if (existingVendor) {
        console.log("Un profil Vendor existe déjà pour cet utilisateur :");
        console.log(existingVendor);
        process.exit(0);
    }

    const vendor = await prisma.vendor.create({
        data: {
            user_id: user.id,
            nom_boutique: "StepUp",
            slug: "stepup",
            description: "Boutique officielle StepUp.",
            statut: "valide",
            date_validation: new Date(),
        },
    });

    console.log("Profil Vendor créé avec succès :");
    console.log(vendor);
}

main()
    .catch((err) => {
        console.error("Erreur lors de la création du Vendor :", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });