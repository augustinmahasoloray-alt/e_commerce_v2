import { hashPassword, comparePassword, generateToken } from "../services/auth.service.js";
import prisma from "../config/db.js";

//sign up
export const register = async (req, res, next) => {
    try {
        const { email, password, nom, prenom, telephone } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ succes: false, message: "cet email est déjà utilisé" });
        };

        const mot_de_passe_hash = await hashPassword(password);

        const user = await prisma.user.create(
            { data: { email, mot_de_passe_hash, nom, prenom, telephone }, }
        );

        const token = await generateToken(user)

        res.status(201).json({
            succes: true,
            token,
            user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
        });
    } catch (error) {
        next(error)
    }
};

//sign in
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            })
        }

        const isMatch = await comparePassword(password, user.mot_de_passe_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            })
        }

        const token = await generateToken(user)

        res.status(200).json({
            succes: true,
            token,
            user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role }
        });
    } catch (error) {
        next(error)
    }
};