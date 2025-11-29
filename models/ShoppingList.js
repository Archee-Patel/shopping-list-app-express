const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // owner field
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Owner', 'Member'], default: 'Member' }
  }]
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  shoppingList: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = {
  ShoppingList: mongoose.model('ShoppingList', shoppingListSchema),
  Item: mongoose.model('Item', itemSchema)
};