import authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: 'Compte créé avec succès. Vérifiez votre email.',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmail(email, code);
    res.json({
      message: 'Email vérifié avec succès',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationCode(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
