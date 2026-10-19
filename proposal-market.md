# Delora Hypermarket — Online Ordering System

---

## Project Title

**Delora Hypermarket Online Ordering System**

---

## One-sentence Summary

A full-stack bilingual (Arabic/English) e-commerce platform for Egyptian hypermarkets featuring a customer storefront, admin dashboard, and REST API with 7 payment methods, transaction-safe orders, and WhatsApp-style customer support.

---

## Business Problem

1. Egyptian hypermarkets rely on in-store sales only, limiting customer reach
2. Customers lack a convenient, locally-built way to order groceries online
3. Store management has no efficient digital system for inventory, pricing, offers, and orders
4. Egypt requires 7+ payment methods (COD, mobile wallets, bank transfers, Visa) that international platforms don't fully support
5. The market needs seamless Arabic/English bilingual support with proper RTL layout
6. No integrated real-time customer support system exists between shoppers and store staff

---

## Proposed Solution

A three-tier architecture consisting of:

- **Customer Storefront** — 11-page React SPA for browsing, cart, checkout, order tracking, and support chat
- **Admin Dashboard** — 15+ page management panel for products, orders, users, team, promotions, content, and analytics
- **Backend API** — Node.js/Express REST server with 91 endpoints, MySQL database, JWT auth, and transaction-safe order processing

All three communicate via REST API with full bilingual (Arabic/English) support at every layer — database, API responses, and frontend UI with RTL/LTR layout switching.

---

## Target Users

| User Type | Description | Primary Actions |
|---|---|---|
| **Customers** | Egyptian shoppers buying groceries online | Browse, search, cart, checkout, track orders, support chat |
| **Store Managers** | Supermarket administrators | Manage products, orders, users, offers, payments, view analytics |
| **Team Members** | Admin staff with delegated permissions | Per-assigned tasks based on RBAC permissions |
| **Super Admin (Owner)** | Full system controller | Everything including team management and system settings |

---

## Core Features

### Customer Storefront
- Hero slider with auto-advance and Ken Burns effect
- Product catalog with category filters, sorting, and search
- Smart product cards with weight-based (kg/grams) and unit-based (pieces) ordering
- Add-to-cart modal with quick-select weight buttons and custom input
- Dual pricing system (regular + offer prices simultaneously)
- Shopping cart with local-first storage and backend sync at checkout
- 7 payment methods (COD, Vodafone Cash, Etisalat Cash, Orange Cash, WE Cash, InstaPay, Visa/MasterCard)
- Paymob gateway integration for online card payments
- Receipt image upload and transaction ID verification for offline payments
- User registration with 2-step OTP email verification
- 5-tab profile dashboard (stats, orders, support chat, wishlist, settings)
- WhatsApp-style customer support chat with file attachments, edit/delete messages
- Wishlist with toggle and animated badge
- Offers page with time-bound and stock-limited discount filters
- Dark mode with system preference detection
- Full Arabic/English bilingual support with RTL/LTR layout switching
- Animated page transitions and product card hover effects
- 404 error page with contact modal

### Admin Dashboard
- Dashboard overview with 6 stat cards, revenue chart, orders chart, store health
- Product management with CRUD, image upload, stock/price/category filters
- Category management with bilingual CRUD and image upload
- Order management with status chips, detail view, WhatsApp link, print
- User management with search, block/unblock, top customers, bulk promotional messaging
- Team management with CRUD, fine-grained permission matrix (14 resources x 5 actions)
- Owner password verification for sensitive actions
- Deals/promotions management with scheduling and play/pause toggle
- Hero slider banner management with priority reorder and category linking
- Footer configuration (4-tab: Identity, Contact, Locations, Social Media)
- Announcement banners with color customization, duration, and live preview
- Payment method configuration (online/offline types, QR codes, priority ordering)
- Customer support chat interface with status filter and auto-refresh
- Best products analytics with server-side pagination
- Inventory management with batch receiving and expiry tracking
- Bilingual translations (476 keys per language)

---

## System Components

```
+---------------------+     +---------------------+
|   Customer Store    |     |    Admin Dashboard   |
|   React 19 + Vite   |     |    React 18 + Vite   |
|   Port: 3000/5173   |     |    Port: 5174         |
+----------+----------+     +----------+------------+
           |                           |
           |    REST API (HTTP/HTTPS)  |
           |                           |
           +------------+--------------+
                        |
           +------------v--------------+
           |     Backend API Server    |
           |     Node.js + Express 5   |
           |     Port: 5000            |
           +------------+--------------+
                        |
           +------------v--------------+
           |       MySQL Database      |
           |     Delora_db (20 tables) |
           |     Port: 3307            |
           +---------------------------+
```

