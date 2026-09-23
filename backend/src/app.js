import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import reportRoutes from './routes/reports.js';
import errorHandler from './middleware/errorHandler.js';
import openapiSpec from './docs/openapi.js';

dotenv.config();

const app = express();

// Security middleware
// script-src allows 'unsafe-inline' so the Swagger UI at /api-docs can initialize
// (its bootstrap script is inline; assets themselves are same-origin).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API docs (interactive Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Expense Tracker API Docs' }));
app.get('/api-docs.json', (_req, res) => res.json(openapiSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/reports', reportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
