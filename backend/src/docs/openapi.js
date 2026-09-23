const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Expense Tracker API',
    version: '1.0.0',
    description:
      'REST API for the Expense Tracker app. All expense and report endpoints require a Bearer token obtained from `/api/v1/auth/login` or `/api/v1/auth/register` (click **Authorize** and paste the token).',
  },
  servers: [{ url: '/api/v1', description: 'Current server' }],
  tags: [
    { name: 'Auth', description: 'Registration, login and password reset' },
    { name: 'Expenses', description: 'Expense CRUD' },
    { name: 'Reports', description: 'Aggregated spending reports' },
    { name: 'Health', description: 'Service health check' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true } },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'you@example.com' },
        },
      },
      AuthData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT, valid 7 days' },
        },
      },
      ExpenseInput: {
        type: 'object',
        required: ['amount', 'category', 'description'],
        properties: {
          amount: { type: 'number', minimum: 0.01, example: 45.5 },
          category: {
            type: 'string',
            enum: ['food', 'transport', 'housing', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'travel', 'other'],
            example: 'food',
          },
          description: { type: 'string', maxLength: 500, example: 'Grocery shopping' },
          date: { type: 'string', format: 'date-time', description: 'Defaults to now' },
          paymentMethod: {
            type: 'string',
            enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
            example: 'credit_card',
          },
        },
      },
      Expense: {
        allOf: [
          { $ref: '#/components/schemas/ExpenseInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              userId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', minLength: 3, maxLength: 30, example: 'johndoe' },
                  email: { type: 'string', format: 'email', example: 'you@example.com' },
                  password: { type: 'string', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }],
                  properties: { data: { $ref: '#/components/schemas/AuthData' } },
                },
              },
            },
          },
          409: { description: 'Email or username already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'you@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }],
                  properties: { data: { $ref: '#/components/schemas/AuthData' } },
                },
              },
            },
          },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Missing or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset link',
        description:
          'Sends a reset link (valid 15 minutes, single use) to the registered email address. Always returns 200 so accounts cannot be enumerated. With no SMTP configured, the email is logged to the server console instead of sent.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email', example: 'you@example.com' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent if the account exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/reset-password/{token}': {
      put: {
        tags: ['Auth'],
        summary: 'Set a new password using the emailed token',
        parameters: [
          { name: 'token', in: 'path', required: true, schema: { type: 'string' }, description: 'Raw reset token from the email link' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: { password: { type: 'string', minLength: 6, example: 'newSecret123' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset; the token is now invalidated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          400: { description: 'Token invalid or expired', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'List expenses (paginated, filterable)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['food', 'transport', 'housing', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'travel', 'other'] } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create an expense',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseInput' } } },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }],
                  properties: { data: { $ref: '#/components/schemas/Expense' } },
                },
              },
            },
          },
          400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/expenses/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Expenses'],
        summary: 'Get a single expense',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Expenses'],
        summary: 'Update an expense (partial allowed)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ExpenseInput' } } },
        },
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete an expense',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'Total spent, transaction count and average',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'months', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 24 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/reports/by-category': {
      get: {
        tags: ['Reports'],
        summary: 'Expense totals grouped by category',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'months', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 24 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/reports/by-time': {
      get: {
        tags: ['Reports'],
        summary: 'Monthly spending time series',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'months', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 24, description: 'Defaults to 6' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        description: 'Note: mounted under /api (i.e. /api/health), not /api/v1.',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'integer', example: 25 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default spec;
