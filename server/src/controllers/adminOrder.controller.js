import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STATUTS = ["en_attente", "confirmee", "expediee", "livree", "annulee"];

const ORDER_INCLUDE = {
  order: {
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
      address: true,
    },
  },
  items: {
    include: {
      variant: {
        include: { product: { select: { id: true, nom: true } } },
      },
    },
  },
};

export const listOrders = async (req, res, next) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;

    if (statut && !STATUTS.includes(statut)) {
      return res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs acceptées : ${STATUTS.join(", ")}`,
      });
    }

    const vendor = await prisma.vendor.findFirst();
    if (!vendor) {
      return res.status(200).json({
        succes: true,
        orders: [],
        counts: { toutes: 0, ...Object.fromEntries(STATUTS.map((s) => [s, 0])) },
        total: 0,
        page: Number(page),
        limit: Number(limit),
      });
    }

    const where = { vendor_id: vendor.id, ...(statut ? { statut } : {}) };
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total, countsRaw] = await Promise.all([
      prisma.vendorOrder.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { order: { date_commande: "desc" } },
        skip,
        take: Number(limit),
      }),
      prisma.vendorOrder.count({ where }),
      prisma.vendorOrder.groupBy({
        by: ["statut"],
        where: { vendor_id: vendor.id },
        _count: { _all: true },
      }),
    ]);

    const counts = Object.fromEntries(STATUTS.map((s) => [s, 0]));
    countsRaw.forEach((row) => {
      counts[row.statut] = row._count._all;
    });
    counts.toutes = countsRaw.reduce((sum, row) => sum + row._count._all, 0);

    res.status(200).json({
      succes: true,
      orders,
      counts,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const vendorOrder = await prisma.vendorOrder.findUnique({
      where: { id: req.params.id },
      include: ORDER_INCLUDE,
    });

    if (!vendorOrder) {
      return res.status(404).json({ succes: false, message: "Commande introuvable" });
    }

    res.status(200).json({ succes: true, order: vendorOrder });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { statut } = req.body;

    if (!STATUTS.includes(statut)) {
      return res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs acceptées : ${STATUTS.join(", ")}`,
      });
    }

    const existing = await prisma.vendorOrder.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ succes: false, message: "Commande introuvable" });
    }

    const vendorOrder = await prisma.vendorOrder.update({
      where: { id: req.params.id },
      data: { statut },
      include: ORDER_INCLUDE,
    });

    res.status(200).json({ succes: true, order: vendorOrder });
  } catch (error) {
    next(error);
  }
};