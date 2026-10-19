# Delora Hypermarket — Full-Stack E-Commerce Platform

A complete, bilingual (Arabic/English) online grocery & hypermarket platform built as a **DEPI graduation project**. It ships three applications in one monorepo: a customer-facing **storefront**, an **admin dashboard**, and a **REST API** backend, backed by a MySQL database.

> **Market focus:** designed for the Egyptian market — full RTL support, 7 local payment methods (COD, mobile wallets, InstaPay, cards), EGP pricing, and a WhatsApp-style shopper ↔ staff support chat.

---

## 📂 Table of Contents

- [Project Overview](#-project-overview)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Backend](#-backend)
- [Storefront (Delora)](#-storefront-delora)
- [Admin Dashboard](#-admin-dashboard)
- [Database](#-database)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Known Issues / Roadmap](#-known-issues--roadmap)

---

## 🏪 Project Overview

**Delora / Dealora** is a three-tier e-commerce system:

| Tier | App | Folder | Stack | Default Port |
|---|---|---|---|---|
| Presentation | Customer Storefront | `Delora/` | React 19 + Vite 8 + Tailwind v4 | 5173 |
| Presentation | Admin Dashboard | `Dashboard/` | React 18 + Vite 5 + Tailwind v3 | 5174 |
| Application | REST API | `backEnd/` | Node.js + Express 5 (ES Modules) | 5000 |
| Data | MySQL / MariaDB | `DataBase/` | MySQL 8 schema (~22 tables) | 3307 |

**Target users:**
- **Customers** — browse, order, track, and get support.
- **Store managers & team members** — manage the store with granular permissions.
- **Super admin (Owner)** — full control, including team permission management.

---

## 🗂 Repository Structure

```
DEPI-Graduation-Project-main/
├── backEnd/                 # Node.js + Express 5 REST API
│   ├── src/
│   │   ├── server.js        # App entry (middleware, routes, rate limits)
│   │   ├── config/db.js     # MySQL connection pool
│   │   ├── controllers/     # 30 feature controllers
│   │   ├── middlewares/     # JWT auth, role guard, language detection
│   │   └── routes/          # 31 route files (~115 endpoints)
│   ├── uploads/             # Uploaded images (served at /uploads)
│   ├── migrate.js / seed.js # DB setup & demo-data scripts
│   └── .env                 # Local secrets (git-ignored)
├── Delora/                  # Customer storefront (React SPA)
│   └── src/
│       ├── Pages/           # Home, products, offers, cart, checkout, profile…
│       ├── Components/      # Navbar, hero slider, product cards, banners
│       ├── Layout/          # Header / Footer
│       ├── Store/           # Global state provider (SiteProvider)
│       ├── Services/        # Axios API client + route guards
│       └── context/         # Theme provider
├── Dashboard/               # Admin dashboard (React SPA)
│   └── src/
│       ├── pages/           # Dashboard, products, orders, team, deals…
│       ├── components/      # Layout, sidebar, permission gate, charts
│       ├── services/        # API service layer (axios)
│       ├── Hooks/           # Data-fetching hooks (React Query + useEffect)
│       ├── context/         # Auth, language, theme contexts
│       ├── data/            # Route & permission definitions, mock data
│       └── translation/     # EN/AR dictionaries (~400 keys each)
├── DataBase/                # SQL schemas & migrations
│   ├── delora_db.sql        # ← authoritative initial schema
│   ├── migration_add_columns.sql
│   └── sdb.txt              # Live dump snapshot (test data)
├── api-mapping/             # API ↔ UI documentation
│   ├── brief.txt            # JSON collection w/ request/response examples
│   └── inDetails/           # 28 JSON module files (91 documented endpoints)
├── proposal-features.md     # Full feature catalog (~330+ features)
├── proposal-market.md       # Market analysis & project proposal
└── project proposal.pdf     # Original proposal document
```

---

## 🛠 Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | **Express 5** |
| Database | **MySQL / MariaDB** via `mysql2` promise pool |
| Authentication | **JWT** (`jsonwebtoken`) + **bcrypt** password hashing |
| File uploads | **Multer** (disk storage, image-only, 10 MB max) |
| Email | **Nodemailer** (Gmail SMTP — OTP & password-reset emails) |
| Payments | **Paymob** gateway (3-step iframe integration via `axios`) |
| Rate limiting | **express-rate-limit** (global + auth-specific) |
| CORS / cookies | `cors`, `cookie-parser` (httpOnly dashboard token) |
| Dev tools | `nodemon` |

### Storefront (`Delora/`)
| Concern | Technology |
|---|---|
| Framework | **React 19** + **Vite 8** |
| Routing | **React Router DOM v7** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first config) |
| State | **React Context** (`SiteProvider`) + `localStorage` cart |
| HTTP | **Axios** with request/response interceptors |
| Animation | **Framer Motion** + CSS keyframes |
| Icons | `lucide-react`, `react-icons` |
| i18n | Custom AR/EN language state with full RTL support |

### Admin Dashboard (`Dashboard/`)
| Concern | Technology |
|---|---|
| Framework | **React 18** + **Vite 5** |
| Routing | **React Router v6** (permission-guarded routes) |
| Styling | **Tailwind CSS 3** |
| Server state | **TanStack React Query v5** (products, deals, team) |
| Charts | **Recharts** (revenue area chart, weekly orders bar chart) |
| Animation | **Framer Motion** |
| Toasts | **Sonner** |
| Icons | `lucide-react` |
| i18n | Custom dictionaries (`translation/ar.js`, `translation/en.js`) + automatic RTL |

---

## ⚙️ Backend

**Entry point:** `backEnd/src/server.js` · **Base URL:** `http://localhost:5000`

### Architecture
- **Modular MVC-ish layout** — 31 route files → 30 controllers → `config/db.js` MySQL pool.
- **~115 REST endpoints** under `/api/...`, all returning JSON.
- **Bilingual responses** — inline language middleware reads `Accept-Language` or `?lang=` (default `ar`) and sets `req.lang`; many queries select `IFNULL(name_ar, name_en)` style columns.
- **Static file serving** — uploaded images exposed at `GET /uploads/<file>`.
- **Global error handler** — localized 500 responses; error details exposed only when `NODE_ENV=development`.
- **Self-healing schema** — several controllers run `CREATE TABLE IF NOT EXISTS` / tolerant `ALTER TABLE` on boot, so parts of the DB auto-migrate on first run.

### Security & Reliability
- **Dual JWT authentication**
  - *Storefront:* `users` table → `Authorization: Bearer <token>` header (1-day expiry), passwords bcrypt-hashed (10 salt rounds).
  - *Dashboard:* separate `team_members` table → JWT stored in an **httpOnly cookie** (`delora_dash_token`, `sameSite: lax`, `secure` in production), Bearer header accepted as fallback.
- **Role-based access control** — `protect` + `authorizeRoles('super_admin', 'store_manager', 'team_member')`; audit logs are `super_admin`-only.
- **Rate limiting** — 2000 req/15 min globally on `/api/*`, 50 req/15 min on storefront auth endpoints, both returning localized 429 messages.
- **OTP verification** — 6-digit email OTP (10-min TTL) for registration and password reset, sent as bilingual HTML emails.
- **Transaction-safe checkout** — stock validation → offer/regular price split → order + items insert → stock decrement → offer auto-close when exhausted → cart clear, all COMMIT/ROLLBACK wrapped.

### API Surface (by module)

| Area | Key endpoints |
|---|---|
| **Auth (storefront)** | `POST /api/auth/register`, `/verify-email`, `/resend-otp`, `/forgot-password`, `/reset-password`, `/login`; `GET/PUT /api/auth/profile`; `PUT /api/auth/change-password` |
| **Auth (dashboard)** | `POST /api/auth/dashboard/login`, `/logout`; `GET /api/auth/dashboard/profile` |
| **Products** | `GET /api/products`, `/api/products/:id`, `/api/products/best-sellers`; `POST/PUT/DELETE` (admin) |
| **Categories** | `GET /api/categories`, `/api/categories/admin`; CRUD + status toggle (admin) |
| **Cart** | `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/:productId`, `/api/cart/clear` |
| **Orders** | `POST /api/orders/checkout`, `GET /api/orders/my-orders` |
| **Admin orders** | `GET /api/admin/orders`, `/:id`; `PATCH /:id/status` (stock restored on cancel) |
| **Payments** | `POST /api/payments/checkout` (Paymob), `POST /api/payments/webhook` |
| **Payment methods** | CRUD + status/priority/default toggles, `GET /api/payment-methods/active` |
| **Favorites / Addresses** | `GET/POST /api/favorites`, `/api/favorites/toggle`; address CRUD |
| **Support / Complaints** | Ticket CRUD, WhatsApp-style chat: `GET/POST /api/complaints/:ticketId/messages`, replies, statuses |
| **Content CMS** | Banners (hero slider), announcements, footer settings, store settings, tags, SEO details |
| **Management** | Users management, team members + permissions, dashboard stats, inventory batches, deals, logs |
| **Uploads** | `POST /api/upload` (single), `POST /api/upload/multiple` (up to 10 images) |
| **Misc** | Contact messages, branches, notifications, health check `GET /` |

### Utility Scripts (`backEnd/`)

```bash
node migrate.js          # create/patch tables
node seed.js             # seed logins (admin, manager, customer)
node seedDemoData.js     # demo categories/products/branches
node testAllApis.js      # smoke-test all endpoints against localhost:5000
```

---

## 🛒 Storefront (Delora)

The customer-facing SPA — an animated, mobile-first grocery store.

### Routes

| Path | Page | Description |
|---|---|---|
| `/` | WelcomePage | Animated Framer Motion splash → auto-redirects to `/home` |
| `/home` | HomePage | Hero slider, category grid, randomized recommendations, live search |
| `/category/:categoryId` | CategoryPage | Products filtered by category |
| `/products` | ProductPage | Full catalog with sidebar filters, sorting, grid density toggle |
| `/offers` | OfferPage | Active discounts with time/stock tabs and category filters |
| `/cart` | CartPage | Line items, weight vs. quantity, offer/regular pricing, totals |
| `/checkout` | CheckoutPage | Delivery form + dynamic payment methods, receipt/transaction upload |
| `/wishlist` | WishlistPage | Saved favorites |
| `/profile` | ProfilePage | 5-tab account dashboard (stats, orders, support chat, wishlist, settings) |
| `/login` · `/register` | Auth pages | JWT login / 2-step registration with email OTP |
| `/forgot-password` · `/reset-password` | Auth pages | OTP-based password recovery |
| `*` | ErrorPage | 404 with contact-support modal (phones / WhatsApp) |

### Highlights
- **Weight-based ordering** — quick-select 125 g / 255 g / 500 g / 1 kg presets, custom grams, or order-by-price for products sold by weight.
- **Smart product cards** — discount % badge, wishlist heart, low-stock warnings, offer countdown / "until stock runs out" chips, quantity modal.
- **WhatsApp-style support chat** — ticket threads with edit/delete messages, attachments, unread-reply banner, 5-second polling while open.
- **Local-first cart** — persisted in `localStorage` (`dealora_market_cart`) and synced to the backend at checkout; requires login to add items.
- **Offline resilience** — if the API is unreachable, falls back to a built-in demo dataset; `Promise.allSettled` bootstrap + 30-second polling for store data, orders, and announcements.
- **Full AR/EN + RTL** — Arabic default, per-component `dir` switching, RTL-aware icons/logical CSS utilities, language toggle gated by the backend's multi-language setting.
- **Axios client** — auto-attaches Bearer token from `localStorage`, unwraps responses, clears the token on 401, 10 s timeout.

---

## 📊 Admin Dashboard

The management SPA — `http://localhost:5174`, proxied `/api` → backend at `:5000`.

### Routes

| Path | Page | Permission |
|---|---|---|
| `/login` | Login | Public |
| `/` | Dashboard (KPIs + charts) | `dashboard` |
| `/products` | Products CRUD | `products` |
| `/best-products` | Best-sellers analytics | `bestProducts` |
| `/orders`, `/orders/:id` | Order list & details | `orders` |
| `/orders-by-users` | Customers management | `users` |
| `/team`, `/team/add`, `/team/edit/:id`, `/team/permissions/:id` | Team & RBAC | `team.*` |
| `/add-category` | Category management | `categories` |
| `/hero-slider` | Banner/slider management | `heroSlider` |
| `/deals`, `/deals/add`, `/deals/edit/:id` | Promotions | `deals.*` |
| `/announcement` | Storefront announcement builder | `announcement` |
| `/FooterSettings` | Footer editor (identity/contact/locations/social) | `footer` |
| `/payment-methods` | Payment method configuration | `paymentMethods` |
| `/complaints` | Support inbox (split-pane chat) | `complaints` |
| `/settings` | Admin profile & password | `settings` |

### Highlights
- **RBAC permission matrix** — 14 resources × actions (view/add/edit/delete/manage-permissions). The **Owner** (`super_admin`) always has access; team members get a curated checkbox grid. Sensitive actions require **owner-password confirmation**.
- **Permission-aware UI** — sidebar items, buttons, and pages are hidden or disabled via `<HasPermission>` and `ProtectedRoute`.
- **Analytics dashboard** — 6 KPI stat cards (customers, orders, revenue, pending), Recharts revenue area chart (6 months) & weekly orders bar chart (7 days), low-stock alerts, expiring deals, recent activity, quick actions.
- **Product management** — CRUD with image upload, bilingual fields, category sidebar with counts, offer badges, advanced filters (stock/price), React Query cache invalidation.
- **Order management** — status filter chips with counts, search, full order detail (customer, payment, items with offer badges), status updates, print, WhatsApp deep-link to the customer.
- **Team management** — roster with owner spotlight, add/edit admins with avatar upload, per-page permission matrix, status toggles.
- **Deals & content** — deals (%, fixed, schedule, play/pause), hero slider with priority reordering, 4-tab footer editor, announcement composer with color pickers and live preview.
- **Payment methods** — logos, brand colors, online/offline type, receiver wallet details, QR code, require-screenshot / require-transaction-ID flags, priority & single-default enforcement.
- **Customers** — stats, search, top-spenders filter, block/unblock, broadcast promotional messages.
- **Bilingual UI** — ~400 translation keys per language, automatic `<html dir>` switching, toggle in the topbar and login page.

---

## 🗄 Database

**Authoritative schema:** `DataBase/delora_db.sql` (creates `Delora_db`, `utf8mb4` for full Arabic support).

### Tables (~22)

| Group | Tables |
|---|---|
| Users | `users`, `user_addresses` |
| Catalog | `categories` (self-referencing hierarchy), `products`, `product_images`, `tags`, `tagables` |
| Inventory | `product_stock`, `inventory_batches` |
| SEO / Reviews / Coupons | `seo_details`, `product_reviews`, `coupons` |
| Commerce | `favorites`, `cart_items`, `orders`, `order_items` |
| Support / CMS | `contacts`, `chat_messages`, `admin_logs`, `site_notifications`, `banners`, `branches` |
| Config | `store_settings` (key-value), `payment_methods` |
| Runtime-created | `team_members` (auto-migrated by the backend) |

### Design patterns
- **Bilingual columns** — `name_ar` / `name_en` (and `IFNULL`-based selection per request language).
- **Soft delete** — `is_active` flags instead of row deletion for catalog entities.
- **Price snapshots** — `order_items.price_per_unit` preserves the price at purchase time.
- **Polymorphic relations** — `seo_details`, `tagables` use `entity_type` + `entity_id`.
- **Key-value settings** — `store_settings` and footer rows for runtime configuration.
- **Referential integrity** — FKs with `CASCADE` / `RESTRICT` / `SET NULL` chosen per relationship.

---

## ✨ Features

### Customer Storefront (~150+)
- Animated branded splash screen and page transitions (Framer Motion).
- Sticky header: dynamic logo, live search, category dropdown, animated cart/wishlist badges, AR/EN toggle.
- Auto-rotating hero slider, hanging announcement banners with custom colors & auto-expiry, unread-admin-reply banner.
- Catalog with category filters, price sorting, grid-density toggle; offers page with time/stock tabs.
- Smart product cards: discount badges, wishlist toggle, stock warnings, offer countdowns, weight-based ordering.
- Cart persisted locally with stock validation and offer/regular price splitting.
- Checkout with 7 Egyptian payment methods, receipt screenshot upload, transaction-ID entry, phone validation.
- Auth: 2-step registration with 6-digit OTP + 60 s resend countdown, login by email/phone, forgot/reset password.
- 5-tab profile: order stats & history, order-detail modal, live support chat, wishlist, settings.
- Order tracking with 30-second polling; order-change requests from pending orders.
- Rich footer: 7 social networks, branch locations, working hours, dynamic copyright.
- 404 page with contact modal; graceful fallback demo data when the backend is offline.
- Full Arabic/English bilingual support with RTL layouts throughout.

### Admin Dashboard (~180+)
- Secure httpOnly-cookie authentication with session restore and protected routes.
- Collapsible, permission-filtered sidebar with live badges (pending orders, open complaints).
- KPI dashboard with Recharts analytics, low-stock and expiring-deal alerts.
- Full product / category / deal / banner / footer / payment-method management.
- Order lifecycle management with WhatsApp integration and printable order details.
- Team management with a granular RBAC permission matrix and owner-password gating.
- Customer management with broadcast messaging and block/unblock.
- Support inbox: split-pane chat, reply with images, status workflow (Open/Replied/Closed).
- Announcement builder with live preview and color pickers.
- Bilingual (AR/EN) interface with automatic RTL; responsive down to mobile.

### Backend (~115 endpoints)
- JWT auth (dual-mode: Bearer header + httpOnly cookie), bcrypt hashing, email OTP.
- Role-based authorization, rate limiting, audit logs.
- Transaction-safe checkout with stock & offer management.
- Multer image uploads, Nodemailer emails, Paymob payment integration.
- Bilingual localized responses and error messages.
- Runtime schema self-migration and seed/migration scripts.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MySQL 8** (or MariaDB) — typically via XAMPP/WAMP (default port in config: `3307`)

### 1. Database

```bash
mysql -u root -p -e "CREATE DATABASE Delora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p Delora_db < DataBase/delora_db.sql
mysql -u root -p Delora_db < DataBase/migration_add_columns.sql
```

### 2. Backend

```bash
cd backEnd
npm install
# create a .env file (see Environment Variables below)
npm run dev          # nodemon, or: npm start
```

Optional seeding:

```bash
node migrate.js          # patch/create missing tables
node seed.js             # demo logins (admin/admin123, manager/manager123, customer/customer123)
node seedDemoData.js     # demo categories, products, branches
```

The API is now live at **http://localhost:5000** (health check: `GET /`).

### 3. Storefront

```bash
cd Delora
npm install
npm run dev          # http://localhost:5173
```

Optionally create `Delora/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STOREFRONT_URL=http://localhost:5173
```

(Defaults work out of the box for local development.)

### 4. Admin Dashboard

```bash
cd Dashboard
npm install
npm run dev          # http://localhost:5174 (proxies /api → :5000)
```

The dashboard reads `Dashboard/.env`:

```
VITE_API_BASE_URL=/api
VITE_STOREFRONT_URL=http://localhost:5173
```

> Log in with a **team account** (seeded: `admin / admin123`). The Owner account gets full permissions.

---

## 🔐 Environment Variables

Create `backEnd/.env`:

| Variable | Required | Description |
|---|---|---|
| `PORT` | optional | API port (default `5000`) |
| `NODE_ENV` | recommended | `development` / `production` — controls cookie security & error detail exposure |
| `DB_HOST` | ✅ | MySQL host (e.g. `localhost`) |
| `DB_USER` | ✅ | MySQL user (e.g. `root`) |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_NAME` | ✅ | Database name (`Delora_db`) |
| `DB_PORT` | optional | MySQL port (default `3307`) |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `EMAIL_USER` | ✅ | Gmail address for OTP emails |
| `EMAIL_PASS` | ✅ | Gmail app password |
| `PAYMOB_API_KEY` | for online payment | Paymob auth API key |
| `PAYMOB_INTEGRATION_ID` | for online payment | Paymob integration id |
| `PAYMOB_IFRAME_ID` | for online payment | Paymob iframe id |

Frontend apps:

| App | Variable | Description |
|---|---|---|
| `Delora/` | `VITE_API_BASE_URL` | API base (default `http://localhost:5000/api`) |
| `Delora/` | `VITE_STOREFRONT_URL` | Storefront URL (default `/`) |
| `Dashboard/` | `VITE_API_BASE_URL` | API base (default `/api`, dev-proxied to `:5000`) |
| `Dashboard/` | `VITE_STOREFRONT_URL` | URL opened by the "View Store" button |

> `.env` files are git-ignored — never commit secrets.

---

## 📖 API Documentation

- **`api-mapping/brief.txt`** — JSON collection of representative endpoints with Arabic descriptions, full request/response examples, and `ui_mapping` (which screen each endpoint powers).
- **`api-mapping/inDetails/`** — 28 machine-readable module JSON files documenting **91 endpoints** (methods, auth requirements, typed request/response schemas, `frontendUsage`, `frontendDisplay`), plus `index.json` manifest with global config and known issues.
- **`proposal-features.md`** — exhaustive ~330-feature catalog for both apps.
- **`proposal-market.md`** — market analysis, architecture, phased 16-week plan, and v2.0–v4.0 roadmap.

Quick smoke test:

```bash
cd backEnd && node testAllApis.js
```

---

## ⚠️ Known Issues / Roadmap

**Known issues**
- The Paymob webhook responds `OK` but the DB status update is not yet wired up.
- Dark mode providers exist in both SPAs but are not yet consumed by the UI.
- Some service files in `Dashboard/` still fall back to mock data when `VITE_API_BASE_URL` is unset; a few legacy/unused components remain in the tree.
- Brand spelling varies across the repo (**Delora / DeaLora / Dealora**) — cosmetic only.
- Root `.gitignore` only excludes `node_modules/` and `.env`.

**Planned (from the proposal)**
- **v2.0** — WebSocket live chat, push notifications, product reviews UI, coupons.
- **v3.0** — Mobile app, AI product recommendations, multi-vendor support.
- **v4.0** — Arabic voice ordering, ML demand forecasting, white-label solution.

---

*Built as a graduation project for the DEPI (Digital Egypt Platform Initiative) program.*
