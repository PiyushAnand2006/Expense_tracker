import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ $or: [{ email: parsed.email }, { username: parsed.username }] });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    }

    const user = await User.create(parsed);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: { user: { id: user._id, username: user.username, email: user.email }, token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email }).select('+password');

    if (!user || !(await user.comparePassword(parsed.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: { user: { id: user._id, username: user.username, email: user.email }, token },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};
