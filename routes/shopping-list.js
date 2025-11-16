const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorization');
const { validateCreateList, validateId, validateRequiredFields } = require('../middleware/validation');

// Apply authentication to all shopping list routes
router.use(authenticate);

// 1. List shopping lists - Owner, Member, Authority
router.get('/list', authorize(['Owner', 'Member', 'Authority']), (req, res) => {
  const pageInfo = req.body.pageInfo || { pageIndex: 0, pageSize: 20 };
  
  res.json({
    list: [
      { id: "list1", name: "Grocery List", ownerId: "owner1", memberCount: 3 },
      { id: "list2", name: "Party Supplies", ownerId: "owner2", memberCount: 2 }
    ],
    pageInfo: {
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
      total: 2
    },
    uuAppErrorMap: {}
  });
});

// 2. Create shopping list - Owner, Authority
router.post('/create', 
  authorize(['Owner', 'Authority']),
  validateCreateList,
  (req, res) => {
    res.json({
      ...req.body,
      id: "mock-list-id-123",
      ownerId: req.user.id,
      uuAppErrorMap: {}
    });
  }
);

// 3. Get shopping list - Owner, Member, Authority
router.get('/get', 
  authorize(['Owner', 'Member', 'Authority']),
  validateId,
  (req, res) => {
    res.json({
      id: req.query.id,
      name: "Mock Shopping List",
      ownerId: "mock-owner-id",
      members: ["user1", "user2"],
      items: [
        { id: "item1", name: "Milk", quantity: 1, completed: false },
        { id: "item2", name: "Bread", quantity: 2, completed: true }
      ],
      uuAppErrorMap: {}
    });
  }
);

// Add all other endpoints here (delete, update, member operations, item operations)...

module.exports = router;