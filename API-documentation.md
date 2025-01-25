# API Documentation

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Product Endpoints](#product-endpoints)
- [Admin Endpoints](#admin-endpoints)

### Authentication Endpoints

#### Register New User
- **POST** `/api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```
- **Response** (201):
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "user"
    },
    "token": "jwt_token"
}
```

#### Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
```json
{
    "email": "string",
    "password": "string"
}
```
- **Response** (200):
```json
{
    "message": "Login successful",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    },
    "token": "jwt_token"
}
```

### User Endpoints

#### Get User Profile
- **GET** `/api/users/profile`
- **Description**: Get authenticated user's profile
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Profile retrieved successfully",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

#### Update User Profile
- **PUT** `/api/users/profile`
- **Description**: Update user profile information
- **Authentication**: Required
- **Request Body**:
```json
{
    "username": "string",
    "email": "string"
}
```
- **Response** (200):
```json
{
    "message": "Profile updated successfully",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

### Product Endpoints

#### Get All Products
- **GET** `/api/products`
- **Description**: Get list of all products with optional filtering
- **Authentication**: Not required
- **Query Parameters**:
  - `category` (optional): Filter products by category
  - `search` (optional): Search products by name
- **Response** (200):
```json
{
    "message": "Products retrieved successfully",
    "products": [
        {
            "id": "uuid",
            "name": "string",
            "description": "string",
            "price": "number",
            "image": "string (URL)",
            "categories": ["string"],
            "createdAt": "datetime",
            "updatedAt": "datetime"
        }
    ]
}
```

#### Get Single Product
- **GET** `/api/products/:id`
- **Description**: Get details of a specific product
- **Authentication**: Not required
- **Response** (200):
```json
{
    "message": "Product retrieved successfully",
    "product": {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "price": "number",
        "image": "string (URL)",
        "categories": ["string"],
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
}
```

#### Create Product (Admin Only)
- **POST** `/api/products`
- **Description**: Create a new product
- **Authentication**: Required (Admin only)
- **Request Body**:
```json
{
    "name": "string (required)",
    "description": "string (optional)",
    "price": "number (required)",
    "image": "string URL (optional)",
    "categories": ["string"] (optional)
}
```
- **Response** (201):
```json
{
    "message": "Product created successfully",
    "product": {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "price": "number",
        "image": "string",
        "categories": ["string"],
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
}
```

#### Update Product (Admin Only)
- **PUT** `/api/products/:id`
- **Description**: Update an existing product
- **Authentication**: Required (Admin only)
- **Request Body**:
```json
{
    "name": "string (optional)",
    "description": "string (optional)",
    "price": "number (optional)",
    "image": "string URL (optional)",
    "categories": ["string"] (optional)
}
```
- **Response** (200):
```json
{
    "message": "Product updated successfully",
    "product": {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "price": "number",
        "image": "string",
        "categories": ["string"],
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
}
```

#### Delete Product (Admin Only)
- **DELETE** `/api/products/:id`
- **Description**: Delete a product
- **Authentication**: Required (Admin only)
- **Response** (200):
```json
{
    "message": "Product deleted successfully"
}
```

### Admin Endpoints

#### Get All Users (Admin Only)
- **GET** `/api/admin/users`
- **Description**: Get list of all users
- **Authentication**: Required (Admin only)
- **Response** (200):
```json
{
    "message": "Users retrieved successfully",
    "users": [
        {
            "id": "uuid",
            "username": "string",
            "email": "string",
            "role": "string"
        }
    ]
}
```

#### Update User Role (Admin Only)
- **PUT** `/api/admin/users/:userId/role`
- **Description**: Update user's role
- **Authentication**: Required (Admin only)
- **Request Body**:
```json
{
    "role": "admin" // or "user"
}
```
- **Response** (200):
```json
{
    "message": "User role updated successfully",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

#### Delete User (Admin Only)
- **DELETE** `/api/admin/users/:userId`
- **Description**: Delete a user
- **Authentication**: Required (Admin only)
- **Response** (200):
```json
{
    "message": "User deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

- **401 Unauthorized**:
```json
{
    "message": "No token provided"
}
```

- **403 Forbidden**:
```json
{
    "message": "You don't have permission to perform this action"
}
```

- **500 Internal Server Error**:
```json
{
    "message": "Error message description",
    "error": "Detailed error information"
}
```

### Common Error Responses

- **400 Bad Request** (Validation Error):
```json
{
    "message": "Validation error",
    "errors": {
        "name": "Name is required",
        "price": "Price must be a positive number"
    }
}
```

- **404 Not Found**:
```json
{
    "message": "Product not found"
}
```