| Component | Purpose |
|---|---|
| **Customer Storefront** | B2C e-commerce storefront for shoppers |
| **Admin Dashboard** | Management panel for supermarket staff |
| **Backend API** | RESTful API server connecting everything |
| **MySQL Database** | Relational data storage (20 tables) |
| **File Storage** | Uploaded images (Multer disk storage) |

---

## Technical Architecture

### Request Flow
```
HTTP Request → Language Middleware → Rate Limiter → Route Handler → Auth Middleware → Role Middleware → Controller → MySQL → Response
```

### Authentication Architecture

| Feature | Storefront | Dashboard |
|---|---|---|
| User Table | users | team_members |
| Token Storage | localStorage | httpOnly cookie |
| Token Transport | Bearer header | Cookie (auto-sent) |
| Token Payload | { id, role } | { id, role, source: 'team' } |
| Login Identifiers | username/email/phone/name | email/name/phone |

### Role-Based Access Control

| Role | Storefront | Dashboard |
|---|---|---|
| super_admin | Full access | Full access + team management + logs |
| store_manager | Full access | Products, orders, users, settings |
| team_member | Full access | Per assigned permissions |
| customer | Cart, orders, favorites, addresses | No access |

### Order Processing (Transaction-Safe)
```
BEGIN TRANSACTION
→ Validate stock availability
→ Validate offer stock
→ Split items into offer/regular portions
→ Create order record
→ Insert order items with price snapshots
→ Deduct product stock
→ Deduct offer stock
→ Auto-cancel offer if stock hits 0
→ Clear cart
COMMIT TRANSACTION
(ROLLBACK on any failure)
```

### Rate Limiting
| Scope | Limit | Window |
|---|---|---|
| Global | 2000 requests | 15 minutes |
| Storefront Auth | 50 requests | 15 minutes |
| Dashboard Auth | Unlimited | -- |

---

## AI Components

### Current Data Collection Points
- Product browsing patterns (category views, search queries)
- Purchase history per user (order_items with price snapshots)
- Cart abandonment data (cart_items vs completed orders)
- Customer support interactions (chat_messages)
- Product ratings (schema exists, UI pending)
- Best seller analytics (units sold, revenue per product)

### Recommended AI Integrations (Future)

| Component | Application | Data Source |
|---|---|---|
| Product Recommendations | "Customers who bought X also bought Y" | order_items + cart_items |
| Demand Forecasting | Predict stock needs per product | Historical orders + inventory_batches |
| Dynamic Pricing | Offer optimization based on demand | Product views, cart additions, order frequency |
| Chatbot Support | Auto-reply to common inquiries | chat_messages training data |
| Search Optimization | Intelligent product search ranking | Search queries + click-through data |
| Customer Segmentation | Targeted promotions by buying behavior | Order history + spending patterns |
| Fraud Detection | Flag suspicious order patterns | Order frequency, payment anomalies |

---

## Technology Stack

### Backend
| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | LTS |
| Framework | Express | 5.2.1 |
| Database | MySQL | 8.x |
| MySQL Driver | mysql2 | 3.22.5 |
| Auth | jsonwebtoken | 9.0.3 |
| Password Hashing | bcrypt | 6.0.0 |
| Email | Nodemailer | 9.0.3 |
| File Upload | Multer | 2.2.0 |
| Rate Limiting | express-rate-limit | 8.6.0 |
| CORS | cors | 2.8.6 |
| Cookies | cookie-parser | 1.4.7 |

### Customer Storefront
| Component | Technology | Version |
|---|---|---|
| Framework | React | 19.2.7 |
| Build Tool | Vite | 8.1.1 |
| Styling | Tailwind CSS | 4.3.2 |
| Routing | React Router DOM | 7.18.1 |
| HTTP Client | Axios | 1.18.1 |
| Animations | Framer Motion | 12.42.2 |
| Icons | Lucide React + React Icons | -- |
| State | React Context API | -- |

### Admin Dashboard
| Component | Technology | Version |
|---|---|---|
| Framework | React | 18.2 |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.4.2 |
| Routing | React Router DOM | 6.22 |
| Data Fetching | TanStack React Query | 5.101 |
| HTTP Client | Axios | 1.18.1 |
| Charts | Recharts | 2.15 |
| Animations | Framer Motion | 12.42.2 |
| Icons | Lucide React | 1.24 |
| Toasts | Sonner | 2.0 |

---

## External Services

