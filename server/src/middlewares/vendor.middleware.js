// middlewares/vendor.middleware.js
//
// Doit toujours être utilisé APRÈS authMiddleware ET roleMiddleware.
// Adapte le chemin d'import de prisma si besoin.

import prisma from "../config/db.js";

/**
 * Charge le profil Vendor de l'utilisateur connecté sur req.vendor.
 * - Si req.user.role !== "vendeur" (ex: admin), on ne fait rien et on
 *   passe directement à la suite : un admin n'a pas de profil Vendor,
 *   et ce n'est pas une erreur.
 * - Si role === "vendeur" mais pas de profil, ou profil pas encore
 *   validé, on bloque.
 */
const attachVendor = async (req, res, next) => {
  if (req.user.role !== "vendeur") {
    return next();
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { user_id: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({
        succes: false,
        message: "Aucun profil boutique associé à ce compte",
      });
    }

    if (vendor.statut !== "valide") {
      return res.status(403).json({
        succes: false,
        message:
          vendor.statut === "en_attente"
            ? "Votre boutique est en attente de validation par l'équipe StepUp"
            : "Votre boutique n'est pas autorisée à effectuer cette action",
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie qu'une ressource appartient au vendeur connecté.
 * Un admin passe toujours (droit de modération global) : on charge
 * quand même la ressource sur req.resource pour que le contrôleur
 * y ait accès sans requête supplémentaire.
 *
 * `modele` : nom du modèle Prisma ("product", "vendorOrder", ...)
 * `champVendorId` : champ FK vers vendor sur ce modèle
 */
const requireOwnership = (modele, champVendorId = "vendor_id") => {
  return async (req, res, next) => {
    try {
      const ressource = await prisma[modele].findUnique({
        where: { id: req.params.id },
      });

      if (!ressource) {
        return res.status(404).json({ succes: false, message: "Ressource introuvable" });
      }

      if (req.user.role === "admin") {
        req.resource = ressource;
        return next();
      }

      if (!req.vendor || ressource[champVendorId] !== req.vendor.id) {
        return res.status(403).json({
          succes: false,
          message: "Cette ressource ne vous appartient pas",
        });
      }

      req.resource = ressource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { attachVendor, requireOwnership };