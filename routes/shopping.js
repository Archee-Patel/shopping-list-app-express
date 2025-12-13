// routes/shopping.js - UPDATED WITH ROLE-BASED ACCESS
const express = require("express");
const router = express.Router({ mergeParams: true });

const ShoppingAbl = require("../abl/shopping-listabl");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const roleAuth = require("../middleware/role-auth"); // role based auth

// GET /shoppinglist-main/:awid/list - Users see only their lists
router.get("/list", authenticate, roleAuth.requireOwnerOrMember, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const result = await ShoppingAbl.list({ 
      page,
      pageSize,
      user: req.user 
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /shoppinglist-main/:awid/create - Any authenticated user can create
router.post("/create", authenticate, async (req, res, next) => {
  try {
    const result = await ShoppingAbl.create({
      name: req.body.name,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /shoppinglist-main/:awid/get - Only owners/members can view
router.get("/get", authenticate, roleAuth.requireOwnerOrMember, async (req, res, next) => {
  try {
    const itemPage = parseInt(req.query.itemPage) || 0;
    const itemPageSize = parseInt(req.query.itemPageSize) || 20;
    
    const result = await ShoppingAbl.getListItems({
      listId: req.query.id,
      page: itemPage,
      pageSize: itemPageSize,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /shoppinglist-main/:awid/update - Only owners can update
router.post("/update", authenticate, roleAuth.requireListOwner, async (req, res, next) => {
  try {
    const result = await ShoppingAbl.update({
      ...req.body,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /shoppinglist-main/:awid/delete - Only owners/authority can delete
router.post("/delete", authenticate, roleAuth.requireListOwner, async (req, res, next) => {
  try {
    const result = await ShoppingAbl.remove({
      ...req.body,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /shoppinglist-main/:awid/item/add - Owners/members can add items
router.post("/item/add", authenticate, roleAuth.requireOwnerOrMember, async (req, res, next) => {
  try {
    const result = await ShoppingAbl.addItem({
      ...req.body,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /shoppinglist-main/:awid/item/remove - Owners or item creators can remove
router.post("/item/remove", authenticate, roleAuth.requireOwnerOrMember, async (req, res, next) => {
  try {
    const result = await ShoppingAbl.removeItem({
      ...req.body,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:listId/items", authenticate, roleAuth.requireOwnerOrMember, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 20;
    
    const result = await ShoppingAbl.getListItems({
      listId: req.params.listId,
      page,
      pageSize,
      user: req.user
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});


module.exports = router;