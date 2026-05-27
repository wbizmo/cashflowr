# CashFlowr

CashFlowr is a personal finance management application that enables users to record income and expenses, organize transactions into categories, create budgets, monitor spending activity, and view financial summaries through interactive dashboards and analytics.

The application includes secure authentication, user-specific financial data isolation, budget tracking, transaction management, category management, activity notifications, currency preferences, and light/dark theme support.

Built with React, Node.js, Express, MongoDB, and Tailwind CSS, CashFlowr provides a complete environment for managing personal finances from a single dashboard.

---

# Author

Ashibuogwu Williams

---

# Overview

CashFlowr centralizes day-to-day financial management into a single application.

Users can:

- Track income
- Track expenses
- Categorize transactions
- Create monthly budgets
- Monitor budget utilization
- Review financial activity
- View financial analytics
- Receive transaction notifications
- Change currency preferences
- Switch between light and dark themes

All financial records are linked to the authenticated user, ensuring complete separation of data between accounts.

---

# Technology Stack

## Frontend

- React
- React Router DOM
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- Framer Motion
- React Context API

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- cors

---

# Application Pages

## Landing Page

Public entry point for the application.

Features:

- Application overview
- Feature highlights
- Authentication navigation
- Responsive layout
- Theme-aware styling

---

## Login

Allows existing users to authenticate.

Features:

- Email authentication
- Password authentication
- Validation handling
- JWT generation
- Secure login workflow

---

## Register

Allows new users to create accounts.

Features:

- First name
- Last name
- Email
- Password
- Secure password hashing
- Automatic login after registration

---

## Dashboard

Central overview of financial activity.

Displays:

- Current Balance
- Total Income
- Total Expenses
- Savings Rate
- Budget Snapshot
- Recent Transactions
- Financial Charts
- Activity Summary

Dashboard data is generated from the user's actual transactions and budgets.

---

## Transactions

Complete transaction management system.

Users can:

- Create transactions
- Edit transactions
- Delete transactions
- Search transactions
- Filter transactions
- View transaction history

### Transaction Fields

| Field | Description |
|---------|-------------|
| Title | Transaction title |
| Amount | Monetary value |
| Type | Income or Expense |
| Category | Selected category |
| Description | Optional note |
| Date | Transaction date |

### Transaction Types

#### Income

Examples:

- Salary
- Business Revenue
- Freelance Payments
- Investments

#### Expense

Examples:

- Food
- Transportation
- Rent
- Utilities
- Entertainment

### Validation

The system verifies:

- Category exists
- Category belongs to user
- Category type matches transaction type

Invalid combinations are rejected by the API.

---

## Categories

User-defined financial classifications.

Categories are used throughout:

- Transactions
- Budgets
- Dashboard Analytics
- Spending Breakdown Charts

### Category Features

- Create category
- Edit category
- Delete category
- Assign color
- Assign icon
- Income categories
- Expense categories

### Category Fields

| Field | Description |
|---------|-------------|
| Name | Category name |
| Type | Income or Expense |
| Color | Category color |
| Icon | Category icon |

---

## Budgets

Monthly budget planning and monitoring.

Users can create spending limits for specific categories and monitor progress against those limits.

### Budget Features

- Create budget
- Edit budget
- Delete budget
- Monthly budgeting
- Category budgeting
- Spending tracking
- Remaining balance calculation
- Utilization percentage calculation

### Budget Metrics

Each budget displays:

- Budget Amount
- Amount Spent
- Remaining Amount
- Usage Percentage

### Example

```text
Budget: ₦100,000
Spent: ₦35,000
Remaining: ₦65,000
Used: 35%
```

---

## Analytics

Financial analytics and reporting dashboard.

Analytics are calculated dynamically from transaction and budget records.

### Available Metrics

- Current Balance
- Total Income
- Total Expenses
- Savings Rate
- Transaction Count
- Income Count
- Expense Count
- Average Expense
- Budget Utilization
- Highest Expense Category

### Category Breakdown

Displays spending distribution by category.

Example:

```text
Food
Transportation
Housing
Utilities
Entertainment
```

### Monthly Trend

Tracks:

- Monthly Income
- Monthly Expenses
- Monthly Balance

### Income vs Expense

Visual comparison of total income against total expenses.

### Charts

The analytics page uses Recharts for:

- Area Charts
- Pie Charts
- Bar Charts

---

## Notifications

Activity notification system.

Notifications are generated automatically when important financial activity occurs.

