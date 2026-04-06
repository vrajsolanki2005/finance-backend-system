# FinCore – Secure Financial Backend System

A backend system for managing financial transactions with role-based access control, analytics dashboard, and secure API design.

Inspired by real-world fintech architecture.

---

## Tech Stack

- Node.js
- Express.js v5
- MongoDB (Mongoose)
- JWT Authentication (Access + Refresh Token via cookies)
- bcryptjs
- express-validator
- express-rate-limit
- cors, cookie-parser, dotenv

## Features

- JWT-based Authentication with refresh token stored in HTTP-only cookie
- Role-Based Access Control (ADMIN, ANALYST, VIEWER)
- Transaction Management (Create, Read, Update, Soft Delete)
- Auto-incrementing `transactionId` per transaction
- Advanced Filtering (date, category, type)
- Dashboard Analytics (income, expense, trends)
- Audit Logging (every auth, transaction, and dashboard action is recorded with IP, user agent, and full details)
- Pagination support
- Rate limiting on auth routes (20 req / 15 min)
- Centralized error handling middleware
- Input validation via express-validator

## Architecture

```
Route → Controller → Service → Model
```

```
src/
├── config/         # DB connection
├── controllers/    # Request handlers
├── middlewares/    # auth, rbac, validate, error
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # Business logic
├── utils/          # jwt, hashing, response helpers
├── validators/     # express-validator rule sets
├── app.js
└── server.js
test/               # Jest + Supertest test suites
```

## Role System

| Role    | Permissions                        |
|---------|------------------------------------|
| ADMIN   | Full access (CRUD + Dashboard)     |
| ANALYST | Read transactions + Dashboard      |
| VIEWER  | Read transactions only             |

---

## 🚀 API Documentation

### Base URL

```
http://localhost:5000
```

---

### 🔐 Authentication

| Method | Endpoint             | Description                        | Auth Required |
|--------|----------------------|------------------------------------|---------------|
| POST   | /api/auth/register   | Register a new user account        | No            |
| POST   | /api/auth/login      | Authenticate & get access token    | No            |
| POST   | /api/auth/logout     | Invalidate session / clear cookie  | Yes           |

---

### 💸 Transactions

| Method | Endpoint                | Description                        | Roles Allowed              |
|--------|-------------------------|------------------------------------|----------------------------|
| GET    | /api/transactions       | Fetch all transactions             | ADMIN, ANALYST, VIEWER     |
| GET    | /api/transactions/:id   | Fetch a single transaction         | ADMIN, ANALYST, VIEWER     |
| POST   | /api/transactions       | Create a new transaction           | ADMIN                      |
| PATCH  | /api/transactions/:id   | Update a transaction               | ADMIN                      |
| DELETE | /api/transactions/:id   | Soft delete a transaction          | ADMIN                      |

---

### 📋 Audit Logs

| Method | Endpoint                        | Description                              | Roles Allowed |
|--------|---------------------------------|------------------------------------------|---------------|
| GET    | /api/audit                      | Fetch all audit logs (filterable)        | ADMIN         |
| GET    | /api/audit/transactions/:id     | Full audit history for a transaction     | ADMIN         |

---

### 📊 Dashboard & Analytics

| Method | Endpoint                 | Description                            | Roles Allowed     |
|--------|--------------------------|----------------------------------------|-------------------|
| GET    | /api/dashboard/summary   | Get balance, income & expense totals   | ADMIN, ANALYST    |
| GET    | /api/dashboard/trends    | Get time-series data for charts        | ADMIN, ANALYST    |

---

## 📝 Request Examples

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

### Create Transaction

```json
POST /api/transactions
Authorization: Bearer <your_token_here>

{
  "amount": 45.00,
  "type": "expense",
  "category": "Food",
  "date": "2026-04-05"
}
```

---

### Fetch Transaction Audit History

```
GET /api/audit/transactions/1
Authorization: Bearer <admin_token>
```

### Fetch All Audit Logs (with filters)

```
GET /api/audit?action=CREATE_TRANSACTION&resource=transaction&page=1&limit=20
Authorization: Bearer <admin_token>
```

---

## Setup Instructions

```bash
git clone https://github.com/vrajsolanki2005/finance-backend-system.git
cd finance-backend-system
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
ALLOWED_ORIGIN=http://localhost:3000
```

```bash
npm run dev      # development with nodemon
npm start        # production
npm test         # run Jest test suites
```

---

## Testing

Tests are located in the `test/` directory and use **Jest** + **Supertest**.

```
test/
├── auth.test.js
├── transaction.test.js
├── dashboard.test.js
└── audit.test.js
```

---
## Docs
Visit http://localhost:3000/api-docs after starting the server to explore the full interactive documentation.

## Assumptions

- Soft delete is used instead of permanent deletion (`isDeleted` flag)
- Only ADMIN can create, update, or delete transactions
- ANALYST can read transactions and access dashboard analytics
- VIEWER has read-only access to transactions
- JWT access token is sent via `Authorization: Bearer` header
- Refresh token is stored in an HTTP-only cookie
- CORS is restricted to `ALLOWED_ORIGIN` (default: `http://localhost:3000`)
- All actions (auth, transactions, dashboard) are recorded in the audit log
- UPDATE audit entries store a `before` and `after` snapshot of the transaction
- DELETE audit entries store a full `snapshot` of the transaction at time of deletion
- Only ADMIN can query audit logs
