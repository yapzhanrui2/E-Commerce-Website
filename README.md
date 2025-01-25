# E-Commerce API

A modern e-commerce platform built with Node.js, Express, and PostgreSQL, featuring user authentication, product management, and more.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
- [Testing](#testing)

## Features
- JWT-based authentication
- Role-based access control (User/Admin)
- User management
- Secure password hashing
- PostgreSQL database with Sequelize ORM
- Comprehensive test suite

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- Jest (Testing)
- bcrypt.js (Password Hashing)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Environment Setup

1. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=5005
NODE_ENV=development

# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

2. Create a PostgreSQL database with the name specified in your `.env` file

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/e-commerce-website.git
cd e-commerce-website
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```
## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```