| Service | Purpose | Integration |
|---|---|---|
| **Paymob** | Online payment gateway (Visa/MasterCard) | 3-step API flow (auth → order → payment key) + webhook |
| **Gmail SMTP** | Email delivery for OTP codes | Nodemailer with HTML bilingual templates |
| **Netlify** | Frontend hosting (storefront + dashboard) | SPA deployment with _redirects fallback |
| **MySQL Hosting** | Database hosting | PlanetScale, AWS RDS, or Railway |

---

## APIs

### Endpoint Summary (91 Total)

| Module | Endpoints | Purpose |
|---|---|---|
| Auth (Storefront) | 8 | Register, verify OTP, login, profile, password reset |
| Auth (Dashboard) | 3 | Team login (httpOnly cookie), profile, logout |
| Categories | 6 | CRUD + status toggle |
| Products | 5 | CRUD + best sellers |
| Cart | 4 | Add, view, remove, clear |
| Orders | 5 | Checkout, my orders, admin CRUD + status |
| Banners | 7 | CRUD + status + priority |
| Branches | 4 | CRUD + active filter |
| Notifications | 4 | CRUD + active filter |
| Contacts | 3 | Submit, view, mark read |
| Complaints/Chat | 11 | Full chat system with messages |
| Addresses | 3 | Get, add, delete |
| Favorites | 2 | Get, toggle |
| Tags | 3 | Get, assign, products by tag |
| SEO | 2 | Get, upsert |
| Settings | 2 | Get, update |
| Footer Settings | 2 | Get, save |
| Inventory | 2 | Receive batch, view history |
| Payment Methods | 8 | CRUD + status + priority + default |
| Payments (Paymob) | 2 | Checkout + webhook |
| Dashboard Stats | 1 | KPI aggregates |
| Team | 6 | CRUD + status + owner verification |
| Users Management | 5 | CRUD + status toggle |
| Admin Logs | 1 | Audit trail |
| Announcements | 3 | Get, publish, clear |
| Deals | 4 | CRUD |
| Upload | 2 | Single + multiple images |
| Best Sellers | 1 | Paginated analytics |

### Key Public Endpoints
- `GET /api/products` — Products with computed offer prices
- `GET /api/categories` — Active categories
- `GET /api/banners/active` — Hero slider banners
- `GET /api/payment-methods/active` — Available payment methods
- `GET /api/announcements/current` — Current announcement
- `GET /api/settings` — Store configuration

### Key Authenticated Endpoints
- `POST /api/auth/login` — Login (returns JWT)
- `POST /api/orders/checkout` — Place order (transactional)
- `POST /api/favorites/toggle` — Toggle wishlist
- `POST /api/complaints` — Create support ticket

### Key Admin Endpoints
- `GET/POST/PUT/DELETE /api/products` — Product CRUD
- `PATCH /api/admin/orders/:id/status` — Update order status
- `GET/POST/PUT/DELETE /api/team` — Team management (super_admin only)

---

## Database

### Overview
- **Name:** Delora_db
- **Charset:** utf8mb4 (full Unicode/Arabic support)
- **Tables:** 20
- **Driver:** mysql2 (connection pool, 10 connections)

### Complete Schema

| Table | Purpose |
|---|---|
| users | Customer accounts + admin roles (4 roles) |
| team_members | Dashboard staff (isolated from users) |
| categories | Product categories (self-referencing hierarchy) |
| products | Product catalog with bilingual data |
| product_stock | Inventory tracking (1:1 with products) |
| product_images | Gallery images per product |
| inventory_batches | Supply batch records with expiry dates |
| cart_items | Per-user shopping cart |
| orders | Customer order records |
| order_items | Line items with price snapshots |
| favorites | User wishlists |
| contacts | Support ticket threads |
| chat_messages | WhatsApp-style chat messages |
| banners | Hero slider configuration |
| branches | Physical store locations |
| store_settings | Key-value global configuration |
| site_notifications | Timed announcement banners |
| payment_methods | Configurable payment options |
| coupons | Discount codes |
| tags / tagables | Polymorphic tagging system |
| seo_details | Bilingual SEO metadata |
| admin_logs | Admin action audit trail |

### Key Design Patterns

| Pattern | Purpose |
|---|---|
| Bilingual columns (name_ar/name_en) | Arabic-first with English fallback |
| Soft delete (is_active flags) | Preserves data while hiding from views |
| Price snapshots (order_items) | Historical pricing independent of current prices |
| Key-value store (store_settings) | Flexible configuration without schema changes |
| Transaction safety (BEGIN/COMMIT/ROLLBACK) | Atomic operations prevent data inconsistency |
| Auto-migration (ensureSchema) | Tables created at runtime via DDL |

