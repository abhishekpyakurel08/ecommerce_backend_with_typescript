# E-Commerce Backend API Documentation

A TypeScript-based REST API for an e-commerce platform built with Express.js and MongoDB.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Products](#products)
  - [Orders](#orders)
  - [Payments & Coupons](#payments--coupons)
  - [Dashboard Stats](#dashboard-stats)
- [Models](#models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

## Overview

This backend provides a complete e-commerce API with:
- User authentication with JWT
- Product management with image uploads
- Order processing
- Payment integration (Stripe)
- Coupon/discount system
- Admin dashboard statistics
- Caching with Node-Cache
- Rate limiting and security headers

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Multer** | File uploads |
| **Stripe** | Payment processing |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **Node-Cache** | In-memory caching |
| **Morgan** | HTTP request logging |

## Project Structure

```
src/
├── app.ts                    # Application entry point
├── config/
│   └── index.ts             # Configuration & environment variables
├── controllers/             # Route handlers
│   ├── user.controllers.ts
│   ├── product.controllers.ts
│   ├── order.controllers.ts
│   ├── coupon.controllers.ts
│   └── stats.controllers.ts
├── DB/
│   └── config.ts            # Database cache invalidation
├── middleware/
│   ├── auth.middleware.ts   # JWT authentication & admin check
│   ├── error.middleware.ts  # Global error handler
│   ├── multer.middleware.ts # File upload configuration
│   ├── security.middleware.ts # Helmet, CORS, Rate limiting
│   └── validation.middleware.ts # Request validation
├── model/
│   ├── user.models.ts       # User schema
│   ├── product.models.ts    # Product schema
│   ├── order.models.ts      # Order schema
│   └── coupon.models.ts     # Coupon schema
├── routes/
│   ├── user.route.ts
│   ├── product.route.ts
│   ├── order.route.ts
│   ├── coupon.route.ts
│   └── stats.route.ts
├── services/
│   ├── cache.service.ts     # Node-Cache wrapper
│   └── db.service.ts        # Database connection
├── types/
│   └── types.ts             # TypeScript interfaces & types
└── utils/
    ├── lifecycle.ts         # Graceful shutdown
    ├── logger.ts            # Winston logger
    └── utility-class.ts     # ErrorHandler class
```

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=8000
DB_CONNECTION=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
STRIPE_KEY=sk_test_your_stripe_key
PRODUCT_PER_PAGE=8
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Health Check
```
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

### Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Users

#### Register User
```
POST /user/register
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| password | string | Yes | Min 6 characters |
| _id | string | Yes | Unique user ID |
| dob | string | Yes | Date of birth (YYYY-MM-DD) |
| gender | string | Yes | male, female, or other |
| photo | file | Yes | Profile image |

Response:
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

#### Get All Users (Admin Only)
```
GET /user/all
Authorization: Bearer <token>
```

#### Get Single User
```
GET /user/:id
Authorization: Bearer <token>
```

#### Delete User (Admin Only)
```
DELETE /user/:id
Authorization: Bearer <token>
```

---

### Products

#### Create Product (Admin Only)
```
POST /product/new
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| price | number | Yes | Product price |
| stock | number | Yes | Available quantity |
| category | string | Yes | Product category |
| photo | file | Yes | Product image |

#### Get Latest Products
```
GET /product/latest
```

Response:
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Product Name",
      "price": 99.99,
      "stock": 10,
      "category": "electronics",
      "photo": "uploads/photo.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get All Products (with filters)
```
GET /product/all?page=1&limit=8&search=laptop&category=electronics&price=1000&sort=asc
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 8) |
| search | string | Search by product name |
| category | string | Filter by category |
| price | number | Max price filter |
| sort | string | asc or desc (by price) |

Response:
```json
{
  "success": true,
  "products": [...],
  "totalPage": 5
}
```

#### Get Product Categories
```
GET /product/category
```

Response:
```json
{
  "success": true,
  "categories": ["electronics", "fashion", "home"]
}
```

#### Get Single Product
```
GET /product/:id
```

#### Update Product (Admin Only)
```
PUT /product/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### Delete Product (Admin Only)
```
DELETE /product/:id
Authorization: Bearer <token>
```

#### Get Admin Products (Admin Only)
```
GET /product/admin-products
Authorization: Bearer <token>
```

---

### Orders

#### Create Order
```
POST /order/new
Content-Type: application/json
```

Request Body:
```json
{
  "shippingInfo": {
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "state": "NY",
    "pinCode": 10001
  },
  "user": "user_id",
  "subtotal": 100,
  "tax": 10,
  "shippingCharges": 5,
  "discount": 0,
  "total": 115,
  "orderItems": [
    {
      "name": "Product Name",
      "photo": "uploads/photo.jpg",
      "price": 50,
      "quantity": 2,
      "productId": "product_id"
    }
  ]
}
```

#### Get My Orders
```
GET /order/my
```

#### Get All Orders (Admin Only)
```
GET /order/all
Authorization: Bearer <token>
```

#### Get Single Order
```
GET /order/:id
```

#### Update Order Status (Admin Only)
```
PUT /order/:id
Authorization: Bearer <token>
```

Request Body:
```json
{
  "status": "Shipped"
}
```

Status options: `Processing`, `Shipped`, `Delivered`, `cancelled`

#### Delete Order (Admin Only)
```
DELETE /order/:id
Authorization: Bearer <token>
```

---

### Payments & Coupons

#### Create Payment Intent (Stripe)
```
POST /payments/create
Content-Type: application/json
```

Request Body:
```json
{
  "amount": 1000
}
```

#### Apply Discount
```
POST /payments/discount
Content-Type: application/json
```

Request Body:
```json
{
  "coupon": "SAVE20",
  "amount": 100
}
```

#### Create Coupon (Admin Only)
```
POST /payments/coupon/new
Authorization: Bearer <token>
```

Request Body:
```json
{
  "code": "SAVE20",
  "amount": 20
}
```

#### Get All Coupons (Admin Only)
```
GET /payments/all/coupon
Authorization: Bearer <token>
```

#### Delete Coupon (Admin Only)
```
DELETE /payments/coupon/:id
Authorization: Bearer <token>
```

---

### Dashboard Stats

All stats endpoints require authentication.

#### Get Dashboard Stats
```
GET /dashboard/stats
Authorization: Bearer <token>
```

Returns:
- Total revenue
- Total orders
- Total products
- Total users
- Recent orders
- Charts data

#### Get Pie Charts
```
GET /dashboard/pie
Authorization: Bearer <token>
```

#### Get Bar Charts
```
GET /dashboard/bar
Authorization: Bearer <token>
```

#### Get Line Charts
```
GET /dashboard/line
Authorization: Bearer <token>
```

---

## Models

### User Model
```typescript
{
  _id: string;           // Unique identifier
  name: string;          // Full name
  email: string;         // Unique email
  photo: string;         // Profile image path
  password: string;      // Hashed password
  role: "admin" | "user"; // Default: "user"
  gender: "male" | "female" | "other";
  dob: Date;            // Date of birth
  age: number;          // Virtual (calculated)
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model
```typescript
{
  _id: string;          // MongoDB ObjectId
  name: string;         // Product name
  photo: string;        // Image path
  price: number;        // Product price
  stock: number;        // Available quantity
  category: string;     // Product category
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model
```typescript
{
  _id: string;
  shippingInfo: {
    address: string;
    city: string;
    country: string;
    state: string;
    pinCode: number;
  };
  user: string;         // User ID reference
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "cancelled";
  orderItems: Array<{
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Coupon Model
```typescript
{
  _id: string;
  code: string;         // Unique coupon code
  amount: number;       // Discount amount
}
```

---

## Middleware

### Authentication Middleware

- `authenticate` - Validates JWT token from Authorization header
- `adminOnly` - Checks if user has admin role
- `ADMINONLY` - Query-based admin check (deprecated)

### Error Handling

The API uses a centralized error handling system:

```typescript
// Error response format
{
  "success": false,
  "message": "Error description",
  "status": 500
}
```

Common HTTP Status Codes:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Rate Limiting

- General API: 100 requests per 15 minutes
- Auth routes: 5 attempts per 15 minutes

### CORS

Default CORS origin: `http://localhost:3000`
Configure via `CORS_ORIGIN` environment variable.

---

## File Uploads

Product and user photos are uploaded to the `uploads/` directory using Multer.

Uploaded files are served statically at:
```
GET /uploads/:filename
```

---

## Caching

The API implements caching using Node-Cache:

Cached data:
- Latest products
- Categories
- All products
- Single product (by ID)

Cache is automatically invalidated on:
- Product create/update/delete
- Order creation

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "status": 400
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## Development Notes

1. **Hot Reload**: Use `npm run dev` for development with auto-rebuild
2. **TypeScript**: Run `npm run build` to compile to `dist/` directory
3. **File Uploads**: Ensure `uploads/` directory exists and is writable
4. **MongoDB**: Make sure MongoDB is running before starting the server
5. **Stripe**: Set `STRIPE_KEY` for payment processing to work

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run clean` | Remove dist directory |
| `npm run rebuild` | Clean and rebuild |

---

## License

ISC
