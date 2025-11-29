
const express = require('express');
const router = express.Router({ mergeParams: true });

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validation = require('../middleware/validation');
const shoppingAbl = require('../abl/shopping-listabl');

// apply authentication to all shopping routes
router.use(authenticate);

// GET /shoppinglist-main/:awid/list
router.get('/list', authorize(['User','Authority']), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '0', 10);
    const dtoOut = shoppingAbl.list({ page, pageSize: 20 });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

// POST /shoppinglist-main/:awid/create
router.post('/create', authorize(['User','Authority']), validation.validateCreateList, async (req, res, next) => {
  try {
    const dtoOut = shoppingAbl.create({ name: req.body.name, ownerId: req.user.id });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

// GET /get?id=...
router.get('/get', authorize(['User','Authority']), validation.validateIdQuery, async (req, res, next) => {
  try {
    const dtoOut = shoppingAbl.get({ id: req.query.id, user: req.user });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

// DELETE /delete?id=...
router.delete('/delete', authorize(['Authority']), validation.validateIdQuery, async (req, res, next) => {
  try {
    const id = req.query.id;
    const dtoOut = shoppingAbl.remove({ id, user: req.user });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

// POST add item
router.post('/shopping-list/item/add', authorize(['User','Authority']), async (req, res, next) => {
  try {
    // validate fields manually
    if (!req.body.shoppingListId || !req.body.name) {
      const e = new Error('shoppingListId and name required');
      e.status = 400;
      e.uuAppErrorMap = { 'validation/fields-required': { type: 'error', message: 'shoppingListId, name required' } };
      throw e;
    }
    const dtoOut = shoppingAbl.addItem({ shoppingListId: req.body.shoppingListId, name: req.body.name, quantity: req.body.quantity || 1, createdBy: req.user.id });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

// DELETE remove item
router.delete('/shopping-list/item/remove', authorize(['User','Authority']), async (req, res, next) => {
  try {
    const itemId = req.body.itemId || req.query.itemId;
    if (!itemId) {
      const e = new Error('itemId required');
      e.status = 400;
      e.uuAppErrorMap = { 'validation/fields-required': { type: 'error', message: 'itemId required' } };
      throw e;
    }
    const dtoOut = shoppingAbl.removeItem({ itemId });
    res.json({ ...dtoOut, uuAppErrorMap: {} });
  } catch (err) { next(err); }
});

module.exports = router;
