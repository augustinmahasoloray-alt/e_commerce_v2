import * as productService from "../services/product.service.js";
import { uploadImage } from "../services/cloudinary.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({ succes: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ succes: false, message: "Produit introuvable" });
    }
    res.status(200).json({ succes: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * Liste des produits DU vendeur connecté (dashboard), inclut les
 * produits désactivés. req.vendor posé par le middleware attachVendor.
 */
export const getMyProducts = async (req, res, next) => {
  try {
    const products = await productService.getProductsByVendor(req.vendor.id);
    res.status(200).json({ succes: true, products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    // Un vendeur crée toujours pour SA boutique : on ignore toute
    // tentative de vendor_id envoyée dans le body. Un admin peut
    // exceptionnellement créer pour un vendeur donné en le précisant.
    const vendor_id = req.user.role === "vendeur" ? req.vendor.id : req.body.vendor_id;

    if (!vendor_id) {
      return res.status(400).json({ succes: false, message: "vendor_id requis" });
    }

    const product = await productService.createProduct({ ...req.body, vendor_id });
    res.status(201).json({ succes: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Un vendeur ne peut jamais réassigner son produit à une autre
    // boutique, même en injectant vendor_id dans le body.
    if (req.user.role !== "admin") {
      delete data.vendor_id;
    }

    const product = await productService.updateProduct(req.params.id, data);
    res.status(200).json({ succes: true, product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ succes: true, message: "Produit désactivé" });
  } catch (error) {
    next(error);
  }
};

export const addProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ succes: false, message: "Aucune image fournie" });
    }
    const result = await uploadImage(req.file.buffer);
    const image = await productService.addProductImage(req.params.id, result.secure_url);
    res.status(201).json({ succes: true, image });
  } catch (error) {
    next(error);
  }
};

export const updateProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ succes: false, message: "Aucune image fournie" });
    }
    const result = await uploadImage(req.file.buffer);
    const image = await productService.updateProductImage(req.params.imageId, result.secure_url);
    res.status(200).json({ succes: true, image });
  } catch (error) {
    next(error);
  }
};