import { z } from "zod";
import { User, UserRole } from "../models/User.js";
import { signToken } from "../middleware/auth.js";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().min(6).optional(),
  role: z.enum([UserRole.PASSENGER, UserRole.DRIVER]).default(UserRole.PASSENGER),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req, res) {
  const { email, password, name, phone, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ email, name, phone, role, passwordHash });
  const token = signToken(user);
  res.status(201).json({ token, user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || user.disabled) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  user.passwordHash = undefined;
  const token = signToken(user);
  res.json({ token, user });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
