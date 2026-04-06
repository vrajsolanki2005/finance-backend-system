# FinCore – Secure Financial Backend System

> A production-ready REST API for managing financial transactions with role-based access control, a real-time analytics dashboard, and a full audit trail — built with Node.js, Express, and MongoDB.

---

## 🔗 Links

| | |
|---|---|
| **Live API** | [https://finance-backend-system-eheg.onrender.com] |(https://finance-backend-system-eheg.onrender.com)
| **Repository** | [github.com/vrajsolanki2005/finance-backend-system](https://github.com/vrajsolanki2005/finance-backend-system) |

---

## Overview

FinCore is a secure backend system designed around real-world fintech requirements. It handles user authentication with short-lived access tokens and long-lived refresh tokens, enforces role-based permissions across every route, and maintains a tamper-evident audit log of every action taken in the system — including before/after snapshots on updates and full snapshots on deletes.

Key design decisions:
- Tokens are stored in **HTTP-only cookies** — never exposed in the response body
- Every write operation is **non-destructive** — transactions are soft-deleted, not removed
- Every action across auth, transactions, and the dashboard is **automatically logged** with IP and user agent
- Business logic lives in **services**, keeping controllers thin and testable

---

## Tech Stack

- Node.js
- Express.js v5
- MongoDB (Mongoose)
- JWT Authentication (Access + Refresh Token via HTTP-only cookies)
- bcryptjs
- express-validator
- express-rate-limit
- cors, cookie-parser, dotenv

---

## Features

- JWT authentication with short-lived access token (15 min) and long-lived refresh token (30 days) in HTTP-only cookies
- Role-based access control — ADMIN, ANALYST, VIEWER with per-route enforcement
- Full transaction lifecycle — create, read, update, soft delete with auto-incrementing `transactionId`
- Advanced filtering by `type`, `category` with pagination on all list endpoints
- Dashboard analytics — net balance, income/expense totals, category breakdown, recent transactions, monthly trends
- Audit logging — every auth, transaction, and dashboard action recorded with IP, user agent, and structured details
- Before/after snapshots on UPDATE, full snapshot on DELETE
- Rate limiting on auth routes (20 req / 15 min)
- Centralized error handling with consistent JSON error responses
- Input validation with descriptive error messages via express-validator
- Interactive API docs via Swagger UI

---

## Architecture

```
Route → Controller → Service → Model
```

```
src/
├── config/         # DB connection, Swagger config
├── controllers/    # Request handlers (thin — delegate to services)
├── middlewares/    # auth, rbac, validate, error
├── models/         # Mongoose schemas (User, Transaction, Audit)
├── routes/         # Express routers with Swagger JSDoc
├── services/       # Business logic (auth, transaction, dashboard, audit)
├── utils/          # jwt helpers, bcrypt wrappers, response formatter
├── validators/     # express-validator rule sets
├── app.js          # Express app setup, middleware, route registration
└── server.js       # DB connect + server start
test/
├── auth.test.js
├── transaction.test.js
├── dashboard.test.js
└── audit.test.js
```

---

## Role System

| Role    | Permissions                                          |
|---------|------------------------------------------------------|
| ADMIN   | Full access — CRUD, Dashboard, Audit Logs            |
| ANALYST | Read transactions + Dashboard (no write, no audit)   |
| VIEWER  | Read own transactions only (no dashboard, no audit)  |

---

## API Documentation

### Base URL

```
http://localhost:5000
```

> Interactive Swagger docs: [`http://localhost:5000/api-docs`]
---

### Authentication

| Method | Endpoint           | Description                       | Auth Required |
|--------|--------------------|-----------------------------------|---------------|
| POST   | /api/auth/register | Register a new user account       | No            |
| POST   | /api/auth/login    | Authenticate & set token cookies  | No            |
| POST   | /api/auth/logout   | Clear session cookies             | Yes           |

---

### Transactions

| Method | Endpoint              | Description                | Roles Allowed  |
|--------|-----------------------|----------------------------|----------------|
| GET    | /api/transactions     | Fetch all transactions     | ADMIN, ANALYST |
| GET    | /api/transactions/:id | Fetch a single transaction | ADMIN, ANALYST |
| POST   | /api/transactions     | Create a new transaction   | ADMIN          |
| PATCH  | /api/transactions/:id | Update a transaction       | ADMIN          |
| DELETE | /api/transactions/:id | Soft delete a transaction  | ADMIN          |

#### Query Parameters — `GET /api/transactions`

| Param      | Type    | Description                             |
|------------|---------|-----------------------------------------|
| `type`     | string  | Filter by `income` or `expense`         |
| `category` | string  | Filter by category name                 |
| `page`     | integer | Page number (default: `1`)              |
| `limit`    | integer | Results per page (default: `10`, max: `100`) |

---

### Audit Logs

| Method | Endpoint                    | Description                          | Roles Allowed |
|--------|-----------------------------|--------------------------------------|---------------|
| GET    | /api/audit                  | Fetch all audit logs (filterable)    | ADMIN         |
| GET    | /api/audit/transactions/:id | Full audit history for a transaction | ADMIN         |

#### Query Parameters — `GET /api/audit`

| Param      | Type    | Description                                              |
|------------|---------|----------------------------------------------------------|
| `userId`   | string  | Filter by user ObjectId                                  |
| `action`   | string  | Filter by action (e.g. `LOGIN`, `CREATE_TRANSACTION`)    |
| `resource` | string  | Filter by resource (`auth`, `transaction`, `dashboard`)  |
| `page`     | integer | Page number (default: `1`)                               |
| `limit`    | integer | Results per page (default: `20`)                         |

#### Audit Actions Reference

| Action                   | Resource    | Details logged                                   |
|--------------------------|-------------|--------------------------------------------------|
| `REGISTER`               | auth        | email, role                                      |
| `LOGIN`                  | auth        | email, role                                      |
| `LOGOUT`                 | auth        | —                                                |
| `CREATE_TRANSACTION`     | transaction | transactionId, amount, type, category, date      |
| `UPDATE_TRANSACTION`     | transaction | transactionId, before snapshot, after snapshot   |
| `DELETE_TRANSACTION`     | transaction | transactionId, full snapshot at time of deletion |
| `GET_ALL_TRANSACTIONS`   | transaction | filters applied                                  |
| `GET_TRANSACTION`        | transaction | transactionId                                    |
| `VIEW_DASHBOARD_SUMMARY` | dashboard   | —                                                |
| `VIEW_DASHBOARD_TRENDS`  | dashboard   | —                                                |

---

### Dashboard & Analytics

| Method | Endpoint               | Description                       | Roles Allowed  |
|--------|------------------------|-----------------------------------|----------------|
| GET    | /api/dashboard/summary | Net balance, income & expense     | ADMIN, ANALYST |
| GET    | /api/dashboard/trends  | Monthly time-series data          | ADMIN, ANALYST |

---

## Request Examples

### Register

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

> Tokens are set as HTTP-only cookies — `accessToken` (15 min) and `refreshToken` (30 days). Nothing is returned in the response body.

### Create Transaction

```json
POST /api/transactions
Authorization: Bearer <access_token>

{
  "amount": 45.00,
  "type": "expense",
  "category": "Food",
  "date": "2026-04-05"
}
```

### Update Transaction

```json
PATCH /api/transactions/1
Authorization: Bearer <access_token>

{
  "amount": 60.00,
  "category": "Groceries"
}
```

### Delete Transaction

```
DELETE /api/transactions/1
Authorization: Bearer <access_token>
```

### Fetch All Audit Logs (with filters)

```
GET /api/audit?action=CREATE_TRANSACTION&resource=transaction&page=1&limit=20
Authorization: Bearer <access_token>
```

### Fetch Transaction Audit History

```
GET /api/audit/transactions/1
Authorization: Bearer <access_token>
```

---

## Setup Instructions

```bash
git clone https://github.com/vrajsolanki2005/finance-backend-system.git
cd finance-backend-system
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
ALLOWED_ORIGIN=http://localhost:3000
```

```bash
npm run dev      # start with nodemon (development)
npm start        # start without nodemon (production)
npm test         # run all Jest test suites
```

---

## Testing

All test suites are in the `test/` directory and use **Jest** + **Supertest** against a real MongoDB connection.

```
test/
├── auth.test.js          # register, login, logout
├── transaction.test.js   # CRUD, filters, pagination, role guards
├── dashboard.test.js     # summary shape, trends, role guards
└── audit.test.js         # audit log queries, transaction history, snapshots
```

Run a single suite:

```bash
npx jest test/audit.test.js
```

---

## Assumptions

- Soft delete is used instead of permanent deletion — transactions have an `isDeleted` flag
- Only ADMIN can create, update, or delete transactions
- ANALYST can read all transactions and access dashboard analytics
- VIEWER has read-only access to their own transactions only
- VIEWER cannot access `GET /api/transactions` — only ADMIN and ANALYST can
- JWT access token is sent via `Authorization: Bearer` header
- Refresh token is stored in an HTTP-only cookie and never returned in the response body
- CORS is restricted to `ALLOWED_ORIGIN` (default: `http://localhost:3000`)
- All actions across auth, transactions, and dashboard are automatically recorded in the audit log
- UPDATE audit entries store a `before` and `after` snapshot of the full transaction
- DELETE audit entries store a full `snapshot` of the transaction at the time of deletion
- Only ADMIN can query audit logs


---
Developed by Vraj Solanki for Zorvyn Assessment 