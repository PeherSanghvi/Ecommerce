# E-Commerce Order Management & Search System

A full-stack e-commerce application with product browsing, category
filtering, wishlist, cart, checkout, order management, a secure admin
portal, and OpenSearch-powered order search and analytics.

## Tech Stack

### Frontend

-   React
-   Vite
-   JavaScript

### Backend

-   Node.js
-   Express.js
-   Mongoose
-   JWT Authentication
-   bcrypt

### Database

-   MongoDB Atlas

### Search & Analytics

-   OpenSearch 2.13
-   MongoDB Change Stream Worker

------------------------------------------------------------------------

## Main Features

### Customer

-   Product listing and search
-   Department and subcategory filtering
-   Product detail page and image gallery
-   Wishlist and cart
-   Checkout and Cash on Delivery
-   Order placement and history
-   Prices displayed in Rupees (₹)

### Product Departments

-   Fashion: T-Shirts, Shirts, Jeans, Dresses, Tops, Outerwear, Pants /
    Trousers, Knitwear, Accessories
-   Electronics: Smartphones, Laptops, TVs, Headphones, Smartwatches,
    Accessories
-   Home & Garden: Furniture, Kitchen, Home Decor, Lighting, Garden
-   Beauty: Skincare, Makeup, Fragrances, Hair Care, Personal Care

### Admin

-   Secure admin login
-   JWT and role-based authorization
-   Dashboard overview
-   Order management and order details
-   Order status updates
-   OpenSearch-powered order search
-   Status, date and amount filters
-   Revenue analytics and KPIs
-   OpenSearch index rebuild

------------------------------------------------------------------------

## Architecture

``` text
React Frontend
      |
      v
Node.js + Express API
      |
      +-------------------+
      |                   |
      v                   v
MongoDB Atlas         OpenSearch
(Source of Truth)    (Search / Analytics)
      |
      v
Change Stream Worker
      |
      +-------> Sync Orders -------> OpenSearch
```

MongoDB is the source of truth. OpenSearch is used for admin search,
filtering and analytics.

------------------------------------------------------------------------

## Requirements

Install: - Node.js - npm - Docker Desktop - MongoDB Atlas account

------------------------------------------------------------------------

## Environment Variables

Create `backend-node/.env`:

``` env
PORT=8082
MONGODB_URI=your_mongodb_atlas_connection_string
OPENSEARCH_URL=http://localhost:9200
JWT_SECRET=your_secure_jwt_secret
```

Never commit `.env`, passwords, database credentials, JWT secrets, or
API keys.

------------------------------------------------------------------------

# Running the Project

## Step 1 - Start OpenSearch

Open Docker Desktop and wait until the Docker Engine is running.

Verify:

``` powershell
curl http://localhost:9200
```

OpenSearch should respond successfully on port `9200`.

## Step 2 - Start Backend

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\backend-node
npm start
```

Expected output includes:

``` text
✓ Connected to MongoDB
✓ Database: ecommerce
✓ OpenSearch connection successful
✓ OpenSearch index already exists: orders
✓ Server running on port 8082
```

Keep the terminal running.

## Step 3 - Start Worker

Open another terminal:

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\backend-node
npm run worker
```

Keep the worker running. It synchronizes MongoDB order changes to
OpenSearch.

## Step 4 - Start Frontend

Open another terminal:

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\frontend
npm run dev
```

Open the URL displayed by Vite.

------------------------------------------------------------------------

## Normal Startup

You normally need three terminals:

### Terminal 1

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\backend-node
npm start
```

### Terminal 2

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\backend-node
npm run worker
```

### Terminal 3

``` powershell
cd C:\Users\Peher\OneDrive\Desktop\ecom\frontend
npm run dev
```

Docker Desktop should remain running for OpenSearch.

------------------------------------------------------------------------

# API Endpoints

Backend: `http://localhost:8082`

``` text
GET  /health
GET  /api/products
GET  /api/products?page=1&limit=10
GET  /api/products?department=Fashion
GET  /api/products?department=Fashion&subcategory=Jeans

/api/orders
/api/auth
/api/admin
/api/search

POST /api/search/orders
```

------------------------------------------------------------------------

# MongoDB and OpenSearch

## MongoDB

MongoDB is the source of truth and stores: - users - products - orders

Checkout and order operations are committed to MongoDB first.

## OpenSearch

OpenSearch stores a searchable representation of orders and powers: -
Admin omni-search - Customer/order/product text search - Status
filters - Date range filters - Amount filters - Revenue aggregations -
Order-status aggregations

------------------------------------------------------------------------

## Order Synchronization

``` text
Order Created / Updated
          |
          v
       MongoDB
          |
          v
 MongoDB Change Stream
          |
          v
        Worker
          |
          v
  Order Sync Service
          |
          v
      OpenSearch
```

------------------------------------------------------------------------

# Troubleshooting

## Port 8082 Already in Use

If you see:

``` text
EADDRINUSE: address already in use :::8082
```

Check Node processes:

``` powershell
Get-Process node
```

Stop old Node processes if necessary:

``` powershell
Stop-Process -Name node -Force
```

Then restart the backend.

> Warning: this command stops all Node.js processes on the machine.

## MongoDB Atlas Connection Limit

If Atlas reports too many connections:

``` powershell
Get-Process node
Stop-Process -Name node -Force
```

Wait briefly for Atlas to release connections, then start only one
backend and one worker instance.

## MongoDB TLS / SSL Error

For errors such as `MongooseServerSelectionError`,
`tlsv1 alert internal error`, or `ReplicaSetNoPrimary`, check:

1.  Atlas cluster is active.
2.  Current IP is allowed in Atlas Network Access.
3.  Database credentials are correct.
4.  `.env` contains the correct connection string.
5.  Connection limits are not exhausted.
6.  Duplicate backend/worker processes are not running.

## OpenSearch Not Running

Test:

``` powershell
curl http://localhost:9200
```

If it fails: 1. Start Docker Desktop. 2. Wait for Docker Engine. 3.
Start the OpenSearch container. 4. Verify port 9200. 5. Restart
backend/worker if needed.

------------------------------------------------------------------------

# Important Development Rules

Do not run seed or migration scripts every time the project starts.

Normal startup only requires:

``` text
npm start
npm run worker
npm run dev
```

Run seed/migration scripts only when intentionally modifying database
data.

------------------------------------------------------------------------

# Security

The application uses: - JWT authentication - bcrypt password hashing -
Admin role verification - Protected admin routes - Bearer-token
authentication

Protected requests use:

``` http
Authorization: Bearer <JWT_TOKEN>
```

------------------------------------------------------------------------

# Local Services

  Service      Address
  ------------ --------------------------------------
  Backend      `http://localhost:8082`
  Health       `http://localhost:8082/health`
  Products     `http://localhost:8082/api/products`
  Orders       `http://localhost:8082/api/orders`
  Search       `http://localhost:8082/api/search`
  Admin        `http://localhost:8082/api/admin`
  Auth         `http://localhost:8082/api/auth`
  OpenSearch   `http://localhost:9200`

------------------------------------------------------------------------

## Recommended Startup Order

``` text
1. Docker Desktop / OpenSearch
2. Backend  -> npm start
3. Worker   -> npm run worker
4. Frontend -> npm run dev
5. Open the application in the browser
```

------------------------------------------------------------------------

## Project Stack

**React + Vite + Node.js + Express + MongoDB Atlas + OpenSearch**

MongoDB handles transactional data while OpenSearch provides the
dedicated search and analytics layer for the admin order-management
workflow.
