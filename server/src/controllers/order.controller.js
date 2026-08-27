import * as orderService from "../services/order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json({ succes: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    res.status(200).json({ succes: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ succes: false, message: "Commande introuvable" });
    res.status(200).json({ succes: true, order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    // req.params.id est l'id de l'Order (id client-facing), pas du VendorOrder
    const vendorOrder = await orderService.updateOrderStatusByOrderId(req.params.id, req.body.statut);
    res.status(200).json({ succes: true, vendorOrder });
  } catch (error) {
    next(error);
  }
};