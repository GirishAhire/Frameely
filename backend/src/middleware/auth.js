import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  // EMERGENCY: Skip all authentication for the presentation
  console.log('⚠️ EMERGENCY MODE: Authentication bypass enabled for admin routes');
  req.user = { 
    isAdmin: true, 
    _id: 'emergency-admin-id',
    name: 'Emergency Admin',
    email: 'admin@emergency.com'
  };
  return next();
}; 