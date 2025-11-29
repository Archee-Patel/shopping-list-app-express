const { ShoppingList, Item } = require('../models/ShoppingList');

async function list({ page = 0, pageSize = 10, user }) {
  // Validate pagination parameters
  const currentPage = Math.max(0, parseInt(page));
  const currentPageSize = Math.min(Math.max(1, parseInt(pageSize)), 50); // Max 50 per page
  
  const skip = currentPage * currentPageSize;
  
  // Get lists with pagination - only where user is owner or member
  const lists = await ShoppingList.find({
    $or: [
      { owner: user._id },
      { 'members.user': user._id }
    ]
  })
  .sort({ createdAt: -1 }) // Sort by newest first
  .skip(skip)
  .limit(currentPageSize)
  .populate('owner', 'name email')
  .populate('members.user', 'name email');

  // Get total count for pagination info
  const total = await ShoppingList.countDocuments({
    $or: [
      { owner: user._id },
      { 'members.user': user._id }
    ]
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / currentPageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  return {
    lists,
    pagination: {
      page: currentPage,
      pageSize: currentPageSize,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null
    }
  };
}

async function create({ name, user }) {
  // Create list with owner ID
  const list = await ShoppingList.create({
    name,
    owner: user._id,
    members: [{ user: user._id, role: 'Owner' }]
  });

  // Populate owner info in response
  return await ShoppingList.findById(list._id).populate('owner', 'name email');
}

// ✅ UPDATED: Simplified get function that uses getListItems
async function get({ id, user }) {
  return await getListItems({
    listId: id,
    page: 0, // Default page
    pageSize: 20, // Default page size
    user
  });
}

async function remove({ id, user }) {
  const list = await ShoppingList.findById(id);
  
  if (!list) {
    const e = new Error('List not found');
    e.status = 404;
    e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
    throw e;
  }

  // ✅ Only owner can delete the list
  if (!list.owner.equals(user._id)) {
    const e = new Error('Only the owner can delete this list');
    e.status = 403;
    e.uuAppErrorMap = { 'auth/forbidden': { type: 'error', message: 'Only the owner can delete this list' } };
    throw e;
  }

  // Delete list and its items
  await ShoppingList.findByIdAndDelete(id);
  await Item.deleteMany({ shoppingList: id });

  return { id, deleted: true };
}

async function addItem({ shoppingListId, name, quantity = 1, user }) {
  const list = await ShoppingList.findById(shoppingListId);
  
  if (!list) {
    const e = new Error('List not found');
    e.status = 404;
    e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
    throw e;
  }

  // ✅ Security check - user must be owner or member to add items
  const isOwner = list.owner.equals(user._id);
  const isMember = list.members.some(m => m.user.equals(user._id));
  
  if (!isOwner && !isMember) {
    const e = new Error('Access denied');
    e.status = 403;
    e.uuAppErrorMap = { 'auth/forbidden': { type: 'error', message: 'You do not have access to add items to this list' } };
    throw e;
  }

  const item = await Item.create({
    name,
    quantity,
    shoppingList: shoppingListId,
    createdBy: user._id
  });

  return await Item.findById(item._id).populate('createdBy', 'name email');
}

async function removeItem({ itemId, user }) {
  const item = await Item.findById(itemId).populate('shoppingList');
  
  if (!item) {
    const e = new Error('Item not found');
    e.status = 404;
    e.uuAppErrorMap = { 'item/not-found': { type: 'error', message: 'Item not found' } };
    throw e;
  }

  // ✅ Only item creator or list owner can remove items
  const isCreator = item.createdBy.equals(user._id);
  const isListOwner = item.shoppingList.owner.equals(user._id);
  
  if (!isCreator && !isListOwner) {
    const e = new Error('Access denied');
    e.status = 403;
    e.uuAppErrorMap = { 'auth/forbidden': { type: 'error', message: 'You can only remove your own items or if you are the list owner' } };
    throw e;
  }

  await Item.findByIdAndDelete(itemId);
  return { itemId, removed: true };
}

async function shareList({ listId, targetUserId, role = 'Member', user }) {
  const list = await ShoppingList.findById(listId);
  
  if (!list) {
    const e = new Error('List not found');
    e.status = 404;
    e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
    throw e;
  }

  // Only owner can share the list
  if (!list.owner.equals(user._id)) {
    const e = new Error('Only list owner can share this list');
    e.status = 403;
    e.uuAppErrorMap = { 'auth/owner-required': { type: 'error', message: 'Only list owner can share this list' } };
    throw e;
  }

  // Check if user is already a member
  const existingMember = list.members.find(member => 
    member.user.toString() === targetUserId
  );

  if (existingMember) {
    // Update existing member role
    existingMember.role = role;
  } else {
    // Add new member
    list.members.push({
      user: targetUserId,
      role: role
    });
  }

  await list.save();
  
  return await ShoppingList.findById(listId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');
}

async function getListItems({ listId, page = 0, pageSize = 20, user }) {
  const list = await ShoppingList.findById(listId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  if (!list) {
    const e = new Error('List not found');
    e.status = 404;
    e.uuAppErrorMap = { 'list/not-found': { type: 'error', message: 'List not found' } };
    throw e;
  }

  // Security check - user must be owner or member
  const isOwner = list.owner._id.equals(user._id);
  const isMember = list.members.some(m => m.user._id.equals(user._id));
  
  if (!isOwner && !isMember) {
    const e = new Error('Access denied');
    e.status = 403;
    e.uuAppErrorMap = { 'auth/forbidden': { type: 'error', message: 'You do not have access to this list' } };
    throw e;
  }

  // Pagination for items
  const currentPage = Math.max(0, parseInt(page));
  const currentPageSize = Math.min(Math.max(1, parseInt(pageSize)), 50);
  const skip = currentPage * currentPageSize;

  const items = await Item.find({ shoppingList: listId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(currentPageSize)
    .populate('createdBy', 'name email');

  const totalItems = await Item.countDocuments({ shoppingList: listId });
  const totalPages = Math.ceil(totalItems / currentPageSize);

  return {
    list: {
      ...list.toObject(),
      userRole: isOwner ? 'Owner' : 'Member'
    },
    items,
    itemsPagination: {
      page: currentPage,
      pageSize: currentPageSize,
      total: totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0
    }
  };
}


module.exports = { 
  list, 
  create, 
  get, 
  remove, 
  addItem, 
  removeItem, 
  shareList,
  getListItems 
};