const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorization');
const { validateCreateList, validateId, validateRequiredFields } = require('../middleware/validation');

router.get('/list', (req, res) => {
  res.json({
    list: [
      { id: "list1", name: "Grocery List", ownerId: "owner1", memberCount: 3 },
      { id: "list2", name: "Party Supplies", ownerId: "owner2", memberCount: 2 }
    ],
    pageInfo: { pageIndex: 0, pageSize: 20, total: 2 },
    uuAppErrorMap: {}
  });
});

router.post('/create', authorize(['Owner', 'Authority']), validateCreateList, (req, res) => {
  res.json({
    ...req.body,
    id: "list-" + Date.now(),
    ownerId: req.user.id,
    uuAppErrorMap: {}
  });
});

router.get('/get', validateId, (req, res) => {
  res.json({
    id: req.query.id,
    name: "Shopping List",
    ownerId: "owner1",
    members: ["user1", "user2"],
    items: [
      { id: "item1", name: "Milk", quantity: 1, completed: false },
      { id: "item2", name: "Bread", quantity: 2, completed: true }
    ],
    uuAppErrorMap: {}
  });
});

router.delete('/delete', authorize(['Owner', 'Authority']), validateId, (req, res) => {
  res.json({ deleted: true, uuAppErrorMap: {} });
});

router.post('/update', authorize(['Owner', 'Authority']), validateId, validateCreateList, (req, res) => {
  res.json({ id: req.body.id, name: req.body.name, uuAppErrorMap: {} });
});

router.post('/shopping-list/member/invite', authorize(['Owner', 'Authority']), validateRequiredFields(['shoppingListId', 'userId']), (req, res) => {
  res.json({ invited: true, uuAppErrorMap: {} });
});

router.delete('/shopping-list/member/remove', authorize(['Owner', 'Authority']), validateRequiredFields(['shoppingListId', 'userId']), (req, res) => {
  res.json({ removed: true, uuAppErrorMap: {} });
});

router.post('/shopping-list/item/add', validateRequiredFields(['shoppingListId', 'name']), (req, res) => {
  res.json({
    id: "item-" + Date.now(),
    name: req.body.name,
    quantity: req.body.quantity || 1,
    completed: false,
    createdBy: req.user.id,
    uuAppErrorMap: {}
  });
});

router.delete('/shopping-list/item/remove', validateRequiredFields(['shoppingListId', 'itemId']), (req, res) => {
  res.json({ removed: true, uuAppErrorMap: {} });
});

router.post('/shopping-list/item/edit', validateRequiredFields(['shoppingListId', 'itemId']), (req, res) => {
  res.json({
    id: req.body.itemId,
    name: req.body.name,
    quantity: req.body.quantity,
    completed: false,
    uuAppErrorMap: {}
  });
});

router.post('/shopping-list/item/set-completed', validateRequiredFields(['shoppingListId', 'itemId', 'completed']), (req, res) => {
  res.json({
    id: req.body.itemId,
    completed: req.body.completed,
    uuAppErrorMap: {}
  });
});

module.exports = router;