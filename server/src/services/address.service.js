import prisma from "../config/db.js";

export const getAddressesByUser = async (userId) => {
  return prisma.address.findMany({
    where: { user_id: userId },
    orderBy: { is_default: "desc" },
  });
};

export const getDefaultAddress = async (userId) => {
  return prisma.address.findFirst({
    where: { user_id: userId, is_default: true },
  });
};

export const createAddress = async (userId, { ligne1, ligne2, ville, code_postal, pays, is_default }) => {
  return prisma.$transaction(async (tx) => {
    const addressCount = await tx.address.count({ where: { user_id: userId } });

    const doitEtreDefault = is_default || addressCount === 0;

    if (doitEtreDefault) {
      await tx.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    return tx.address.create({
      data: {
        user_id: userId,
        ligne1,
        ligne2,
        ville,
        code_postal,
        pays,
        is_default: doitEtreDefault,
      },
    });
  });
};

export const deleteAddress = async (userId, addressId) => {
  return prisma.address.deleteMany({
    where: { id: addressId, user_id: userId },
  });
};
