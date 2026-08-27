// middlewares/admin.middleware.js
// À utiliser APRÈS authMiddleware sur toute route /api/admin/...
// authMiddleware vérifie que le token est valide et peuple req.user.
// adminMiddleware vérifie en plus que ce user a bien le rôle admin.

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Accès réservé à l'administrateur",
        });
    }
    next();
};

export default adminMiddleware;