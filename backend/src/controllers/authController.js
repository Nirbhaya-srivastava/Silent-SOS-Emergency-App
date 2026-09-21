import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbService } from '../services/databaseService.js';
import {
  loginSchema,
  registerSchema,
} from '../validators/index.js';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: '7d',
    }
  );
}

export async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);

    const existing =
      await dbService.findUserByEmail(validated.email);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Email address already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(
      validated.password,
      salt
    );

    const user = await dbService.createUser({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      passwordHash,
      role: 'user',
    });

    const token = generateToken(user);

    const { passwordHash: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);

    const user =
      await dbService.findUserByEmail(validated.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(
      validated.password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { passwordHash: _, ...safeUser } = req.user;

    res.json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}