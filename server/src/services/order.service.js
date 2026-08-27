import prisma from "../config/db.js";

/**
 * Crée une commande client, en la répartissant automatiquement en
 * une VendorOrder par vendeur présent dans le panier.
 *
 * Déroulé dans une seule transaction atomique :
 * 1. Vérifie stock + calcule le prix réel de chaque item (jamais
 *    faire confiance au prix envoyé par le client)
 * 2. Groupe les items par vendeur
 * 3. Crée l'Order (niveau client, 1 paiement, 1 adresse)
 * 4. Crée un VendorOrder par vendeur avec ses OrderItem, sa
 *    commission calculée selon le taux_commission du vendeur
 * 5. Crée une VendorTransaction (credit_vente) par VendorOrder,
 *    qui alimente le solde du vendeur dans le ledger
 */
export const createOrder = async (userId, { address_id, mode_paiement, mode_livraison, items, coupon_id }) => {
  return prisma.$transaction(async (tx) => {
    let montant_total_global = 0;

    // vendor_id -> { vendor, items: [...] }
    const groupesParVendeur = new Map();

    for (const item of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variant_id },
        include: { product: { include: { vendor: true } } },
      });

      if (!variant) {
        throw new Error(`Variante ${item.variant_id} introuvable`);
      }
      if (variant.stock < item.quantite) {
        throw new Error(`Stock insuffisant pour ${variant.product.nom}`);
      }
      if (variant.product.vendor.statut !== "valide") {
        throw new Error(`La boutique de ${variant.product.nom} n'est plus disponible`);
      }

      const prixReel = Number(variant.product.prix);
      const vendorId = variant.product.vendor_id;

      montant_total_global += prixReel * item.quantite;

      if (!groupesParVendeur.has(vendorId)) {
        groupesParVendeur.set(vendorId, {
          vendor: variant.product.vendor,
          items: [],
        });
      }

      groupesParVendeur.get(vendorId).items.push({
        variant_id: item.variant_id,
        quantite: item.quantite,
        prix_unitaire: prixReel,
      });

      await tx.productVariant.update({
        where: { id: item.variant_id },
        data: { stock: { decrement: item.quantite } },
      });
    }

    const order = await tx.order.create({
      data: {
        user_id: userId,
        address_id,
        coupon_id,
        mode_paiement,
        mode_livraison,
        montant_total: montant_total_global,
      },
    });

    const vendorOrders = [];

    for (const [vendorId, groupe] of groupesParVendeur) {
      const montantVendeur = groupe.items.reduce(
        (somme, item) => somme + item.prix_unitaire * item.quantite,
        0
      );

      const tauxCommission = Number(groupe.vendor.taux_commission); // en %
      const montantCommission = Math.round(montantVendeur * (tauxCommission / 100) * 100) / 100;
      const montantNet = Math.round((montantVendeur - montantCommission) * 100) / 100;

      const vendorOrder = await tx.vendorOrder.create({
        data: {
          order_id: order.id,
          vendor_id: vendorId,
          montant_total: montantVendeur,
          montant_commission: montantCommission,
          montant_net: montantNet,
          items: { create: groupe.items },
        },
        include: { items: true },
      });

      // Crédit du vendeur dans le ledger : le montant net lui est
      // acquis dès la vente, indépendamment du moment où on lui
      // versera réellement l'argent (via MVola/OM plus tard).
      await tx.vendorTransaction.create({
        data: {
          vendor_id: vendorId,
          vendor_order_id: vendorOrder.id,
          type: "credit_vente",
          statut: "effectue",
          montant: montantNet,
          description: `Vente commande ${order.id.slice(0, 8)}`,
        },
      });

      vendorOrders.push(vendorOrder);
    }

    return { ...order, vendorOrders };
  });
};

export const getOrdersByUser = async (userId) => {
  return prisma.order.findMany({
    where: { user_id: userId },
    include: {
      address: true,
      vendorOrders: {
        include: {
          vendor: { select: { id: true, nom_boutique: true, slug: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      },
    },
    orderBy: { date_commande: "desc" },
  });
};

export const getOrderById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      user: true,
      vendorOrders: {
        include: {
          vendor: { select: { id: true, nom_boutique: true, slug: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      },
    },
  });
};

/**
 * Le statut de traitement/livraison vit désormais au niveau du
 * VendorOrder (chaque vendeur gère sa propre expédition), et non
 * plus au niveau de l'Order global. Remplace l'ancien updateOrderStatus.
 */
export const updateVendorOrderStatus = async (vendorOrderId, statut) => {
  return prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { statut },
    include: { items: true, vendor: { select: { id: true, nom_boutique: true } } },
  });
};

/**
 * Toutes les VendorOrder d'un vendeur donné — sert de base au
 * dashboard vendeur (liste de ses commandes à traiter).
 */
export const getVendorOrders = async (vendorId) => {
  return prisma.vendorOrder.findMany({
    where: { vendor_id: vendorId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      order: { include: { address: true, user: { select: { nom: true, prenom: true, telephone: true } } } },
    },
    orderBy: { date_maj: "desc" },
  });
};

/**
 * Change le statut de traitement d'une commande à partir de l'id de
 * l'Order (id client-facing). En mono-vendeur, un Order n'a qu'un
 * seul VendorOrder en pratique, donc on le retrouve et on le met à
 * jour directement. Remplace l'usage direct de updateVendorOrderStatus
 * quand on ne connaît que l'order_id.
 */
export const updateOrderStatusByOrderId = async (orderId, statut) => {
  const vendorOrder = await prisma.vendorOrder.findFirst({
    where: { order_id: orderId },
  });

  if (!vendorOrder) {
    throw new Error(`Aucune commande vendeur trouvée pour la commande ${orderId}`);
  }

  return prisma.vendorOrder.update({
    where: { id: vendorOrder.id },
    data: { statut },
    include: { items: true, order: true },
  });
};

/**
 * Listing admin de toutes les commandes, avec filtre optionnel par
 * statut (le statut vit sur VendorOrder, pas sur Order). Retourne les
 * Order avec leur(s) VendorOrder(s) inclus, triées par date décroissante.
 */
export const getAllOrdersAdmin = async ({ statut } = {}) => {
  return prisma.order.findMany({
    where: statut ? { vendorOrders: { some: { statut } } } : undefined,
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
      address: true,
      vendorOrders: {
        include: {
          items: { include: { variant: { include: { product: true } } } },
        },
      },
    },
    orderBy: { date_commande: "desc" },
  });
};