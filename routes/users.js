
const express = require("express");
const router = express.Router();
const Joi = require('joi');

const UserAbl = require("../abl/userabl");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// POST /users/register
router.post("/register", async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(1).max(100).required(),
      password: Joi.string().min(6).required()
    });
    
    const { error, value } = schema.validate(req.body);
    if (error) {
      const e = new Error('Validation failed: ' + error.message);
      e.status = 400;
      e.uuAppErrorMap = { 'validation/failed': { type: 'error', message: error.message } };
      throw e;
    }
    
    const result = await UserAbl.register(value);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/login
router.post("/login", async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
    
    const { error, value } = schema.validate(req.body);
    if (error) {
      const e = new Error('Validation failed: ' + error.message);
      e.status = 400;
      e.uuAppErrorMap = { 'validation/failed': { type: 'error', message: error.message } };
      throw e;
    }
    
    const result = await UserAbl.login(value);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /users/me
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const result = await UserAbl.getCurrentUser(req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/assign-role
router.post("/assign-role", authenticate, authorize(["Authority"]), async (req, res, next) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      role: Joi.string().valid('Authority', 'Member').required() // ✅ CHANGE 'User' to 'Member'
    });
    
    const { error, value } = schema.validate(req.body);
    if (error) {
      const e = new Error('Validation failed: ' + error.message);
      e.status = 400;
      e.uuAppErrorMap = { 'validation/failed': { type: 'error', message: error.message } };
      throw e;
    }
    
    const result = await UserAbl.assignRole({ ...value, performedBy: req.user });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;