const express = require("express");
const router = express.Router();

const UsersAbl = require("../abl/userabl");
const authenticate  = require("../middleware/authenticate");
const authorize  = require("../middleware/authorize");

// Assign role (Authority only)
router.post("/assign-role", authenticate, authorize(["Authority"]), async (req, res, next) => {
  try {
    const dtoIn = req.body;
    const result = await UsersAbl.assignRole(dtoIn, req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Get current user
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const result = await UsersAbl.getCurrentUser(req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
