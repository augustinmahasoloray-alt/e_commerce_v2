// middleware/roleMiddleware.js
//
// Doit toujours être utilisé APRÈS authMiddleware, puisqu'il dépend
// de req.user posé par le decode du JWT.

/**
 * Restreint l'accès à une route selon le(s) rôle(s) autorisé(s).
 * Usage : requireRole("admin")
 *         requireRole("vendeur", "admin")
 *         requireRole(["admin"])   // tableau accepté aussi
 */
const requireRole = (...rolesAutorises) => {
  const roles = rolesAutorises.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Non autorisé",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : rôle insuffisant",
      });
    }

    next();
  };
};

export default requireRole;