# API Documentation

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Product Endpoints](#product-endpoints)
- [Cart Endpoints](#cart-endpoints)
- [Review Endpoints](#review-endpoints)
- [Order Endpoints](#order-endpoints)
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

### Cart Endpoints

#### Get User's Cart
- **GET** `/api/cart`
- **Description**: Get all items in the authenticated user's cart
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Cart retrieved successfully",
    "cartItems": [
        {
            "id": "uuid",
            "quantity": "number",
            "Product": {
                "name": "string",
                "price": "number",
                "image": "string (URL)"
            },
            "createdAt": "datetime",
            "updatedAt": "datetime"
        }
    ]
}
```

#### Add Item to Cart
- **POST** `/api/cart/items`
- **Description**: Add a product to the user's cart (or increment quantity if it already exists)
- **Authentication**: Required
- **Request Body**:
```json
{
    "productId": "uuid",
    "quantity": "number (optional, defaults to 1)"
}
```
- **Response** (201):
```json
{
    "message": "Item added to cart successfully",
    "cartItem": {
        "id": "uuid",
        "quantity": "number",
        "Product": {
            "name": "string",
            "price": "number",
            "image": "string (URL)"
        },
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
}
```

#### Update Cart Item Quantity
- **PUT** `/api/cart/items/:itemId`
- **Description**: Update the quantity of a specific item in the cart
- **Authentication**: Required
- **Request Body**:
```json
{
    "quantity": "number (must be positive)"
}
```
- **Response** (200):
```json
{
    "message": "Cart item updated successfully",
    "cartItem": {
        "id": "uuid",
        "quantity": "number",
        "Product": {
            "name": "string",
            "price": "number",
            "image": "string (URL)"
        },
        "createdAt": "datetime",
        "updatedAt": "datetime"
    }
}
```

#### Remove Item from Cart
- **DELETE** `/api/cart/items/:itemId`
- **Description**: Remove an item from the cart
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Item removed from cart successfully"
}
```

### Additional Cart Error Responses

In addition to the standard error responses, cart endpoints may return:

- **404 Not Found**:
```json
{
    "message": "Cart item not found"
}
```

- **400 Bad Request**:
```json
{
    "message": "Quantity must be a positive integer"
}
```

### Review Endpoints

#### Create Review
- **POST** `/api/reviews`
- **Description**: Create a new review for a product
- **Authentication**: Required
- **Request Body**:
```json
{
    "productId": "uuid",
    "rating": "number (1-5)",
    "comment": "string (optional)"
}
```
- **Response** (201):
```json
{
    "message": "Review created successfully",
    "review": {
        "id": "uuid",
        "productId": "uuid",
        "userId": "uuid",
        "rating": "number",
        "comment": "string",
        "createdAt": "datetime"
    }
}
```

#### Get Product Reviews
- **GET** `/api/reviews/:productId`
- **Description**: Get all reviews for a specific product
- **Authentication**: Not required
- **Response** (200):
```json
{
    "message": "Reviews retrieved successfully",
    "averageRating": "number",
    "totalReviews": "number",
    "reviews": [
        {
            "id": "uuid",
            "rating": "number",
            "comment": "string",
            "createdAt": "datetime",
            "User": {
                "id": "uuid",
                "username": "string"
            }
        }
    ]
}
```

### Additional Review Error Responses

Reviews endpoints may return these specific errors:

- **400 Bad Request** (Invalid Rating):
```json
{
    "message": "Validation error",
    "errors": {
        "rating": "Rating must be an integer between 1 and 5"
    }
}
```

- **400 Bad Request** (Duplicate Review):
```json
{
    "message": "You have already reviewed this product"
}
```

### Order Endpoints

#### Create Checkout Session
- **POST** `/api/orders/checkout`
- **Description**: Create a Stripe checkout session for the items in the user's cart
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Checkout session created",
    "sessionId": "string",
    "sessionUrl": "string"
}
```

#### Get User's Orders
- **GET** `/api/orders/my-orders`
- **Description**: Get all orders for the authenticated user
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Orders retrieved successfully",
    "orders": [
        {
            "id": "uuid",
            "userId": "uuid",
            "status": "string (pending|processing|completed|cancelled)",
            "totalAmount": "number",
            "paymentStatus": "string (pending|paid|failed)",
            "shippingAddress": {
                "name": "string",
                "address": "object"
            },
            "createdAt": "datetime",
            "updatedAt": "datetime",
            "OrderItems": [
                {
                    "id": "uuid",
                    "quantity": "number",
                    "priceAtTime": "number",
                    "Product": {
                        "name": "string",
                        "image": "string (URL)"
                    }
                }
            ]
        }
    ]
}
```

#### Get Single Order Details
- **GET** `/api/orders/my-orders/:orderId`
- **Description**: Get detailed information about a specific order
- **Authentication**: Required
- **Response** (200):
```json
{
    "message": "Order retrieved successfully",
    "order": {
        "id": "uuid",
        "userId": "uuid",
        "status": "string (pending|processing|completed|cancelled)",
        "totalAmount": "number",
        "paymentStatus": "string (pending|paid|failed)",
        "shippingAddress": {
            "name": "string",
            "address": "object"
        },
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "OrderItems": [
            {
                "id": "uuid",
                "quantity": "number",
                "priceAtTime": "number",
                "Product": {
                    "name": "string",
                    "image": "string (URL)"
                }
            }
        ]
    }
}
```

#### Get All Orders (Admin Only)
- **GET** `/api/orders/all`
- **Description**: Get all orders in the system
- **Authentication**: Required (Admin only)
- **Response** (200):
```json
{
    "message": "All orders retrieved successfully",
    "orders": [
        {
            "id": "uuid",
            "userId": "uuid",
            "status": "string",
            "totalAmount": "number",
            "paymentStatus": "string",
            "shippingAddress": "object",
            "createdAt": "datetime",
            "updatedAt": "datetime",
            "OrderItems": [
                {
                    "id": "uuid",
                    "quantity": "number",
                    "priceAtTime": "number",
                    "Product": {
                        "name": "string",
                        "image": "string (URL)"
                    }
                }
            ]
        }
    ]
}
```

#### Update Order Status (Admin Only)
- **PUT** `/api/orders/:orderId/status`
- **Description**: Update the status of an order
- **Authentication**: Required (Admin only)
- **Request Body**:
```json
{
    "status": "string (processing|completed|cancelled)"
}
```
- **Response** (200):
```json
{
    "message": "Order status updated successfully",
    "order": {
        "id": "uuid",
        "status": "string",
        "updatedAt": "datetime"
    }
}
```

### Additional Order Error Responses

Order endpoints may return these specific errors:

- **400 Bad Request** (Empty Cart):
```json
{
    "message": "Cart is empty"
}
```

- **400 Bad Request** (Invalid Status):
```json
{
    "message": "Invalid order status"
}
```

- **404 Not Found** (Order Not Found):
```json
{
    "message": "Order not found"
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
