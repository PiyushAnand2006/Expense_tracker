# Architecture

## High-Level Flow
Client -> React UI -> Axios -> Express API -> Mongoose -> MongoDB

## Tech Stack
- Frontend: React 18, React Router v6, Tailwind CSS, Recharts, Lucide icons, Vite
- Backend: Node.js, Express, Zod, JWT (jsonwebtoken), Helmet, CORS, express-rate-limit
- Database: MongoDB (Mongoose)
- DevOps: Docker Compose, Docker multi-stage builds, Nginx for frontend

## Folder Structure
backend/
  src/
    app.js
    server.js
    config/database.js
    middleware/auth.js, errorHandler.js, validate.js
    models/User.js, Expense.js
    controllers/authController.js, expenseController.js, reportController.js
    routes/auth.js, expenses.js, reports.js
    utils/generateToken.js, logger.js
  .env, .gitignore, package.json, Dockerfile

frontend/
  src/
    main.jsx, App.jsx, index.css
    context/AuthContext.jsx
    services/api.js, authService.js, expenseService.js, reportService.js
    utils/helpers.js
    components/common/ProtectedRoute.jsx
    components/layout/Navbar.jsx
    components/expenses/SummaryCards.jsx, ExpenseForm.jsx, ExpenseList.jsx
    pages/LoginPage.jsx, RegisterPage.jsx, DashboardPage.jsx, ExpensesPage.jsx, ReportsPage.jsx
  index.html, vite.config.js, tailwind.config.js, postcss.config.js, package.json, Dockerfile

root/
  package.json, docker-compose.yml, .gitignore, README.md

## API Surface
- Auth: register, login, me
- Expenses: CRUD + list with pagination/filters
- Reports: summary, by-category, by-time aggregations

## Auth Model
- JWT stored client-side in localStorage
- Axios interceptor attaches Bearer token
- Unauthorized responses redirect to login

## Error Handling
- Backend: centralized errorHandler returns structured JSON
- Frontend: global 401 interceptor logout + redirect
- Validation: Zod in controllers/routes with field-level error mapping
