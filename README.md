# 🛒 Shopping List App

Complete backend with MongoDB, JWT auth, and role-based access.

## 🚀 Quick Start

1. **Install & Run**
```bash
npm install bcrypt
npm install mongoose
npm install passport passport-google-oauth2 express-session
npm install
npm start

env 
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shoppinglist-app
JWT_SECRET=your-secret-key

API Endpoints
Auth
POST /users/register - Create account

POST /users/login - Login

GET /auth/google - Google OAuth

Lists
POST /shoppinglist-main/:awid/create - Create list

GET /shoppinglist-main/:awid/list - Get lists

GET /shoppinglist-main/:awid/get - Get list + items

POST /shoppinglist-main/:awid/update - Update list

POST /shoppinglist-main/:awid/delete - Delete list

Items
POST /shoppinglist-main/:awid/item/add - Add item

POST /shoppinglist-main/:awid/item/remove - Remove item

Roles
Authority - Full access

Owner - Manage own lists

Member - View/add to shared lists

Testing
Import test/insomnia/insomnia_collection.json to Insomnia
