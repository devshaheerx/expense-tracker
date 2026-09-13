# Ledger — Full-Stack Expense Tracker

A MERN-stack expense tracker with production-grade authentication (email OTP + Google & GitHub OAuth, JWT refresh rotation, multi-device sessions), budget alerts, and MongoDB aggregation-powered spending insights.

**Live demo:** [expense-tracker-client-zeta-taupe.vercel.app](https://expense-tracker-client-zeta-taupe.vercel.app)

> **Note on the live demo:** OTP emails only deliver to a Resend-verified test address, and Google/GitHub OAuth login is restricted to a whitelisted test account (Google Cloud app is in "Testing" mode, unverified). This is expected for a portfolio deployment — the code and architecture are fully production-ready; only the third-party service tiers are scoped down for a demo project. Reach out for a full walkthrough with live access.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture Notes](#architecture-notes)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Author](#author)

---

## Features

### Authentication
- Email + password signup with 6-digit OTP email verification (hashed, time-limited, resendable)
- Google and GitHub OAuth via Passport.js, with automatic account linking by email — one user, one account, regardless of sign-in method
- JWT access + refresh tokens in httpOnly, `secure`, `sameSite`-configured cookies
- Silent access-token refresh via an Axios interceptor — expired tokens are renewed transparently, with request queuing to avoid duplicate refresh calls under concurrent requests
- Refresh token rotation with theft detection: each refresh both invalidates the old token and issues a new one, so a stolen-and-reused token is caught immediately
- Multi-device sessions tracked in their own collection — "log out" ends the current session only; "log out everywhere" revokes every session for the account
- Forgot / reset password, reusing the same OTP infrastructure as signup

### Expense Tracking
- Add, edit, and delete income/expense transactions with category tags
- Per-category monthly budget limits with automatic alerts (warning at 80%, exceeded at 100%) computed live whenever a transaction is added
- Category spending breakdown, income-vs-expense trend by month, category-specific 6-month trend, and budget-vs-actual comparison — all powered by MongoDB `$match` / `$group` / `$sum` aggregation pipelines, visualized with Recharts

### UI / UX
- Custom "ledger" design system: hard-edge bordered cards with offset shadows in light mode, glassmorphic blurred panels with ambient glow in dark mode
- Collapsible desktop sidebar and a sliding mobile drawer, both driven by a single toggle
- Persisted dark/light theme via Context + localStorage
- Fully responsive down to mobile widths
- Theme-aware toast notifications (react-hot-toast, styled to match the active theme)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Redux Toolkit, React Router, Tailwind CSS v4, Recharts, GSAP, Axios, react-hot-toast, lucide-react |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Passport.js (Google & GitHub strategies), JWT, bcryptjs, Resend, express-rate-limit, cookie-parser, cors, morgan |
| **Deployment** | Vercel — frontend and backend deployed as two independent projects, backend running as a serverless Express function |

---

## Folder Structure

```
expense-tracker/
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB connection, cached across serverless invocations
│   ├── constants/
│   │   └── categories.js          # shared income/expense category lists
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   └── summaryController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification, attaches req.user
│   │   └── rateLimiter.js         # rate limits on OTP request/verify endpoints
│   ├── models/
│   │   ├── User.js
│   │   ├── RefreshToken.js        # one document per active session/device
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── passport/
│   │   └── passportConfig.js      # Google + GitHub OAuth strategies
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── summaryRoutes.js
│   ├── services/
│   │   ├── authService.js         # all auth business logic; controllers stay thin
│   │   ├── transactionService.js
│   │   ├── budgetService.js
│   │   └── summaryService.js      # aggregation pipelines live here
│   ├── utils/
│   │   ├── generateOTP.js
│   │   ├── generateTokens.js      # JWT signing, cookie config
│   │   └── sendEmail.js           # Resend integration
│   ├── server.js
│   ├── vercel.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js   # baseURL, credentials, refresh-on-401 interceptor
    │   ├── app/
    │   │   └── store.js           # Redux store
    │   ├── components/
    │   │   ├── AuthLayout.jsx
    │   │   ├── DashboardLayout.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ThemeToggle.jsx
    │   │   ├── CategoryPieChart.jsx
    │   │   ├── CategoryBarChart.jsx
    │   │   ├── TrendLineChart.jsx
    │   │   ├── BudgetComparisonChart.jsx
    │   │   └── OverviewCards.jsx
    │   ├── constants/
    │   │   └── categories.js
    │   ├── context/
    │   │   └── ThemeContext.jsx
    │   ├── features/
    │   │   ├── auth/authSlice.js
    │   │   ├── transactions/transactionSlice.js
    │   │   ├── budgets/budgetSlice.js
    │   │   └── summary/summarySlice.js
    │   ├── hooks/
    │   │   └── useCountUp.js
    │   ├── pages/
    │   │   ├── Login.jsx / Signup.jsx / VerifyOtp.jsx
    │   │   ├── ForgotPassword.jsx / ResetPassword.jsx
    │   │   ├── Overview.jsx / TransactionsPage.jsx / BudgetsPage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   └── PageNotFound.jsx
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # design tokens, theme variables, component classes
    ├── vercel.json                # SPA rewrite rule for client-side routing
    └── .env.example
```

---

## Architecture Notes

**Service/controller separation.** Controllers only translate between HTTP (`req`/`res`) and plain function calls; all business logic — validation, database calls, error conditions — lives in `services/`. This is what lets OAuth login and local login share the exact same token-issuing logic (`issueTokensForUser`) instead of duplicating it across four call sites.

**User-scoped queries everywhere.** Every transaction and budget lookup filters by both the document's `_id` *and* `user: req.user._id` in the same query. This means a logged-in user cannot read, edit, or delete another user's data even if they somehow obtained a valid document ID — the query simply returns nothing rather than someone else's record.

**Account linking, not duplication.** Signing up with a password and later logging in with Google using the same email links the OAuth provider to the existing account (`googleId` gets added) rather than creating a second, disconnected user. `authProvider` reflects how the account originally began, not every way it can currently authenticate.

**Serverless-safe MongoDB connections.** A naive `mongoose.connect()` call at module load time works locally but causes intermittent failures on Vercel, where a serverless function can be invoked many times without a full process restart. The connection is cached on `global` across warm invocations, and a request-level middleware `await`s that connection before any route handler runs — eliminating both cold-start timeouts and connection-pool exhaustion under concurrent requests.

**Refresh token rotation with theft detection.** Each `RefreshToken` document is single-use: refreshing deletes the old session and issues a brand-new one. If a stolen refresh token is replayed after the legitimate user has already rotated it, the lookup fails and the request is rejected — the attacker's copy is worthless after one use.

**Separate OAuth apps per environment.** Google allows multiple redirect URIs on a single OAuth client, so one Google Cloud client covers both `localhost` and production. GitHub allows only one callback URL per OAuth App, so local development and production use two entirely separate GitHub OAuth Apps with their own Client ID/Secret pairs.

---

## API Reference

All routes are prefixed with `/api`. Protected routes require a valid `accessToken` cookie.

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Create account, send OTP |
| POST | `/verify-otp` | Verify OTP, log in |
| POST | `/resend-otp` | Resend OTP |
| POST | `/login` | Email/password login |
| POST | `/refresh-token` | Rotate access + refresh tokens |
| POST | `/logout` | End current session |
| POST | `/logout-all` | End all sessions for this account |
| POST | `/forgot-password` | Request password reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| GET | `/google`, `/github` | Begin OAuth flow |
| GET | `/google/callback`, `/github/callback` | OAuth provider redirect target |
| GET | `/me` | *(protected)* Current user |

### Transactions (`/api/transactions`) — all protected
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create transaction (returns budget alert if applicable) |
| GET | `/` | List transactions (filterable by type/category/date, paginated) |
| PATCH | `/:id` | Update transaction |
| DELETE | `/:id` | Delete transaction |

### Budgets (`/api/budgets`) — all protected
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create budget |
| GET | `/` | List budgets |
| PATCH | `/:id` | Update budget |
| DELETE | `/:id` | Delete budget |

### Summary (`/api/summary`) — all protected
| Method | Endpoint | Description |
|---|---|---|
| GET | `/category?type=` | Spending/income breakdown by category |
| GET | `/trend?year=` | Monthly income vs. expense for a year |
| GET | `/category-trend?category=&months=` | One category's spend over N months |
| GET | `/budget-vs-actual` | Every budget's limit vs. actual spend this month |
| GET | `/overview` | Current month's income, expense, balance |

---

## Local Setup

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in your own MongoDB URI, JWT secrets, Resend key, OAuth credentials
npm run dev

# Frontend (separate terminal)
cd client
npm install
cp .env.example .env   # set VITE_API_URL to http://localhost:5000/api
npm run dev
```

**You'll need:**
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works) with Network Access set to allow your IP
- A [Resend](https://resend.com) API key for OTP emails
- A Google Cloud OAuth client ([console.cloud.google.com](https://console.cloud.google.com)) with `http://localhost:5000/api/auth/google/callback` as an authorized redirect URI
- A GitHub OAuth App ([github.com/settings/developers](https://github.com/settings/developers)) with `http://localhost:5000/api/auth/github/callback` as the callback URL

---

## Deployment

Both `server/` and `client/` deploy as **separate Vercel projects**:

- **Backend** includes a `vercel.json` configuring it as a serverless Node function, with `app.listen()` conditionally skipped in production
- **Frontend** includes a `vercel.json` with a SPA rewrite rule (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`) so client-side routes like `/dashboard` don't 404 on direct navigation
- Environment variables (API keys, JWT secrets, OAuth credentials, `CLIENT_URL`/`VITE_API_URL`) are configured separately in each Vercel project's dashboard — never committed
- Production OAuth callback URLs are registered separately from development ones (see Architecture Notes above)

---

## Author

**Syed Shaheer Ahmed** — Full-stack (MERN) developer.
[GitHub](https://github.com/devshaheerx)
