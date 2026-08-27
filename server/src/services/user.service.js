import prisma from "../config/db.js";

export const getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      role: true,
      date_creation: true,
      addresses: true,
    },
  });
};

export const updateProfile = async (userId, { nom, prenom, telephone }) => {
  return prisma.user.update({
    where: { id: userId },
    data: { nom, prenom, telephone },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      role: true,
    },
  });
};

export const getAllUsers = async ({ page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: Number(limit),
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        date_creation: true,
      },
      orderBy: { date_creation: "desc" },
    }),
    prisma.user.count(),
  ]);

  return { users, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

export const updateUserRole = async (userId, role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });
};