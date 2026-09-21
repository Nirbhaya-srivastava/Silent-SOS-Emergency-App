import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbService } from '../services/databaseService.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      config.jwtSecret
    );

    const user = await dbService.findUserById(
      decoded.id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error:
          'User account not found or expired session',
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

export function requireAdmin(req, res, next) {
  if (
    !req.user ||
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error:
        'Access denied: Admin privileges required',
    });
  }

  next();
}