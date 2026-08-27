import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STATUTS = ["en_attente", "confirmee", "expediee", "livree", "annulee"];
const NB_COMMANDES = 9;

async function getOrCreateTestClients(count = 4) {
  const existing = await prisma.user.findMany({ where: { role: "client" }, take: count });
  if (existing.length >= count) return existing;

  const created = [];
  for (let i = existing.length; i < count; i++) {
    const n = i + 1;
    const user = await prisma.user.create({
      data: {
        nom: `Client${n}`,
        prenom: "Test",
        email: `client.test${n}@stepup.test`,
        mot_de_passe_hash: "seed_placeholder_hash", // pas un vrai hash bcrypt, ces comptes ne sont pas prévus pour se connecter
        telephone: `03212345${String(n).padStart(2, "0")}`,
        role: "client",
      },
    });
    await prisma.address.create({
      data: {
        user_id: user.id,
        ligne1: `Lot ${n} bis Antananarivo`,
        ville: "Antananarivo",
        code_postal: "101",
        pays: "Madagascar",
        is_default: true,
      },
    });
    created.push(user);
  }
  return [...existing, ...created];
}

async function getVariantsWithStock() {
  return prisma.productVariant.findMany({
    where: { stock: { gt: 0 } },
    include: { product: true },
    take: 30,
  });
}

async function main() {
  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) {
    console.log(`⚠️  ${existingOrders} commande(s) déjà en base — le script ne recrée rien pour éviter les doublons.`);
    console.log("Pour re-seeder à vide : vide d'abord order_items, vendor_transactions, vendor_orders, orders.");
    return;
  }

  const vendor = await prisma.vendor.findFirst();
  if (!vendor) throw new Error("Aucun Vendor trouvé en base — impossible de seeder des commandes.");

  const variants = await getVariantsWithStock();
  if (variants.length === 0) throw new Error("Aucune variante avec du stock — crée d'abord des produits.");

  const clients = await getOrCreateTestClients(4);
  const now = Date.now();

  for (let i = 0; i < NB_COMMANDES; i++) {
    const client = clients[i % clients.length];
    const address = await prisma.address.findFirst({ where: { user_id: client.id } });

    const statut = STATUTS[i % STATUTS.length];
    const daysAgo = Math.floor(Math.random() * 45); // réparti sur 45 jours (pour tester jour/semaine/mois)
    const date_commande = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

    const nbItems = 1 + Math.floor(Math.random() * 3);
    const itemsChoisis = [];
    for (let j = 0; j < nbItems; j++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const quantite = 1 + Math.floor(Math.random() * 2);
      itemsChoisis.push({
        variant_id: variant.id,
        quantite,
        prix_unitaire: Number(variant.product.prix),
      });
    }

    const montant_total = itemsChoisis.reduce((s, it) => s + it.prix_unitaire * it.quantite, 0);
    const taux_commission = Number(vendor.taux_commission);
    const montant_commission = Math.round(montant_total * (taux_commission / 100) * 100) / 100;
    const montant_net = Math.round((montant_total - montant_commission) * 100) / 100;

    const order = await prisma.order.create({
      data: {
        user_id: client.id,
        address_id: address.id,
        mode_paiement: i % 2 === 0 ? "mobile_money" : "carte",
        mode_livraison: i % 2 === 0 ? "standard" : "express",
        montant_total,
        date_commande,
      },
    });

    const vendorOrder = await prisma.vendorOrder.create({
      data: {
        order_id: order.id,
        vendor_id: vendor.id,
        statut,
        montant_total,
        montant_commission,
        montant_net,
        items: { create: itemsChoisis },
      },
    });

    if (statut !== "en_attente" && statut !== "annulee") {
      await prisma.vendorTransaction.create({
        data: {
          vendor_id: vendor.id,
          vendor_order_id: vendorOrder.id,
          type: "credit_vente",
          statut: "effectue",
          montant: montant_net,
          description: `Vente commande ${order.id.slice(0, 8)} (seed)`,
        },
      });
    }

    console.log(`✔ Commande ${i + 1}/${NB_COMMANDES} créée — statut: ${statut}, montant: ${montant_total}`);
  }

  console.log("✅ Seed des commandes terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());