---

## Deployment Strategy

### Development Environment

| Component | Configuration |
|---|---|
| Backend | localhost:5000 |
| Storefront | localhost:3000 or :5173 (Vite) |
| Dashboard | localhost:5174 (Vite, proxy /api → :5000) |
| Database | localhost:3307 (MySQL) |
| Email | Gmail SMTP (nodemailer) |
| Payments | Paymob sandbox |

### Production Deployment

| Component | Platform |
|---|---|
| Storefront | Netlify (SPA with _redirects fallback) |
| Dashboard | Netlify / Vercel |
| Backend | Node.js hosting (Heroku / Railway / VPS) |
| Database | MySQL cloud (PlanetScale / AWS RDS / Railway) |

### Environment Variables

**Backend:** DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT, PAYMOB_API_KEY, PAYMOB_HMAC_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

**Frontend:** VITE_API_BASE_URL

---

## Development Phases

### Phase 1: Planning & Design (Week 1-2)
- Requirements gathering and analysis
- System architecture and database schema design
- API endpoint specification (91 endpoints)
- UI/UX wireframes and mockups
- Project proposal documentation

### Phase 2: Backend Development (Week 3-6)
- Express server setup with middleware
- MySQL database creation and schema
- Authentication system (register, login, OTP, password reset)
- Product and category CRUD with bilingual support
- Shopping cart with stock validation
- Order processing with MySQL transactions
- Payment integration (Paymob + 7 offline methods)
- Admin API (team, users, settings, logs)
- Support ticket/chat system (11 endpoints)
- Banners, announcements, notifications
- File upload system
- Auto-schema migration

### Phase 3: Customer Storefront (Week 7-10)
- React project setup with Vite and Tailwind
- Component architecture (Header, Footer, Layout)
- Home page with hero slider and categories
- Product listing with filters, search, sorting
- Smart product card with add-to-cart modal
- Shopping cart with weight/quantity display
- Checkout with 7 payment methods
- Authentication pages (login, register, forgot/reset password)
- Profile dashboard with 5 tabs
- Support chat with file attachments
- Bilingual RTL/LTR switching
- Dark mode
- Animations and transitions

### Phase 4: Admin Dashboard (Week 11-14)
- React project setup with Vite, Tailwind, React Query
- Authentication and route protection
- Dashboard overview with charts and KPIs
- Product, category, order, user management
- Team management with RBAC permissions
- Deals, banners, footer, announcements management
- Payment method configuration
- Customer support interface
- Best products analytics
- Bilingual translations (476 keys per language)

### Phase 5: Testing & Deployment (Week 15-16)
- API testing (testAllApis.js)
- Frontend integration testing
- Cross-browser and mobile responsiveness testing
- Performance optimization and security audit
- Production deployment
- Documentation finalization

---

## Deliverables

### Functional Deliverables
1. Customer Storefront — 11-page React application with full e-commerce functionality
2. Admin Dashboard — 15+ page management panel with analytics and RBAC
3. Backend API — 91 endpoints across 28 modules with transaction safety
4. MySQL Database — 20 tables with proper constraints and relationships
5. API Documentation — 91 endpoints documented with request/response examples

### Technical Deliverables
1. Source code — 100+ files, 25,000+ lines across 3 applications
2. Authentication system — Dual auth (storefront JWT + dashboard httpOnly cookie)
3. Payment integration — Paymob gateway + 7 Egyptian offline methods
4. Bilingual system — Arabic/English at database, API, and frontend levels
5. RBAC system — 14 resources x 5 actions with owner verification

### Documentation Deliverables
1. Project proposal — This document
2. API mapping — 33 JSON files documenting every endpoint
3. Database scripts — 4 SQL files (schema, migrations, seeds)
4. Seed data — 5 scripts for testing and development

---

## Future Enhancements

### Short-Term (v2.0)
- Real-time chat via WebSocket (replace HTTP polling)
- Push notifications for order status updates
- Product reviews and ratings UI (schema exists)
- Coupon/discount code system at checkout
- Order tracking with delivery boy location
- Product image gallery with zoom

### Medium-Term (v3.0)
- Mobile app (React Native or Flutter)
- AI-powered product recommendations
- Multi-vendor marketplace support
- Delivery route optimization
- Loyalty points system
- A/B testing framework

### Long-Term (v4.0)
- Arabic voice ordering integration
- ML-based demand forecasting and dynamic pricing
- Multi-region/multi-currency support
- White-label solution for other supermarkets
- Microservices architecture migration
