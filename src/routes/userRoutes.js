import express from 'express'
import { loginUserController, registerUserController, twoFactAuthSetUpController, twoFactAuthVerifyUpController } from '../controller/userController.js';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import userModel from '../models/userModel.js';
import rateLimit from 'express-rate-limit';
const routes = express.Router();

routes.post("/register", [body('email').isEmail().withMessage('Enter a valid email'),
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')], registerUserController)


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

routes.post('/login', loginLimiter, loginUserController);
routes.post("/2FA-setup", twoFactAuthSetUpController)
routes.post("/2FA-verify", twoFactAuthVerifyUpController)

routes.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


export default routes 