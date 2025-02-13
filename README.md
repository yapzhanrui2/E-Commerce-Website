# E-Commerce Coffee Bean Website

A full-stack e-commerce platform built with Next.js, Node.js, Express, and PostgreSQL, featuring user authentication, product management, shopping cart functionality, order processing with Stripe integration, and user reviews.

## Features

### Frontend Features 🎨

- 📱 **Responsive Design**
  - Mobile-first approach
  - Tailwind CSS styling
  - Modern UI/UX principles
  - Smooth animations and transitions

- 🛍️ **Shopping Experience**
  - Dynamic product catalog
  - Category filtering
  - Product search
  - Detailed product pages with reviews
  - Real-time cart updates

- 👤 **User Interface**
  - Intuitive navigation
  - User authentication modal
  - Order history tracking
  - Review submission system
  - Cart preview dropdown

- 💫 **Modern Features**
  - Server-side rendering
  - Image optimization
  - Lazy loading
  - Smooth page transitions
  - Toast notifications

### Backend Features 🔧

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

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **UI Components**: Custom components
- **Image Optimization**: Next.js Image
- **Animations**: CSS transitions & keyframes
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Stripe Account (for payment processing)
- AWS S3 Bucket (for product images)

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_S3_BASE_URL=your_s3_bucket_url
```

### Backend (.env)
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
   cd e-commerce-website
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend/coffee-bean
   npm install
   ```

4. Set up the database:
   ```bash
   # Create database
   createdb your_database_name

   # Run migrations (if using migrations)
   cd ../../backend
   npm run migrate
   ```

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend/coffee-bean
   npm run dev
   ```

## Project Structure

```
e-commerce-website/
├── backend/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── tests/             # Test files
│   ├── .env               # Environment variables
│   └── index.js           # Application entry point
│
├── frontend/
│   └── coffee-bean/
│       ├── public/        # Static files
│       ├── src/
│       │   ├── app/      # Next.js pages
│       │   ├── components/# React components
│       │   ├── context/  # React context
│       │   └── styles/   # CSS styles
│       ├── .env.local    # Environment variables
│       └── next.config.js# Next.js configuration
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend/coffee-bean
npm test
```

## Deployment

### Frontend
The frontend is deployed on Vercel:
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with `git push`

### Backend
The backend can be deployed on various platforms:
- Heroku
- DigitalOcean
- AWS
- Vercel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS team for the utility-first CSS framework
- Express.js team for the backend framework
- Sequelize team for the robust ORM
- Stripe team for the payment processing capabilities