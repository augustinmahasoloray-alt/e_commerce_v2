import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USER_SELECT = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
  role: true,
  compte_actif: true,
  date_creation: true,
};

// GET /api/admin/users?role=client|vendeur&recherche=...&page=1&limit=20
export const listUsers = async (req, res, next) => {
  try {
    const { role, recherche = "", page = 1, limit = 20 } = req.query;

    if (role && !["client", "vendeur"].includes(role)) {
      return res.status(400).json({
        succes: false,
        message: "Rôle invalide. Valeurs acceptées : client, vendeur",
      });
    }

    const where = {
      ...(role ? { role } : { role: { in: ["client", "vendeur"] } }),
      ...(recherche
        ? {
            OR: [
              { nom: { contains: recherche, mode: "insensitive" } },
              { prenom: { contains: recherche, mode: "insensitive" } },
              { email: { contains: recherche, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total, countsRaw] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { date_creation: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ["role"],
        where: { role: { in: ["client", "vendeur"] } },
        _count: { _all: true },
      }),
    ]);

    const counts = { client: 0, vendeur: 0 };
    countsRaw.forEach((row) => {
      counts[row.role] = row._count._all;
    });

    res.status(200).json({
      succes: true,
      users,
      counts,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/statut  body: { compte_actif: boolean }
export const updateUserStatus = async (req, res, next) => {
  try {
    const { compte_actif } = req.body;

    if (typeof compte_actif !== "boolean") {
      return res.status(400).json({
        succes: false,
        message: "Le champ compte_actif doit être un booléen (true/false).",
      });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      return res.status(404).json({ succes: false, message: "Utilisateur introuvable" });
    }

    if (target.role === "admin") {
      return res.status(403).json({
        succes: false,
        message: "Impossible de bloquer un compte administrateur.",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { compte_actif },
      select: USER_SELECT,
    });

    res.status(200).json({ succes: true, user });
  } catch (error) {
    next(error);
  }
};