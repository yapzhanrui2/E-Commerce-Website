# E-Commerce Website

A full-featured e-commerce platform built with Node.js, Express, and PostgreSQL.

## Features

### User Management
- User registration and authentication
- JWT-based authentication
- Role-based access control (Admin/User)
- User profile management

### Product Management
- Product catalog with search and filtering
- Category-based product organization
- Product CRUD operations (Admin only)
- Image URL support for products

### Shopping Cart
- Add products to cart with specified quantity
- View cart contents with product details
- Update item quantities
- Remove items from cart
- Automatic quantity aggregation for duplicate items
- Per-user cart isolation

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- bcrypt.js for password hashing

### Testing
- Jest for unit and integration testing
- Supertest for API testing
- In-memory PostgreSQL database for testing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/E-Commerce-Website.git
cd E-Commerce-Website
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```env
PORT=5005
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_NAME_TEST=your_test_db_name
JWT_SECRET=your_jwt_secret
```

4. Initialize the database:
```bash
npm run start
```

### Running Tests
```bash
npm test
```

For test coverage:
```bash
npm run test:coverage
```

## API Documentation

See [API-documentation.md](API-documentation.md) for detailed API endpoints and usage.

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── models/         # Database models
├── routes/         # API routes
├── tests/          # Test files
└── index.js        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Express.js team
- Sequelize team
- Jest team