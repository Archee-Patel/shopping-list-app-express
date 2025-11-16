# Shopping List Application

Complete backend implementation with full authentication, authorization, and validation.

## Features

- **User Management**: Registration and login with credential validation
- **Authentication**: JWT tokens with 1-hour expiration
- **Authorization**: 3 user profiles (Authority, Owner, Member)
- **Validation**: Comprehensive input validation
- **Error Handling**: uuAppErrorMap format
- **11 Protected Endpoints**: Full CRUD operations

## Default Users

- `admin / admin123` (Authority - full access)
- `owner / owner123` (Owner - can create/manage lists)  
- `member / member123` (Member - can view/add items)

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User login (credential validation)
- All shopping list endpoints under `/shoppinglist-main/{awid}/`
