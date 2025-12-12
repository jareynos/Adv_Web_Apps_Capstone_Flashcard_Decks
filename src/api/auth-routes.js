const express = require('express');
const router = express.Router();
const auth = require('../services/auth-service');

// POST /api/auth/register
router.post('/register', (req, res, next) => {
  try {
    const user = auth.register(req.body);
    // auto-login on register
    req.session.userId = user.id;
    res.status(201).json(user);
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const user = auth.login(req.body);
    req.session.userId = user.id;
    res.json(user);
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  // return basic info
  res.json({ id: req.session.userId });
});

module.exports = router;
