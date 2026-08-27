const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require("bcrypt");

// Instanciation directe de l'adaptateur avec la variable d'environnement
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Début du seed");
  try {
    const password1 = await bcrypt.hash("augustin04g", 10);
    const user1 = await prisma.user.create({
      data: {
        nom: "Augustin",
        prenom: "Onjaniaina",
        email: "augustinmahasoloray@gmail.com",
        mot_de_passe_hash: password1,
        telephone: "0387941600",
        role: "client",
      },
    });
    console.log("Utilisateur créé avec succès :", user1);
  } catch (error) {
    console.error("Erreur pendant la création de l'utilisateur :", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });