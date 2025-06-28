import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import userModel from '../models/userModel.js';
import { sendOtpToEmail } from '../utils/sendOtp.js';

export async function registerUserController(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, twoFactorAuth } = req.body;

  try {
    const exist = await userModel.findOne({ email });
    if (exist) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash,
      twoFactorAuth,
      twoFactorEnabled: true
    });

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 5 * 60 * 1000);

      user.twoFactorCode = otp;
      user.twoFactorExpiry = expiry;
      await user.save();

      await sendOtpToEmail(user.email, otp);

      const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '5m' });
      return res.json({ requires2FA: true, tempToken });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const twoFactAuthSetUpController = async (req, res) => {
  const { email } = req.body;

  const secret = speakeasy.generateSecret({ name: `SecureApp(${email})` });

  qrcode.toDataURL(secret.otpauth_url, async (err, data_url) => {
    if (err) return res.status(500).json({ error: 'QR code failed' });

    await userModel.updateOne({ email }, { twoFactorAuth: secret.base32 });
    res.json({ qrcode: data_url });
  });
};

export const twoFactAuthVerifyUpController = async (req, res) => {
  const { tempToken, token: otp } = req.body;

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SEC);
    const user = await userModel.findById(decoded.id);

    if (!user || user.twoFactorCode !== otp || user.twoFactorExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.twoFactorCode = null;
    user.twoFactorExpiry = null;
    await user.save();

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '1d' });
    res.json({ token: authToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
