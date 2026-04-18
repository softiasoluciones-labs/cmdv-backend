# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (nodemon + ts-node, port 3002)
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled production build
```

No test runner or linter is currently configured.

## Architecture

**Stack:** Node.js + TypeScript, Express 5, PostgreSQL + Sequelize ORM, JWT auth, Winston logging.

**Entry point:** `src/server.ts` → instantiates `App` class from `src/app.ts`, which wires database → middleware → routes → error handler.

**API:** All endpoints are versioned under `/api/v1/*`. Routes are registered in `src/api/v1/routes.ts` and delegate to module routers in `src/api/v1/routers/`.

**Layer pattern per domain:**
```
routers/ → controllers/ → services/ → repositories/ → models/
```
DTOs live in `dtos/`, input validation in `validators/` (express-validator).

**Domains:** `auth`, `users`, `roles`, `inventory`, `medical`, `config`.

**Database models** are organized by domain under `src/database/`:
- `core/` – users, roles, permissions, jwt_tokens, user_permissions, audit_logs
- `config/` – security_parameters, global_parameters, notifications
- `inventory/`, `medical/`

**Middleware stack** (applied in order): Helmet → CORS → body-parser → Morgan logger → rate limiting → auth (opt-in per route via `authMiddleware`).

Auth uses `Authorization: Bearer <token>`. The middleware attaches `userId` and `email` to `req.user`. Tokens are tracked in the `jwt_tokens` table.

**Config** is loaded in `src/config/config.ts` from `.env`. Key variables:

```
PORT=3002
DB_HOST / DB_PORT / DB_DATABASE / DB_USERNAME / DB_PASSWORD
JWT_SECRET / JWT_EXPIRES_IN / JWT_REFRESH_SECRET / JWT_REFRESH_EXPIRATION
CORS_ORIGINS
RATE_LIMIT_WINDOW / RATE_LIMIT_MAX
AUTH_RATE_LIMIT_WINDOW / AUTH_RATE_LIMIT_MAX
```

Sequelize uses underscored column names (`created_at`, `updated_at`) with connection pooling tuned per environment.
