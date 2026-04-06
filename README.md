# FinCore – Secure Financial Backend System

A backend system for managing financial transactions with role-based access control, analytics dashboard, and secure API design.

Inspired by real-world fintech architecture.

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

- JWT-based authentication with access + refresh tokens stored in HTTP-only cookies
- Role-based access control (ADMIN, ANALYST, VIEWER)
- Transaction management (Create, Read, Update, Soft Delete)
- Auto-incrementing `transactionId` per transaction
- Advanced filtering by type, category, and date with pagination
- Dashboard analytics (income, expense, net balance, trends)
- Audit logging — every auth, transaction, and dashboard action is recorded with IP, user agent, and full details
- Before/after snapshots on UPDATE, full snapshot on DELETE
- Rate limiting on auth routes (20 req / 15 min)
- Centralized error handling middleware
- Input validation via express-validator
- Interactive API docs via Swagger UI

---

## Architecture

```
Route → Controller → Service → Model
```

```
src/
├── config/         # DB connection, Swagger config
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

---

## Role System

| Role    | Permissions                                    |
|---------|------------------------------------------------|
| ADMIN   | Full access (CRUD + Dashboard + Audit Logs)    |
| ANALYST | Read transactions + Dashboard                  |
| VIEWER  | Read transactions only                         |

---

## API Documentation

### Base URL

```
http://localhost:5000
```

> Interactive Swagger docs: `http://localhost:5000/api-docs`

---

### Authentication

| Method | Endpoint           | Description                       | Auth Required |
|--------|--------------------|-----------------------------------|---------------|
| POST   | /api/auth/register | Register a new user account       | No            |
| POST   | /api/auth/login    | Authenticate & set token cookies  | No            |
| POST   | /api/auth/logout   | Clear session cookies             | Yes           |

---

### Transactions

| Method | Endpoint              | Description               | Roles Allowed      |
|--------|-----------------------|---------------------------|--------------------|
| GET    | /api/transactions     | Fetch all transactions    | ADMIN, ANALYST     |
| GET    | /api/transactions/:id | Fetch a single transaction| ADMIN, ANALYST     |
| POST   | /api/transactions     | Create a new transaction  | ADMIN              |
| PATCH  | /api/transactions/:id | Update a transaction      | ADMIN              |
| DELETE | /api/transactions/:id | Soft delete a transaction | ADMIN              |

#### Query Parameters — `GET /api/transactions`

| Param      | Type    | Description                        |
|------------|---------|------------------------------------|
| `type`     | string  | Filter by `income` or `expense`    |
| `category` | string  | Filter by category name            |
| `page`     | integer | Page number (default: 1)           |
| `limit`    | integer | Results per page (default: 10, max: 100) |

---

### Audit Logs

| Method | Endpoint                    | Description                           | Roles Allowed |
|--------|-----------------------------|---------------------------------------|---------------|
| GET    | /api/audit                  | Fetch all audit logs (filterable)     | ADMIN         |
| GET    | /api/audit/transactions/:id | Full audit history for a transaction  | ADMIN         |

#### Query Parameters — `GET /api/audit`

| Param      | Type    | Description                                                      |
|------------|---------|------------------------------------------------------------------|
| `userId`   | string  | Filter by user ObjectId                                          |
| `action`   | string  | Filter by action (e.g. `LOGIN`, `CREATE_TRANSACTION`)            |
| `resource` | string  | Filter by resource type (`auth`, `transaction`, `dashboard`)     |
| `page`     | integer | Page number (default: 1)                                         |
| `limit`    | integer | Results per page (default: 20)                                   |

#### Audit Actions Reference

| Action                  | Resource    | Details logged                                      |
|-------------------------|-------------|-----------------------------------------------------|
| `REGISTER`              | auth        | email, role                                         |
| `LOGIN`                 | auth        | email, role                                         |
| `LOGOUT`                | auth        | —                                                   |
| `CREATE_TRANSACTION`    | transaction | transactionId, amount, type, category, date         |
| `UPDATE_TRANSACTION`    | transaction | transactionId, before snapshot, after snapshot      |
| `DELETE_TRANSACTION`    | transaction | transactionId, full snapshot at time of deletion    |
| `GET_ALL_TRANSACTIONS`  | transaction | filters applied                                     |
| `GET_TRANSACTION`       | transaction | transactionId                                       |
| `VIEW_DASHBOARD_SUMMARY`| dashboard   | —                                                   |
| `VIEW_DASHBOARD_TRENDS` | dashboard   | —                                                   |

---

### Dashboard & Analytics

| Method | Endpoint               | Description                          | Roles Allowed  |
|--------|------------------------|--------------------------------------|----------------|
| GET    | /api/dashboard/summary | Get net balance, income & expense    | ADMIN, ANALYST |
| GET    | /api/dashboard/trends  | Get monthly time-series data         | ADMIN, ANALYST |

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

> Access and refresh tokens are set as HTTP-only cookies. No token is returned in the response body.

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

## Assumptions

- Soft delete is used instead of permanent deletion (`isDeleted` flag)
- Only ADMIN can create, update, or delete transactions
- ANALYST can read transactions and access dashboard analytics
- VIEWER has read-only access to transactions
- VIEWER cannot access `GET /api/transactions` — only ADMIN and ANALYST can
- JWT access token is sent via `Authorization: Bearer` header
- Refresh token is stored in an HTTP-only cookie
- CORS is restricted to `ALLOWED_ORIGIN` (default: `http://localhost:3000`)
- All actions (auth, transactions, dashboard) are recorded in the audit log
- UPDATE audit entries store a `before` and `after` snapshot of the transaction
- DELETE audit entries store a full `snapshot` of the transaction at time of deletion
- Only ADMIN can query audit logs
