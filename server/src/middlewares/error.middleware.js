import dotenv from "dotenv";
dotenv.config();

const formatPrismaError = (err) => {
  // Erreur de validation Prisma (champ obligatoire manquant, type invalide, etc.)
  if (err.name === "PrismaClientValidationError") {
    return {
      statusCode: 400,
      message: "Données invalides : merci de vérifier les champs du formulaire.",
    };
  }

  // Contrainte unique violée (ex: email déjà utilisé)
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "cette valeur";
    return { statusCode: 400, message: `Ce ${field} est déjà utilisé.` };
  }

  // Ressource liée introuvable
  if (err.code === "P2025") {
    return { statusCode: 404, message: "Ressource introuvable." };
  }

  return null;
};

const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  const prismaError = formatPrismaError(err);

  const statusCode = prismaError?.statusCode || err.statusCode || 500;
  const message = prismaError?.message || err.message || "Erreur interne du serveur";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;