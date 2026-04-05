# FinCore – Secure Financial Backend System

A backend system for managing financial transactions with role-based access control, analytics dashboard, and secure API design.

Inspired by real-world fintech architecture.

---
## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Express Validator

## Features
- JWT-based Authentication
- Role-Based Access Control (Admin, Analyst, Viewer)
- Transaction Management (CRUD with soft delete)
- Advanced Filtering (date, category, type)
- Dashboard Analytics (income, expense, trends)
- Pagination support
- Rate limiting for API protection

## Architecture
The project follows a modular architecture with separation of concerns:

Route → Controller → Service → Model

This ensures scalability, maintainability, and clean code structure.

## Role System
| Role    | Permissions      |
| ------- | ---------------- |
| Admin   | Full access      |
| Analyst | Read + Dashboard |
| Viewer  | Limited access   |

# 🚀 API Documentation

## 🌐 Base URL
All requests should be sent to:

---

## 🔐 Authentication

| Method | Endpoint              | Description                         | Auth Required |
|--------|---------------------|-------------------------------------|--------------|
| POST   | /api/auth/register  | Register a new user account         | No           |
| POST   | /api/auth/login     | Authenticate & get access token     | No           |

---

## 💸 Transactions

| Method | Endpoint             | Description                         | Auth Required |
|--------|----------------------|-------------------------------------|--------------|
| GET    | /api/transactions    | Fetch all user transactions         | Yes          |
| POST   | /api/transactions    | Create a new transaction            | Yes          |

---

## 📊 Dashboard & Analytics

| Method | Endpoint                    | Description                              | Auth Required |
|--------|-----------------------------|------------------------------------------|--------------|
| GET    | /api/dashboard/summary      | Get balance, income & expense totals     | Yes          |
| GET    | /api/dashboard/trends       | Get time-series data for charts          | Yes          |

---

## 📝 Request Example

### Create Transaction

```json
{
  "amount": 45.00,
  "category": "Food",
  "description": "Lunch at the bistro",
  "date": "2026-04-05"
}
```

Authorization: Bearer <your_token_here>

## Setup Instructions

cd project
npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret

npm run dev

## Assumptions
- Soft delete is used instead of permanent deletion
- Only Admin can modify transactions
- Analysts can only view analytics
- All endpoints are secured using JWT
