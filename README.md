# Node Backend Template

A production-ready Node.js/Express backend template with MongoDB, dual-model auth, 2FA, password reset, and security hardening.

## Stack

- **Runtime**: Node.js ≥ 18 (ESM — `"type": "module"`)
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose
- **Auth**: JWT + optional 2FA (email OTP)
- **Validation**: Joi
- **Email**: Nodemailer with branded HTML templates
- **Password hashing**: Argon2
- **Code quality**: ESLint 9 (flat config) + Prettier + Husky

## Features

- Dual-model auth (User + Admin) with separate JWT flows
- Two-factor authentication via email OTP
- Password reset with hashed, expiring codes
- Role-based access control (RBAC)
- Structured error handling (`ApiError` + `errorHandler`)
- Standardised API responses (`ApiResponse`)
- Paginated list queries with search and status filters
- Security: Helmet, CORS whitelist, rate limiting, XSS/HPP/MongoDB injection protection
- Per-route auth rate limiting (10 req / 15 min on login/forgot/reset)
- Graceful shutdown (SIGINT / SIGTERM)
- Branded transactional email templates (configurable via env)
- Vercel-ready (`vercel.json`)

## Quick Start

### Prerequisites

- Node.js ≥ 18
- pnpm (or npm / yarn)
- MongoDB (local or Atlas)

### Install

```bash
pnpm install
```

### Configure

```bash
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, SMTP_*, BRAND_NAME, etc.
```

### Run

```bash
# development (auto-reload)
pnpm dev

# production
pnpm start
```

## Project Structure

```
src/
├── config/
│   └── database.js              # MongoDB connection
├── constants/
│   └── index.js                 # Shared enums (ROLES, STATUSES)
├── controllers/
│   ├── admin.controller.js
│   ├── auth.password.controller.js
│   └── user.controller.js
├── emails/
│   ├── mailer.js                # Transport, base template, building blocks
│   ├── auth.emails.js           # Verification, 2FA, password reset emails
│   └── index.js                 # Barrel exports
├── middleware/
│   ├── admin.auth.js            # Admin JWT guard
│   ├── errorHandler.js          # Global error handler
│   └── user.auth.js             # User JWT guard
├── models/
│   ├── admin.model.js
│   └── user.model.js
├── routes/
│   ├── admin.routes.js
│   ├── index.js
│   └── user.routes.js
├── services/
│   ├── admin.service.js
│   ├── otp.service.js           # 2FA code management
│   ├── password.service.js      # Forgot/reset password
│   └── user.service.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── jwt.js
│   ├── pagination.js
│   └── password.js              # Argon2 hash/verify
└── validations/
    ├── admin.validation.js
    ├── auth.validation.js
    └── user.validation.js
```

## API Routes

### User Auth — `/api/v1/user-auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Login |
| POST | `/forgot-password` | Public | Request reset code |
| POST | `/reset-password` | Public | Reset password with code |
| GET | `/get-me` | User | Get current user |
| POST | `/add-user` | Admin | Create user |
| GET | `/get-all` | Admin | List users (paginated) |
| GET | `/get/:id` | Admin | Get user by ID |
| PUT | `/update-user/:id` | Admin | Update user |
| PUT | `/update-status/:id` | Admin | Toggle status |
| PUT | `/change-password/:id` | Self / Admin | Change password |
| DELETE | `/delete-user/:id` | Admin | Delete user |

### Admin Auth — `/api/v1/admin-auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | Public | Login |
| POST | `/forgot-password` | Public | Request reset code |
| POST | `/reset-password` | Public | Reset password with code |
| GET | `/get-me` | Admin | Get current admin |
| POST | `/add-user` | Admin | Create admin user |
| GET | `/get-all` | Admin | List admin users (paginated) |
| GET | `/get/:id` | Admin | Get admin by ID |
| PUT | `/update-user/:id` | Admin | Update admin |
| PUT | `/update-status/:id` | Admin | Toggle status |
| PUT | `/change-password/:id` | Admin | Change password |
| DELETE | `/delete-user/:id` | Superadmin / Admin | Delete admin |

## Seeding the First Admin

Since `POST /admin-auth/add-user` requires authentication, create the first admin via a seed script or directly in MongoDB:

```js
// scripts/seed-admin.js (example)
import AdminUser from "../src/models/admin.model.js";
import { hashPassword } from "../src/utils/password.js";

await AdminUser.create({
  username: "superadmin",
  email: "admin@yourapp.com",
  password: await hashPassword("ChangeMe123!"),
  role: "superadmin",
});
```

## Email Branding

Set these env vars to brand all transactional emails:

```env
BRAND_NAME=Your App
BRAND_COLOR=#4F46E5
CLIENT_URL=https://yourapp.com
```

To add new email types, create a file under `src/emails/` (e.g. `billing.emails.js`), import the building blocks from `mailer.js`, and re-export from `index.js`.

## License

MIT
