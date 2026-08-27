import prisma from "../config/db.js";

/**
 * Liste publique des produits (page Boutique).
 *
 * Filtres acceptés (tous optionnels) :
 * - category_id   : id d'une catégorie précise (univers OU sous-catégorie).
 *                    Prioritaire sur universe_id si les deux sont fournis.
 * - universe_id    : id d'un univers (catégorie racine) — inclut les produits
 *                    de cet univers ET de toutes ses sous-catégories.
 * - brand_id       : un id, ou plusieurs ids séparés par des virgules
 *                    ("id1,id2,id3").
 * - vendor_id      : filtre par boutique (page publique vendeur).
 * - etat           : une valeur ProductCondition, ou plusieurs séparées par
 *                    des virgules ("neuf,occasion").
 * - livraison_gratuite : "true" pour ne garder que les produits en livraison gratuite.
 * - prix_max       : prix maximum (filtre sur le prix de base, pas le prix promo).
 * - sort           : "recent" (défaut) | "prix_asc" | "prix_desc" | "note".
 */
export const getAllProducts = async ({
  page = 1,
  limit = 20,
  category_id,
  universe_id,
  brand_id,
  vendor_id,
  etat,
  livraison_gratuite,
  prix_max,
  sort,
}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const brandIds = brand_id ? String(brand_id).split(",").filter(Boolean) : null;
  const etatValues = etat ? String(etat).split(",").filter(Boolean) : null;

  const where = {
    actif: true,
    ...(category_id && { category_id }),
    ...(!category_id &&
      universe_id && {
        category: { OR: [{ id: universe_id }, { parent_id: universe_id }] },
      }),
    ...(brandIds && brandIds.length > 0 && { brand_id: { in: brandIds } }),
    ...(vendor_id && { vendor_id }),
    ...(etatValues && etatValues.length > 0 && { etat: { in: etatValues } }),
    ...(livraison_gratuite === "true" && { livraison_gratuite: true }),
    ...(prix_max && { prix: { lte: Number(prix_max) } }),
  };

  let orderBy = { date_creation: "desc" };
  if (sort === "prix_asc") orderBy = { prix: "asc" };
  else if (sort === "prix_desc") orderBy = { prix: "desc" };
  else if (sort === "note") orderBy = { note_moyenne: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        category: true,
        brand: true,
        images: { orderBy: { ordre: "asc" } },
        variants: true,
        vendor: { select: { id: true, nom_boutique: true, slug: true, logo_url: true } },
        _count: { select: { reviews: true } },
      },
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { ordre: "asc" } },
      variants: true,
      reviews: true,
      vendor: { select: { id: true, nom_boutique: true, slug: true, logo_url: true } },
    },
  });
};

/**
 * Produits d'un vendeur pour SON dashboard : contrairement à
 * getAllProducts, inclut aussi les produits désactivés (actif: false),
 * puisque le vendeur doit pouvoir les retrouver pour les réactiver.
 */
export const getProductsByVendor = async (vendorId) => {
  return prisma.product.findMany({
    where: { vendor_id: vendorId },
    include: { category: true, brand: true, images: true, variants: true },
    orderBy: { date_creation: "desc" },
  });
};

export const createProduct = async (data) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id, data) => {
  return prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id) => {
  return prisma.product.update({ where: { id }, data: { actif: false } });
};

export const addProductImage = async (productId, url, ordre = 0) => {
  return prisma.productImage.create({
    data: { product_id: productId, url, ordre },
  });
};

export const updateProductImage = async (imageId, newUrl) => {
  return prisma.productImage.update({
    where: { id: imageId },
    data: { url: newUrl },
  });
};