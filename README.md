# E-Commerce Website Backend

A robust e-commerce backend built with Node.js, Express, and PostgreSQL, featuring user authentication, product management, shopping cart functionality, order processing with Stripe integration, and user reviews.

## Features

- 🔐 **User Authentication**
  - JWT-based authentication
  - User registration and login
  - Role-based access control (Admin/User)

- 📦 **Product Management**
  - Product CRUD operations
  - Category-based filtering
  - Search functionality
  - Image URL support

- 🛒 **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Persistent cart storage
  - Multi-item support

- 💳 **Order Processing**
  - Stripe checkout integration
  - Order history
  - Order status management
  - Shipping address handling

- ⭐ **Reviews & Ratings**
  - Product reviews
  - Rating system
  - User-specific review restrictions

- 👑 **Admin Features**
  - User management
  - Order management
  - Product management
  - Role management

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Stripe Account (for payment processing)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server
PORT=5005
NODE_ENV=development

# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend URL (for Stripe success/cancel URLs)
FRONTEND_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd e-commerce-website/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Create database
   createdb your_database_name

   # Run migrations (if using migrations)
   npm run migrate
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

See [API-documentation.md](API-documentation.md) for detailed API endpoints and usage.

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middlewares/        # Custom middlewares
├── models/            # Database models
├── routes/            # API routes
├── tests/             # Test files
├── .env               # Environment variables
└── index.js           # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Express.js team for the amazing framework
- Sequelize team for the robust ORM
- Stripe team for the payment processing capabilities