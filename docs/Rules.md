# Rules

## Libraries & Stack
- Use only libraries already present in package.json unless explicitly requested.
- Do not introduce new UI libraries, chart libraries, or state managers without confirmation.
- Prefer existing patterns: React Router v6, Context API, Axios, Tailwind utility classes, Recharts.

## Code Style
- Keep feature changes small and focused.
- Follow existing file naming and folder conventions.
- Maintain:, semantic HTML labels, and visible focus styles.

## Validation & Errors
- Backend validation must use Zod schemas.
- API errors must return JSON with shape: { success, message, errors? }
- Frontend must not swallow errors silently; show user-facing messages.

## Security
- Use helmet, cors, and rate limiting in backend.
- Protect routes server-side with JWT middleware.
- Never commit secrets or .env to version-controlled outputs.

## Data Model
- User email and username must remain unique.
- Expense category must use the existing enum values.
- Mongoose schema validation should mirror Zod validation.

## What Not To Do
- Do not add raw SQL migrations or another ORM.
- Do not replace Recharts without requirement change.
- Do not implement dark mode, themes, or i18n unless requested.
- Do not expose stack traces in production responses.
