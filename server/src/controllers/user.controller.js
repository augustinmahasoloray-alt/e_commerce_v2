import * as userService from "../services/user.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    if (!user) return res.status(404).json({ succes: false, message: "Utilisateur introuvable" });
    res.status(200).json({ succes: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ succes: true, user });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({ succes: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ succes: true, user });
  } catch (error) {
    next(error);
  }
};