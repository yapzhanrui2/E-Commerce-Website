# The Coffee Bean Project

A full-stack coffee e-commerce platform built with Next.js, Express, PostgreSQL, and Stripe. Users can browse products, manage a cart, checkout via Stripe, leave reviews, and view order history. Admins can manage users, products, and orders through the REST API.

**Live deployment:** Both the frontend and backend are hosted on [Vercel](https://vercel.com).

| Vercel project | Directory | Role |
|---|---|---|
| `coffeebeanfrontend` | `frontend/coffee-bean/` | Next.js storefront |
| `coffeebeanproject` | `backend/` | Express REST API (serverless) |

## Features

### Frontend

- Responsive, mobile-first UI with Tailwind CSS and dark mode
- Product catalog with category tags and product detail pages
- JWT authentication (login/register modal)
- Server-side cart with live count and cart preview dropdown
- Stripe Checkout redirect flow
- Order history and post-payment success page
- Product reviews and ratings
- Toast notifications (react-hot-toast)

### Backend

- JWT authentication with role-based access control (`user` / `admin`)
- Product CRUD with category filtering and search
- Persistent shopping cart per user
- Stripe Checkout sessions and webhook handling
- Order lifecycle management (`pending` → `processing` → `completed` / `cancelled`)
- Product reviews (one review per user per product)
- Admin endpoints for users, products, and orders

> **Note:** Admin API endpoints exist, and the header links to `/admin` for admin users, but an admin dashboard page has not been built yet.

## Technology Stack

### Frontend (`frontend/coffee-bean/`)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 3 |
| State | React Context (`CartContext`, `ThemeContext`) |
| Notifications | react-hot-toast |
| Images | Next.js Image + AWS S3 |

### Backend (`backend/`)

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Database | PostgreSQL (Amazon RDS) |
| Authentication | JWT + bcryptjs |
| Payments | Stripe |
| Testing | Jest + Supertest |

### Infrastructure

| Service | Purpose |
|---|---|
| **Vercel** | Hosts frontend and backend |
| **Amazon RDS** | PostgreSQL database (SSL required) |
| **AWS S3** | Product images (`coffee-bean-images`, `ap-southeast-2`) |
| **Stripe** | Checkout sessions and payment webhooks |

## Architecture

```
Browser
  │
  ├─► coffeebeanfrontend (Vercel)     Next.js on :3000 locally
  │       │
  │       └─► NEXT_PUBLIC_API_URL ──► coffeebeanproject (Vercel)
  │                                       Express /api/*
  │                                           │
  │                                           ├─► Amazon RDS (PostgreSQL)
  │                                           └─► Stripe (Checkout + Webhooks)
  │
  └─► NEXT_PUBLIC_S3_BASE_URL ──► AWS S3 (product images)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ (local dev) or an Amazon RDS instance (production)
- [Stripe](https://stripe.com) account
- [AWS S3](https://aws.amazon.com/s3/) bucket for product images
- [Vercel](https://vercel.com) account (for deployment)

## Environment Variables

Environment variables are configured in Vercel for both projects. For local development, create the files below.

### Frontend — `frontend/coffee-bean/.env.local`

These match the **`coffeebeanfrontend`** Vercel project:

```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_S3_BASE_URL=https://coffee-bean-images.s3.ap-southeast-2.amazonaws.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

| Variable | Used in code | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for all API requests |
| `NEXT_PUBLIC_S3_BASE_URL` | Yes | S3 bucket base URL for product images |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (reserved) | Configured on Vercel; checkout is handled server-side via Stripe Checkout redirect |

### Backend — `backend/.env`

These match the **`coffeebeanproject`** Vercel project:

```env
# Server
PORT=5005
NODE_ENV=development

# Database (Amazon RDS in production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
TEST_DB_NAME=your_test_database_name

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Frontend (Stripe success/cancel redirect URLs)
FRONTEND_URL=http://localhost:3000
```

| Variable | Used in code | Description |
|---|---|---|
| `DB_HOST` | Yes | PostgreSQL host (RDS endpoint in production) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `TEST_DB_NAME` | Yes | Separate database for Jest tests |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signature verification |
| `FRONTEND_URL` | Yes | Base URL for Stripe success/cancel redirects |
| `PORT` | Yes (local only) | Dev server port (default `5005`) |
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `DB_PORT` | No (reserved) | Configured on Vercel; Sequelize uses default port 5432 |
| `JWT_EXPIRES_IN` | No (reserved) | Configured on Vercel; code currently hardcodes `24h` |
| `STRIPE_PUBLISHABLE_KEY` | No (reserved) | Configured on Vercel; not referenced in backend code |

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:yapzhanrui2/E-Commerce-Website.git
   cd E-Commerce-Website
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   # Create backend/.env using the template in Environment Variables above
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend/coffee-bean
   npm install
   # Create frontend/coffee-bean/.env.local using the template above
   ```

4. Set up the database:

   ```bash
   createdb your_database_name
   createdb your_test_database_name
   ```

   On first startup the backend runs `sequelize.sync()` to create tables from models (there are no migration files).

5. (Optional) Seed sample products:

   ```bash
   cd backend
   node seedProducts.js
   ```

6. Start the development servers:

   ```bash
   # Terminal 1 — Backend (http://localhost:5005)
   cd backend
   npm run dev

   # Terminal 2 — Frontend (http://localhost:3000)
   cd frontend/coffee-bean
   npm run dev
   ```

## Project Structure

```
E-Commerce-Website/
├── backend/                    # Express API (Vercel project: coffeebeanproject)
│   ├── config/database.js      # Sequelize + RDS SSL config
│   ├── controllers/            # Route handlers
│   ├── middlewares/            # JWT auth + role checks
│   ├── models/                 # Sequelize models
│   ├── routes/                 # Express routers
│   ├── tests/                  # Jest + Supertest tests
│   ├── seedProducts.js         # Sample coffee product seeder
│   ├── vercel.json             # Vercel serverless config
│   └── index.js                # App entry point
│
├── frontend/
│   └── coffee-bean/            # Next.js app (Vercel project: coffeebeanfrontend)
│       ├── public/             # Static assets (hero image, etc.)
│       ├── src/
│       │   ├── app/            # Pages (App Router)
│       │   ├── components/     # Header, Auth, ReviewForm
│       │   └── context/        # CartContext, ThemeContext
│       └── next.config.ts
│
├── certificates/               # RDS SSL certificates
└── API-documentation.md      # Full REST API reference
```

## Pages & Routes

| Frontend route | Description |
|---|---|
| `/` | Home — hero, features, product grid |
| `/product/[id]` | Product detail + reviews |
| `/cart` | Cart management + Stripe checkout |
| `/orders` | Order history |
| `/order/success` | Post-payment confirmation |

All API endpoints are documented in [`API-documentation.md`](./API-documentation.md).

## Testing

Backend tests cover auth, products, cart, reviews, and orders:

```bash
cd backend
npm test
```

Tests require `TEST_DB_NAME` (and the other `DB_*` vars) pointing at a separate PostgreSQL database.

## Deployment

Both apps deploy automatically on `git push` via Vercel, connected to this GitHub repository.

### Frontend (`coffeebeanfrontend`)

- **Root directory:** `frontend/coffee-bean`
- **Build command:** `next build` (default)
- **Environment variables:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_S3_BASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Backend (`coffeebeanproject`)

- **Root directory:** `backend`
- **Runtime:** Vercel serverless via `@vercel/node` (see `backend/vercel.json`)
- **Environment variables:** all `DB_*`, `JWT_*`, `STRIPE_*`, and `FRONTEND_URL` vars listed above

The Express app exports itself for Vercel and only calls `app.listen()` in non-production environments:

```js
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, ...);
}
module.exports = app;
```

### Stripe webhook

Point your Stripe webhook endpoint to:

```
https://<coffeebeanproject-vercel-url>/api/orders/webhook
```

Subscribe to the `checkout.session.completed` event.

### Product images

Images are stored in S3 and referenced by product name:

```
{NEXT_PUBLIC_S3_BASE_URL}/products/{Product Name}.webp
```

The bucket `coffee-bean-images.s3.ap-southeast-2.amazonaws.com` is allowlisted in `next.config.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
