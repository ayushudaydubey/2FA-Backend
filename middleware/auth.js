import express from  'express'
import jwt  from 'jsonwebtoken'


export function authMiddleware(req, res, next) {
  // Try to get token from cookie or Authorization header
  let token = req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC); // use JWT_SEC, not JWT_KEY
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}