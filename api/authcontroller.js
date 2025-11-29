
const express = require('express');
const router = express.Router();
const authAbl = require('../abl/authabl');

// GET /auth/google -> redirect URL string (we'll redirect)
router.get('/google', async (req, res, next) => {
  try {
    const url = await authAbl.getAuthUrl();
    // redirect user agent to Google
    res.redirect(url);
  } catch (err) {
    next(err);
  }
});

// callback: GET /auth/google/callback?code=...&state=...
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      const e = new Error('No code provided');
      e.status = 400;
      throw e;
    }
    const result = await authAbl.handleGoogleCallback(code);
    // return JSON with token and user
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
