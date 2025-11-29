
const express = require("express");
const router = express.Router();

// Redirect root to Google OAuth (like professor's demo)
router.get("/", (req, res) => {
  res.redirect('/auth/google');
});

module.exports = router;