### Notification Features

- Notification Center
- Navbar Notification Dropdown
- Unread Count
- Mark All Read
- Activity History
- Notification Timestamps

### Notification Data

Notifications may include:

- Transaction Type
- Transaction Amount
- Transaction Category
- Creation Time

### Examples

```text
Income Added
Expense Recorded
Transaction Updated
```

---

## Settings

User preference management.

Users can update account preferences without modifying authentication records.

### Available Settings

- First Name
- Last Name
- Currency Preference

### Read-Only Information

- Email Address

### Supported Currencies

```text
USD
GBP
EUR
NGN
```

Currency selection updates monetary displays throughout the application.

---

# Authentication

CashFlowr uses JSON Web Tokens for authentication.

## Authentication Flow

### Registration

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
```

Protected routes require a valid bearer token.

Example:

```http
Authorization: Bearer <token>
```

---

# Password Security

User passwords are never stored in plain text.

Passwords are hashed using bcrypt before being saved to the database.

Example:

```js
const hashedPassword = await bcrypt.hash(password, 10);
```

During login:

```js
await bcrypt.compare(password, user.password);
```

Only hashed values are stored in MongoDB.

---

# User Data Isolation

Every major resource is linked to the authenticated user.

Resources include:

- Transactions
- Categories
- Budgets
- Notifications
- Dashboard Data
- Analytics Data
- Settings

Example query pattern:

```js
{
  user: req.user._id
}
```

This ensures users can only access their own financial information.

---

# Currency System

CashFlowr supports multiple display currencies.

Supported currencies:

```text
USD
GBP
EUR
NGN
```

Displayed symbols:

```text
USD → $
GBP → £
EUR → €
NGN → ₦
```

Currency preferences automatically update:

- Dashboard
- Transactions
- Budgets
- Analytics
- Notifications
- Navbar Notification Dropdown

---

# Theme System

CashFlowr includes application-wide theme switching.

Available themes:

- Light
- Dark

Theme support includes:

- Dashboard
- Sidebar
- Navbar
- Cards
- Modals
- Inputs
- Dropdowns
- Notifications
- Preloader

Theme changes are applied throughout the entire application interface.

---

# Notification Architecture

Transaction activity automatically generates notification records.

Example notification payload:

```js
{
  user,
  type,
  title,
  message,
  metadata: {
    transactionId,
    amount,
    transactionType,
    categoryId,
    categoryName
  }
}
```

Notification metadata is used by:

- Notification Center
- Navbar Dropdown
- Activity Indicators

---

# API Routes

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

---

## Users

```http
PUT /api/users/settings
```

---

## Transactions

```http
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

---

## Categories

```http
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

---

## Budgets

```http
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

---

## Notifications

```http
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/mark-all-read
```

---

## Dashboard

```http
GET /api/dashboard/summary
```

---

## Analytics

```http
GET /api/analytics/summary
```

---

# Backend Structure

```text
server/
├── config/
│   └── db.js
│
├── controllers/
│   ├── analyticsController.js
│   ├── authController.js
│   ├── budgetController.js
│   ├── categoryController.js
│   ├── dashboardController.js
│   ├── notificationController.js
│   ├── transactionController.js
│   └── userController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── Budget.js
│   ├── Category.js
│   ├── Notification.js
│   ├── Transaction.js
│   └── User.js
│
├── routes/
│   ├── analyticsRoutes.js
│   ├── authRoutes.js
│   ├── budgetRoutes.js
│   ├── categoryRoutes.js
│   ├── dashboardRoutes.js
│   ├── notificationRoutes.js
│   ├── transactionRoutes.js
│   └── userRoutes.js
│
├── utils/
│   └── generateToken.js
│
└── server.js
```

---

# Frontend Structure

```text
client/
├── src/
│
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
│
└── App.jsx
```

---

# Environment Variables

## Backend

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

## Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/wbizmo/cashflowr.git
cd cashflowr
```

## Backend Setup

```bash
cd server
npm install
npm run dev
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

# Deployment

Recommended deployment configuration:

```text
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas
```

Frontend production environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Backend production environment variable:

```env
CLIENT_URL=https://your-frontend-url.vercel.app
```

---

# Screenshots

Recommended screenshots for documentation:

```text
Landing Page
Dashboard
Transactions
Categories
Budgets
Analytics
Notifications
Settings
Mobile Dashboard
```

---

# License

MIT

---

# Author

Ashibuogwu Williams