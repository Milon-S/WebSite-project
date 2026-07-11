# AURA — Premium E-Commerce Monorepo

A professional e-commerce clothing and electronics branding showcase application built with a modular architecture.

## Tech Stack
- **Frontend**: React (Vite), Vanilla CSS (Responsive & Modern)
- **Backend**: Node.js, Express.js (MVC Pattern)
- **Database**: MongoDB (Mongoose schemas)

---

## Directory Structure
```text
client/                          # React Frontend (Vite)
├── public/                      # Static assets served at root
│   └── assets/                  # Product images and banner
├── css/
│   └── style.css                # Premium vanilla CSS styling
├── src/
│   ├── js/                      # Frontend JS Services
│   │   ├── api.js               # Central api fetch client
│   │   ├── cart.js              # Client-side cart logic
│   │   └── app.js               # State orchestration & custom hooks
│   ├── components/              # Modular UI components
│   ├── App.jsx                  # Root React component
│   └── main.jsx                 # Client entry point
│
server/                          # Backend API Server
├── config/
│   └── db.js                    # MongoDB connection configuration
├── models/
│   ├── Product.js               # Product mongoose schema
│   ├── Order.js                 # Order mongoose schema
│   └── PromoCode.js             # PromoCode mongoose schema
├── controllers/
│   ├── productController.js     # Products CRUD business logic
│   ├── orderController.js       # Order creation business logic
│   └── promoController.js       # Coupon code validation logic
├── routes/
│   ├── productRoutes.js         # /api/products router mapping
│   ├── orderRoutes.js           # /api/orders router mapping
│   └── promoRoutes.js           # /api/promo router mapping
├── middleware/
│   └── errorHandler.js          # Central global error handler
├── seed/
│   └── seedProducts.js          # DB seeder for default catalogue
├── server.js                    # Server startup script
```

---

## How to Get Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas cloud URI.

### 2. Install Dependencies

#### Backend Server
```bash
cd server
npm install
```

#### Frontend Client
```bash
cd client
npm install
```

### 3. Database Seeding (Required once)
Before launching the server, seed your MongoDB database with the default product catalog and coupon codes:
```bash
cd server
npm run seed
```

### 4. Running the Project

#### Start the Backend API Server (Port 5000)
```bash
cd server
npm run dev
```

#### Start the Frontend React App (Port 5173 with proxy to 5000)
```bash
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser to view and test the application!
