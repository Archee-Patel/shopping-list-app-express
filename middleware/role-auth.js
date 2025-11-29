// middleware/role-auth.js
const { ShoppingList } = require('../models/ShoppingList');

// Role-based access control for shopping lists
module.exports = {
  // Authority can access everything
  requireAuthority: (req, res, next) => {
    if (!req.user.profiles.includes('Authority')) {
      const e = new Error('Authority access required');
      e.status = 403;
      e.uuAppErrorMap = { 'auth/authority-required': { type: 'error', message: 'Authority role required' } };
      return next(e);
    }
    next();
  },

  // Owner can access their own lists + shared lists
  requireOwnerOrMember: async (req, res, next) => {
    try {
      const listId = req.params.listId || req.body.shoppingListId || req.query.listId;
      
      if (!listId) {
        return next(); // No specific list - general access
      }

      const list = await ShoppingList.findById(listId);
      if (!list) {
        const e = new Error('List not found');
        e.status = 404;
        e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
        return next(e);
      }

      // Authority can access everything
      if (req.user.profiles.includes('Authority')) {
        req.list = list;
        return next();
      }

      // Owner can access their own lists
      const isOwner = list.owner.equals(req.user._id);
      
      // Member can access lists they're members of
      const isMember = list.members.some(member => 
        member.user.equals(req.user._id) && member.role === 'Member'
      );

      if (!isOwner && !isMember) {
        const e = new Error('Access denied to this list');
        e.status = 403;
        e.uuAppErrorMap = { 'auth/access-denied': { type: 'error', message: 'You do not have access to this list' } };
        return next(e);
      }

      req.list = list;
      req.userRole = isOwner ? 'Owner' : 'Member';
      next();
    } catch (error) {
      next(error);
    }
  },

  // Only list owner can modify/delete the list
  requireListOwner: async (req, res, next) => {
    try {
      const listId = req.params.listId || req.body.shoppingListId;
      const list = await ShoppingList.findById(listId);

      if (!list) {
        const e = new Error('List not found');
        e.status = 404;
        e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
        return next(e);
      }

      // Authority can do anything
      if (req.user.profiles.includes('Authority')) {
        req.list = list;
        return next();
      }

      // Only owner can modify their list
      if (!list.owner.equals(req.user._id)) {
        const e = new Error('Only list owner can perform this action');
        e.status = 403;
        e.uuAppErrorMap = { 'auth/owner-required': { type: 'error', message: 'Only list owner can perform this action' } };
        return next(e);
      }

      req.list = list;
      next();
    } catch (error) {
      next(error);
    }
  }
};