import { hashPassword, comparePassword, generateToken } from "../services/auth.service.js";
import prisma from "../config/db.js";

// Nombre maximum de comptes admin autorisés (usage strictement personnel)
const MAX_ADMIN_ACCOUNTS = 2;

// Création de compte admin — désactivée après MAX_ADMIN_ACCOUNTS créations
export const registerAdmin = async (req, res, next) => {
    try {
        const adminCount = await prisma.user.count({ where: { role: "admin" } });
        if (adminCount >= MAX_ADMIN_ACCOUNTS) {
            return res.status(403).json({
                success: false,
                message: "La création de compte administrateur est désactivée.",
            });
        }

        const { email, password, nom, prenom, telephone } = req.body;

        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs obligatoires doivent être remplis.",
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Cet email est déjà utilisé",
            });
        }

        const mot_de_passe_hash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                mot_de_passe_hash,
                nom,
                prenom,
                telephone,
                role: "admin",
            },
        });

        const token = await generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
        });
    } catch (error) {
        next(error);
    }
};

// Connexion admin — refuse les comptes non-admin même avec des identifiants valides
export const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect",
            });
        }

        const isMatch = await comparePassword(password, user.mot_de_passe_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect",
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Accès réservé à l'administrateur",
            });
        }

        const token = await generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
        });
    } catch (error) {
        next(error);
    }
};