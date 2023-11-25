// middleware/authMiddleware.ts
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next: NextFunction): void {
  const token = req.headers('Authorization')?.split(' ')[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    req.user = user;
    next();
  });
}

export { authenticateToken };
