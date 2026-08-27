import * as addressService from "../services/address.service.js";

export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddressesByUser(req.user.id);
    res.status(200).json({ succes: true, addresses });
  } catch (error) {
    next(error);
  }
};

export const getMyDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.getDefaultAddress(req.user.id);
    res.status(200).json({ succes: true, address });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({ succes: true, address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({ succes: true });
  } catch (error) {
    next(error);
  }
};
