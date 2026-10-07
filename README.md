# 📚 BookStore — E-Commerce Capstone Project

A full-stack e-commerce bookstore built with **React + TypeScript + Vite** (frontend) and **Node.js + Express + PostgreSQL** (backend), developed with AI-assisted guidance using **IBM BOB**.

---

## 🚀 Live Demo

> Start locally following the setup instructions below.

---

## 📋 Features

| Feature | Details |
|---|---|
| **Catalogue** | Browse, filter by category/brand, search, sort (price, rating, newest) |
| **Product Details** | Book info, reviews, ratings, related books, quantity selector |
| **Shopping Cart** | Add/remove/update items, coupon codes, gift points redemption |
| **Authentication** | Register, login, forgot password, JWT-protected routes |
| **Checkout** | Multi-step: address → payment → review → confirmation |
| **Payment (Mock)** | Card, UPI, Net Banking, COD — simulated success/failure states |
| **Order History** | View orders, order details, **Buy Again**, **Cancel within 48 hours** |
| **Gift Points** | Earn on purchases (₹10 = 1 pt), redeem at checkout, full history |
| **Responsive Design** | Desktop, tablet, mobile — all layouts covered |
| **Testing** | Unit, component, integration tests (55 total) |

---

## 🧰 Technology Stack

### Frontend
| Technology | Version |
|---|---|
| React + TypeScript | 19.x |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| React Router | 7.x |
| Zustand | 5.x |
| Axios | 1.x |
| Zod + React Hook Form | 4.x / 7.x |
| Lucide React | 1.x |
| Vitest + Testing Library | 5.x / 16.x |

### Backend
| Technology | Version |
|---|---|
| Node.js + Express | 18+ / 5.x |
| TypeScript | 7.x |
| PostgreSQL | 14+ |
| JWT (jsonwebtoken) | 9.x |
| bcryptjs | 3.x |
| Zod | 4.x |
| Supertest + Vitest | 7.x / 5.x |

---

## 🗂️ Project Structure

```
capstone/
├── bookstore-frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── books/           # BookCard component
│   │   │   ├── layout/          # Navbar, Footer, CartDrawer, Layout, ProtectedRoute
│   │   │   └── ui/              # Button, Input, Badge, Loading, ErrorMessage
│   │   ├── data/                # Mock data (books, categories, brands)
│   │   ├── lib/                 # Utils, apiClient
│   │   ├── pages/               # All page components
│   │   ├── services/            # paymentService (mock)
│   │   ├── store/               # Zustand stores (auth, cart)
│   │   ├── test/                # All test files
│   │   └── types/               # TypeScript interfaces
│   └── vite.config.ts
│
└── bookstore-backend/           # Node.js + Express backend
    ├── src/
    │   ├── config/              # Database connection
    │   ├── middleware/          # Auth, validate, error handler
    │   └── routes/              # auth, books, categories, brands, cart, orders, addresses, payments, giftPoints
    ├── database/
    │   └── schema.sql           # Full PostgreSQL schema + seed
    └── openapi.yaml             # OpenAPI 3.0 specification
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (optional — frontend works fully with mock data)

### Frontend (Quick Start)

```bash
cd bookstore-frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

### Backend Setup

```bash
cd bookstore-backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install

# Set up the database
psql -U postgres -c "CREATE DATABASE bookstore_db;"
psql -U postgres -d bookstore_db -f database/schema.sql

# Start the server
npm run dev
```

API runs at **http://localhost:5000**

### Run Tests

```bash
# Frontend tests (55 tests)
cd bookstore-frontend
npm run test:run

# Backend tests (when DB available)
cd bookstore-backend
npm test
```

---

## 🗺️ User Journey

```
Home → Login/Register → Catalogue → Product Details → Add to Cart
     ↓                                                       ↓
 Gift Points ← Order History ← Confirmation ← Review ← Checkout
```

---

## 🗄️ Database Entities (PostgreSQL)

- `users` — account, gift_points balance
- `addresses` — delivery addresses per user
- `categories` — book categories with slugs
- `publishers` / `brands` — publisher/brand info
- `books` — full product catalogue with stock, rating, tags
- `book_categories` — many-to-many
- `inventory` — stock movement log
- `carts` / `cart_items` — per-user cart
- `orders` / `order_items` — order records
- `order_status_history` — status change audit
- `payments` — payment records (card/UPI/net_banking/COD)
- `reviews` — book reviews
- `gift_points` — gift point transaction log

---

## 📡 REST API Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Books | `GET /books`, `GET /books/:id` |
| Categories | `GET /categories`, `GET /categories/:slug` |
| Brands | `GET /brands` |
| Cart | `GET /cart`, `POST /cart/items`, `PUT /cart/items/:bookId`, `DELETE /cart/items/:bookId`, `DELETE /cart` |
| Orders | `GET /orders`, `GET /orders/:id`, `POST /orders`, `POST /orders/:id/cancel` |
| Addresses | `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id` |
| Payments | `POST /payments/process` |
| Gift Points | `GET /gift-points` |

Full spec: [`bookstore-backend/openapi.yaml`](bookstore-backend/openapi.yaml)

---

## 🧪 Testing Strategy

- **Unit tests** — `canCancelOrder()`, `formatPrice()`, `getDiscountPercent()`, gift points calculation
- **Store tests** — cart CRUD, coupon/gift-point application, totals calculation
- **Component tests** — Button, Badge, RatingStars, ErrorMessage, EmptyState
- **Integration tests** — BookCard rendering, routing, stock handling
- **Service tests** — payment processing mock (success/failure states)

---

## 🤖 IBM BOB Usage

This project was built step-by-step using **IBM BOB** AI assistance:

1. Project architecture planning
2. TypeScript type system design
3. Component scaffolding (Navbar, Cart Drawer, BookCard)
4. State management with Zustand
5. Form validation with Zod + React Hook Form
6. Mock payment service with simulated failure states
7. Order cancellation business rule (`canCancelOrder`)
8. PostgreSQL schema design with constraints and indexes
9. OpenAPI 3.0 spec generation
10. Test suite creation and debugging

---

## 📝 Git Workflow

```bash
git checkout -b feature/bookstore-capstone
git add .
git commit -m "Initial capstone bookstore project"
git push origin feature/bookstore-capstone
# Create PR on GitHub
```

---

## 📄 License

MIT — for educational use as part of IBM BOB Capstone Project.
