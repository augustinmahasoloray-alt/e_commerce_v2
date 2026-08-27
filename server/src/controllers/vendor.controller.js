// controllers/vendor.controller.js
import * as vendorService from "../services/vendor.service.js";
import prisma from "../config/db.js";

export const applyAsVendor = async (req, res, next) => {
    try {
        // Crée une candidature de vendeur pour l'utilisateur connecté
        const vendor = await vendorService.registerVendor(req.user.id, req.body);
        res.status(201).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

export const getMyVendorProfile = async (req, res, next) => {
    try {
        // Récupère le profil du vendeur connecté
        const vendor = await vendorService.getVendorProfile(req.user.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Profil boutique introuvable" });
        }
        res.status(200).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

export const updateMyVendorProfile = async (req, res, next) => {
    try {
        // Met à jour le profil du vendeur connecté
        const vendor = await vendorService.updateVendorProfile(req.vendor.id, req.body);
        res.status(200).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

export const getMySolde = async (req, res, next) => {
    try {
        // Récupère le solde du vendeur connecté
        const solde = await vendorService.getVendorSolde(req.vendor.id);
        res.status(200).json({ success: true, solde });
    } catch (error) {
        next(error);
    }
};

export const getMyDashboard = async (req, res, next) => {
    try {
        // Récupère le tableau de bord du vendeur connecté
        const dashboard = await vendorService.getVendorDashboard(req.vendor.id);
        res.status(200).json({ success: true, dashboard });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        // Récupère les commandes du vendeur connecté
        const orders = await vendorService.getVendorOrders(req.vendor.id, { statut: req.query.statut });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        // Met à jour le statut d'une commande du vendeur
        const vendorOrder = await vendorService.updateVendorOrderStatus(req.params.id, req.body.statut);
        res.status(200).json({ success: true, vendorOrder });
    } catch (error) {
        next(error);
    }
};

// ============ ADMIN ============
export const listVendors = async (req, res, next) => {
    try {
        // Liste tous les vendeurs (pour l'admin)
        const vendors = await vendorService.listVendorsByStatus(req.query.statut);
        res.status(200).json({ success: true, vendors });
    } catch (error) {
        next(error);
    }
};

export const validateVendor = async (req, res, next) => {
    try {
        // Valide un vendeur (pour l'admin)
        const vendor = await vendorService.validateVendor(req.params.id);
        res.status(200).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

export const rejectVendor = async (req, res, next) => {
    try {
        // Rejette un vendeur (pour l'admin)
        const vendor = await vendorService.rejectVendor(req.params.id);
        res.status(200).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};

export const suspendVendor = async (req, res, next) => {
    try {
        // Suspend un vendeur (pour l'admin)
        const vendor = await vendorService.suspendVendor(req.params.id);
        res.status(200).json({ success: true, vendor });
    } catch (error) {
        next(error);
    }
};