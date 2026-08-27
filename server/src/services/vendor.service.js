import prisma from "../config/db.js";

export const registerVendor = async (userId, { nom_boutique, slug, description, telephone_pro, moyen_paiement, numero_paiement }) => {
  const dejaVendeur = await prisma.vendor.findUnique({ where: { user_id: userId } });
  if (dejaVendeur) {
    throw new Error("Un profil boutique existe déjà pour ce compte");
  }

  const slugPris = await prisma.vendor.findUnique({ where: { slug } });
  if (slugPris) {
    throw new Error("Ce nom de boutique (slug) est déjà utilisé");
  }

  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.create({
      data: { user_id: userId, nom_boutique, slug, description, telephone_pro, moyen_paiement, numero_paiement },
    });

    await tx.user.update({ where: { id: userId }, data: { role: "vendeur" } });

    return vendor;
  });
};

export const getVendorProfile = async (userId) => {
  return prisma.vendor.findUnique({
    where: { user_id: userId },
    include: { _count: { select: { products: true, vendorOrders: true } } },
  });
};

export const updateVendorProfile = async (vendorId, data) => {
  const { nom_boutique, description, logo_url, telephone_pro, moyen_paiement, numero_paiement } = data;
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { nom_boutique, description, logo_url, telephone_pro, moyen_paiement, numero_paiement },
  });
};

export const getVendorSolde = async (vendorId) => {
  const transactions = await prisma.vendorTransaction.findMany({
    where: { vendor_id: vendorId, statut: "effectue" },
  });

  const solde = transactions.reduce((total, tr) => {
    const montant = Number(tr.montant);
    return tr.type === "credit_vente" ? total + montant : total - montant;
  }, 0);

  return Math.round(solde * 100) / 100;
};

/**
 * Agrège les données du dashboard vendeur en un minimum de requêtes.
 * - stats globales (CA, nb commandes, nb produits actifs)
 * - répartition des commandes par statut (pour les badges du dashboard)
 * - 5 dernières commandes
 */
export const getVendorDashboard = async (vendorId) => {
  const [
    nbProduitsActifs,
    vendorOrders,
    solde,
    commandesRecentes,
  ] = await Promise.all([
    prisma.product.count({ where: { vendor_id: vendorId, actif: true } }),
    prisma.vendorOrder.findMany({ where: { vendor_id: vendorId } }),
    getVendorSolde(vendorId),
    prisma.vendorOrder.findMany({
      where: { vendor_id: vendorId },
      include: {
        items: { include: { variant: { include: { product: { select: { nom: true } } } } } },
        order: { include: { user: { select: { nom: true, prenom: true } } } },
      },
      orderBy: { date_maj: "desc" },
      take: 5,
    }),
  ]);

  const chiffreAffaires = vendorOrders
    .filter((vo) => vo.statut !== "annulee")
    .reduce((total, vo) => total + Number(vo.montant_net), 0);

  const repartitionParStatut = vendorOrders.reduce((acc, vo) => {
    acc[vo.statut] = (acc[vo.statut] || 0) + 1;
    return acc;
  }, {});

  return {
    nb_produits_actifs: nbProduitsActifs,
    nb_commandes_total: vendorOrders.length,
    chiffre_affaires: Math.round(chiffreAffaires * 100) / 100,
    solde,
    repartition_par_statut: repartitionParStatut,
    commandes_recentes: commandesRecentes,
  };
};

export const getVendorOrders = async (vendorId, { statut } = {}) => {
  return prisma.vendorOrder.findMany({
    where: { vendor_id: vendorId, ...(statut && { statut }) },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      order: { include: { address: true, user: { select: { nom: true, prenom: true, telephone: true } } } },
    },
    orderBy: { date_maj: "desc" },
  });
};

export const updateVendorOrderStatus = async (vendorOrderId, statut) => {
  return prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { statut },
    include: { items: true },
  });
};

// ============ ACTIONS ADMIN ============

export const listVendorsByStatus = async (statut) => {
  return prisma.vendor.findMany({
    where: statut ? { statut } : undefined,
    include: { user: { select: { nom: true, prenom: true, email: true } } },
    orderBy: { date_creation: "desc" },
  });
};

export const validateVendor = async (vendorId) => {
  return prisma.vendor.update({
    where: { id: vendorId },
    data: { statut: "valide", date_validation: new Date() },
  });
};

export const rejectVendor = async (vendorId) => {
  return prisma.vendor.update({ where: { id: vendorId }, data: { statut: "rejete" } });
};

export const suspendVendor = async (vendorId) => {
  return prisma.vendor.update({ where: { id: vendorId }, data: { statut: "suspendu" } });
};