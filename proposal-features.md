# Delora Hypermarket — Complete Feature List

## Customer Storefront (Dealora) & Admin Dashboard — Separated

---

# DEALORA STOREFRONT — All Features

---

## 1. Welcome & Splash Screen

| # | Feature | Description |
|---|---|---|
| 1.1 | Animated splash page | Framer Motion sequenced SVG animations (shopping bag, cart, ball, brand text) |
| 1.2 | Auto-redirect | Automatically navigates to /home after 5.1 seconds |
| 1.3 | Skip button | Allows users to skip the animation and go directly to the store |
| 1.4 | Spring physics animation | Bounce and spring effects on animated elements |

---

## 2. Navigation & Header

| # | Feature | Description |
|---|---|---|
| 2.1 | Sticky header | Header remains fixed at top while scrolling |
| 2.2 | Dynamic logo | Logo pulled from admin settings (backend-driven) |
| 2.3 | Search bar | Real-time product search with RTL/LTR support |
| 2.4 | User icon | Shows profile image when logged in, initials fallback, navigates to profile/login |
| 2.5 | Wishlist icon | Heart icon with animated badge counter (ping animation) showing item count |
| 2.6 | Cart icon | Shopping bag icon with animated badge counter showing item count |
| 2.7 | Category dropdown | Hover-activated dropdown showing all active categories with images |
| 2.8 | Navigation links | Home, Products, Offers links |
| 2.9 | Language toggle | AR/EN switch (conditionally shown based on admin setting isMultiLanguage) |
| 2.10 | Click-outside close | Category dropdown closes when clicking outside |
| 2.11 | Form submit prevention | Prevents page reload on /offers page search submit |
| 2.12 | Conditional header hiding | Header hidden on welcome, error, cart, auth, and dashboard routes |

---

## 3. Announcement & Notification System

| # | Feature | Description |
|---|---|---|
| 3.1 | Hanging announcement banner | Animated banner at top of page with custom background/text/title colors |
| 3.2 | Spring physics animation | Banner uses Framer Motion spring physics (stiffness: 100, damping: 15) |
| 3.3 | Auto-expiration | Banner auto-hides based on expiresAt timestamp |
| 3.4 | Dismiss button | User can manually dismiss the announcement |
| 3.5 | Bilingual content | Announcement text supports Arabic and English |
| 3.6 | Admin reply notification banner | Top banner appears when admin replies to a support ticket |
| 3.7 | Unread reply counter | Tracks unread admin replies with persistent localStorage counter |
| 3.8 | Click-to-navigate | Clicking admin reply banner navigates to profile chat tab |
| 3.9 | Polling refresh | Announcements polled every 30 seconds from backend |

---

## 4. Home Page

| # | Feature | Description |
|---|---|---|
| 4.1 | Hero slider | Auto-advancing image carousel (5-second interval) with category-linked CTAs |
| 4.2 | Ken Burns effect | Subtle scale animation on hero slider images |
| 4.3 | RTL-aware arrows | Slider navigation arrows flip direction based on language |
| 4.4 | Category grid | Responsive grid of category cards (3-6 columns) with images and product counts |
| 4.5 | Category card click | Navigates to /category/:categoryId with product listing |
| 4.6 | Recommended products | 20 randomized products displayed in responsive grid |
| 4.7 | Fisher-Yates shuffle | Products randomized on each page load for variety |
| 4.8 | Scroll to products | Smooth scroll to products section on category/slider navigation |
| 4.9 | Search filtering | Real-time search filters products on the home page |
| 4.10 | Order success toast | Shows success message after successful checkout |
| 4.11 | Fallback logo | Falls back to logo if no slider data available |

---

## 5. Product Display (Smart Product Card)

| # | Feature | Description |
|---|---|---|
| 5.1 | Discount badge | Shows percentage off on discounted products |
| 5.2 | Wishlist toggle | Heart icon toggle with animated fill effect |
| 5.3 | Hover lift effect | Card lifts (-translate-y-2) on hover with shadow expansion |
| 5.4 | Image zoom | Product image zooms on hover |
| 5.5 | Add-to-cart modal | Portal-based modal for selecting quantity/weight |
| 5.6 | Weight-based ordering | Quick-select buttons: 125g, 250g, 500g, 1kg + custom gram input |
| 5.7 | Price-by-amount input | Order by entering desired price amount (weight calculated automatically) |
| 5.8 | Unit-based ordering | +/- quantity selector for packaged products |
| 5.9 | Stock awareness | "Out of stock" overlay, "Only X left!" warnings |
| 5.10 | Remaining weight display | Shows remaining weight for weight-based products |
| 5.11 | Offer countdown timer | Countdown for time-limited offers showing days/hours/minutes |
| 5.12 | Stock-limited offer badge | "Until stock lasts" indicator for stock-limited offers |
| 5.13 | Offer expiration | Auto-hides expired offers and depleted stock-limited offers |
| 5.14 | Dual pricing | Shows both regular and offer price when applicable |
| 5.15 | Staggered grid animation | Products fade-up with cascading delays (index * 12ms) |
| 5.16 | Image fallback | Uses logo as fallback when product image fails to load |
| 5.17 | Login guard | Requires authentication before adding to cart |

---

## 6. Products Page (Full Catalog)

| # | Feature | Description |
|---|---|---|
| 6.1 | Sidebar category filter | Desktop sidebar with clickable category list |
| 6.2 | Mobile filter chips | Horizontal scrollable category chips for mobile |
| 6.3 | Sort options | Default, Price Low-to-High, Price High-to-Low |
| 6.4 | Grid toggle | Dynamic vs Compact layout toggle |
| 6.5 | Real-time search | Search filters products across the full catalog |
| 6.6 | Staggered animations | Product cards animate in with cascading delays |
| 6.7 | Product count | Shows total number of matching products |

---

## 7. Category Page

| # | Feature | Description |
|---|---|---|
| 7.1 | Category header | Displays category image, name, and product count |
| 7.2 | Category-filtered products | Shows only products belonging to selected category |
| 7.3 | Search within category | Search filters products within the current category |
| 7.4 | Back button | Navigate back to home/store |
| 7.5 | Staggered grid animation | Products animate in with cascading delays |

---

## 8. Offers Page

| # | Feature | Description |
|---|---|---|
| 8.1 | Tab filters | All Offers, Until Stock Out, Limited Time tabs |
| 8.2 | Time-based sub-filters | Ends Today, Within a Week, Within a Month |
| 8.3 | Category sidebar | Only shows categories with active offers |
| 8.4 | Auto-hide expired | Automatically hides expired offers |
| 8.5 | Auto-hide depleted | Hides stock-limited offers when offer_stock_remaining = 0 |
| 8.6 | Cart-aware display | Hides products already in cart from offer listings |
| 8.7 | Offer validity display | Shows countdown timer or "Until stock lasts" per offer type |

---

## 9. Shopping Cart

| # | Feature | Description |
|---|---|---|
| 9.1 | Local-first storage | Cart stored in localStorage (dealora_market_cart) |
| 9.2 | Weight/quantity display | Shows items with correct unit (grams/kg or pieces) |
| 9.3 | Remove items | Remove individual items from cart |
| 9.4 | Grand total | Displays total price at bottom |
| 9.5 | Fixed bottom bar | Total and checkout button fixed at bottom |
| 9.6 | Empty state | Designed empty cart with "Back to Store" CTA |
| 9.7 | Dual pricing | Handles both regular and offer prices simultaneously |
| 9.8 | Split pricing logic | Items split into offer-priced and regular-priced entries |
| 9.9 | Stock validation | Prevents adding more than available stock |
| 9.10 | Backend sync at checkout | Cart synced to backend before order placement |
| 9.11 | Success sound | Audio feedback when items are added to cart |
| 9.12 | Weight-based display | Correctly displays weight-based items (e.g., 500g, 1kg) |
| 9.13 | Offer price tracking | Shows whether each item is at offer price or regular price |

---

## 10. Checkout / Payment Page

| # | Feature | Description |
|---|---|---|
| 10.1 | Customer info form | Name, phone, address fields |
| 10.2 | Dynamic payment methods | Payment methods loaded from backend |
| 10.3 | Payment method selection | Card-based selection of payment option |
| 10.4 | Copy to clipboard | Wallet numbers can be copied with visual feedback |
| 10.5 | Receipt image upload | Upload payment receipt for offline methods |
| 10.6 | Transaction ID input | Enter transaction ID for methods that require it |
| 10.7 | Phone validation | Egyptian phone format (11 digits starting with 0) |
| 10.8 | Email validation | Standard email format validation |
| 10.9 | Dark theme | Dark-themed checkout form |
| 10.10 | Order placement | Creates order via backend API with all cart items |
| 10.11 | Cart clearing | Cart cleared after successful order |
| 10.12 | Address selection | Choose from saved addresses or enter manual address |
| 10.13 | Notes field | Add special delivery instructions |

---

## 11. User Authentication

| # | Feature | Description |
|---|---|---|
| 11.1 | Login form | Email/phone + password input |
| 11.2 | Password visibility toggle | Eye icon to show/hide password |
| 11.3 | Auto-redirect | Admins redirected to /dashboard, users to /profile |
| 11.4 | Two-step registration | Step 1: form + profile photo, Step 2: OTP verification |
| 11.5 | Profile photo upload | Optional avatar during registration (base64) |
| 11.6 | OTP verification | 6-digit code with 60-second resend countdown |
| 11.7 | Resend OTP | Countdown timer with resend button |
| 11.8 | Forgot password | Email input to request reset code |
| 11.9 | Reset password | OTP + new password with resend countdown |
| 11.10 | 7-digit password requirement | Password validation (minimum 6 characters) |
| 11.11 | Autofill prevention | Hidden dummy inputs to prevent browser autofill confusion |
| 11.12 | Split-screen layout | Auth pages use split-screen design |
| 11.13 | Toast notifications | Success/error feedback on all auth actions |
| 11.14 | Token persistence | JWT stored in localStorage |

---

## 12. User Profile Dashboard (5 Tabs)

### 12.1 Dashboard Tab
| # | Feature | Description |
|---|---|---|
| 12.1.1 | Welcome card | Greeting with user name and profile photo |
| 12.1.2 | Profile photo upload | Click-to-upload profile image (base64) |
| 12.1.3 | Order stats | Total orders, pending orders, completed orders |
| 12.1.4 | Account info | Name, email, phone display |
| 12.1.5 | Shipping address | Current shipping address display |
| 12.1.6 | Recent orders table | Last orders with status badges |

### 12.2 Orders Tab
| # | Feature | Description |
|---|---|---|
| 12.2.1 | Order history table | Full list of all customer orders |
| 12.2.2 | Status badges | Color-coded badges (Pending=amber, Processing=orange, Completed=green, Cancelled=red) |
| 12.2.3 | Click-to-expand | Order details expandable row |
| 12.2.4 | Send message | "Send Message" button for pending orders to contact support |

### 12.3 Support Chat Tab
| # | Feature | Description |
|---|---|---|
| 12.3.1 | WhatsApp-style interface | Chat layout with message bubbles |
| 12.3.2 | Create new tickets | Input to create new support tickets |
| 12.3.3 | Send messages | Text input with send button |
| 12.3.4 | File attachments | Attach files/images to messages |
| 12.3.5 | Edit messages | Edit sent messages (before admin replies) |
| 12.3.6 | Delete messages | Delete sent messages |
| 12.3.7 | Real-time polling | Message refresh every 5 seconds when chat tab is active |
| 12.3.8 | Unread reply counter | Badge showing number of unread admin replies |
| 12.3.9 | Chat search | Search within chat messages |
| 12.3.10 | Message timestamps | Time display on each message |

### 12.4 Wishlist Tab
| # | Feature | Description |
|---|---|---|
| 12.4.1 | Wishlist grid | Display of favorited products |
| 12.4.2 | Empty state | Designed empty state with CTA |
| 12.4.3 | Add to cart from wishlist | SmartProductCard with add-to-cart functionality |

### 12.5 Settings Tab
| # | Feature | Description |
|---|---|---|
| 12.5.1 | Profile editing | Edit display name, full name, phone, address |
| 12.5.2 | Email read-only | Email field is displayed but not editable |
| 12.5.3 | Password change | Current password + new password (7-digit requirement) |
| 12.5.4 | Profile photo upload | Upload/change profile image |
| 12.5.5 | Local AR/EN toggle | Language toggle within settings |

---

## 13. Wishlist System

| # | Feature | Description |
|---|---|---|
| 13.1 | Toggle favorite | Add/remove product from favorites via heart icon |
| 13.2 | Backend persistence | Favorites synced to backend via /favorites/toggle |
| 13.3 | Local fallback | Falls back to local state if backend unavailable |
| 13.4 | Header badge | Animated heart badge in header shows count |
| 13.5 | Wishlist page | Dedicated page showing all favorited products |
| 13.6 | Sound feedback | Audio feedback when toggling wishlist items |

---

## 14. Order Tracking

| # | Feature | Description |
|---|---|---|
| 14.1 | Order history | Complete list of all past orders |
| 14.2 | Status tracking | Visual status badges with color coding |
| 14.3 | Order details | Expandable view showing items, quantities, prices |
| 14.4 | Order status polling | Orders refreshed every 30 seconds |
| 14.5 | Support for order | "Send Message" for pending orders |

---

## 15. Dark Mode

| # | Feature | Description |
|---|---|---|
| 15.1 | System preference detection | Respects prefers-color-scheme: dark |
| 15.2 | Manual toggle | ThemeContext with localStorage persistence |
| 15.3 | Dark class toggle | Toggles dark class on document.documentElement |
| 15.4 | Persistent preference | Saves choice to localStorage (delora-theme) |

---

## 16. Bilingual / RTL Support

| # | Feature | Description |
|---|---|---|
| 16.1 | Arabic/English toggle | Switch between Arabic and English |
| 16.2 | RTL layout | Full right-to-left layout when Arabic is selected |
| 16.3 | LTR layout | Left-to-right layout when English is selected |
| 16.4 | Dynamic dir attribute | dir="rtl" or dir="ltr" applied to containers |
| 16.5 | Bilingual content | All text uses { ar: "...", en: "..." } objects |
| 16.6 | Fallback logic | Falls back to Arabic when English is not available |
| 16.7 | Conditional toggle | Language toggle only shown when admin enables isMultiLanguage |
| 16.8 | RTL arrow mirroring | Navigation arrows flip direction for RTL |
| 16.9 | RTL search icon | Search icon placement mirrors for RTL |

---

## 17. Animations & Transitions

| # | Feature | Description |
|---|---|---|
| 17.1 | Page transitions | AnimatePresence with opacity/y transforms on route changes |
| 17.2 | Staggered grid | Products fade-up with cascading delays |
| 17.3 | Modal pop-in | Custom modal-pop keyframe for add-to-cart modals |
| 17.4 | Badge pulse | Wishlist badge uses animate-ping for attention |
| 17.5 | Hero slider CSS | CSS transform sliding with cubic-bezier easing |
| 17.6 | Banner spring | Hanging announcement uses spring physics |
| 17.7 | Scroll-to-top/bottom | Floating buttons with scroll position detection (40% threshold) |

---

## 18. Footer

| # | Feature | Description |
|---|---|---|
| 18.1 | Store logo | Dynamic logo from admin settings |
| 18.2 | About text | Bilingual about text from admin settings |
| 18.3 | Contact information | Phone numbers, working hours, branch locations |
| 18.4 | Social media links | Facebook, Instagram, WhatsApp, Snapchat, TikTok, Twitter, Telegram |
| 18.5 | Social hover tooltips | Tooltips on social media icon hover |
| 18.6 | Branch locations | Interactive expandable location list |
| 18.7 | Copyright notice | Dynamic copyright text |

---

## 19. Error Handling & Resilience

| # | Feature | Description |
|---|---|---|
| 19.1 | 404 error page | Custom 404 page with contact modal |
| 19.2 | Contact modal on error | Shows phone numbers and WhatsApp links |
| 19.3 | Backend fallback | Hardcoded fallback data (52 products, 9 categories) when backend unavailable |
| 19.4 | Promise.allSettled | Parallel data fetching without blocking on single failure |
| 19.5 | Auto-refresh | 30-second polling cycle for all dynamic data |
| 19.6 | Empty state designs | Every page has a designed empty state with CTA |
| 19.7 | Error boundaries | Graceful degradation throughout the app |
| 19.8 | Silent error handling | API errors caught without breaking UI |

---

## 20. API Communication

| # | Feature | Description |
|---|---|---|
| 20.1 | Axios instance | Centralized apiClient with base URL configuration |
| 20.2 | Request interceptor | Auto-attaches Bearer token from localStorage |
| 20.3 | Response interceptor | Unwraps response.data, handles 401 (removes token) |
| 20.4 | 10-second timeout | Request timeout for API calls |
| 20.5 | Arabic error messages | Network failure shows Arabic error messages |
| 20.6 | Environment config | VITE_API_BASE_URL for different environments |

---

# ADMIN DASHBOARD — All Features

---

## 1. Authentication & Route Protection

| # | Feature | Description |
|---|---|---|
| 1.1 | Login page | Standalone page (no sidebar) with email + password |
| 1.2 | Remember me | Checkbox to persist login state |
| 1.3 | Password visibility toggle | Eye icon to show/hide password |
| 1.4 | Animated background | Floating circles animation on login page |
| 1.5 | Demo credentials display | Shows test credentials for development |
| 1.6 | Language toggle | EN/AR switch on login page |
| 1.7 | httpOnly cookie auth | JWT stored as httpOnly cookie (XSS-resistant) |
| 1.8 | Token restoration | Session restored from localStorage on mount |
| 1.9 | Protected routes | ProtectedRoute component checks auth + permissions |
| 1.10 | Forbidden page | Shown when user lacks required permissions |
| 1.11 | Auto-redirect | Unauthenticated users redirected to /login |
| 1.12 | Logout | Clears token and redirects to login |

---

## 2. Sidebar Navigation

| # | Feature | Description |
|---|---|---|
| 2.1 | Collapsible sidebar | Toggle button to expand/collapse sidebar |
| 2.2 | Active state styling | Green border + background on active route |
| 2.3 | Permission-filtered links | Only shows links user has permission to access |
| 2.4 | Complaint count badge | Badge on Complaints link showing pending count |
| 2.5 | Brand logo | Logo at top of sidebar |
| 2.6 | Responsive behavior | Sidebar collapses on mobile, full on desktop |
| 2.7 | NavLink routing | React Router NavLink for automatic active detection |

---

## 3. Topbar

| # | Feature | Description |
|---|---|---|
| 3.1 | Hamburger toggle | Toggle sidebar visibility on mobile |
| 3.2 | Profile menu | User avatar/name dropdown with logout |
| 3.3 | Language toggle | EN/AR language switch button |
| 3.4 | Dark mode toggle | Sun/moon icon toggle |
| 3.5 | Sticky position | Topbar remains fixed while scrolling |

---

## 4. Dashboard Overview

| # | Feature | Description |
|---|---|---|
| 4.1 | Welcome header | Greeting with user name and today's date |
| 4.2 | Multi-language toggle card | Enable/disable bilingual mode for storefront |
| 4.3 | Store overview section | Stats + charts layout |

### 4.3.1 Stat Cards (6 Cards)
| # | Feature | Description |
|---|---|---|
| 4.3.1.1 | Products count | Total products with icon |
| 4.3.1.2 | Orders count | Total orders with icon |
| 4.3.1.3 | Users count | Total customers with icon |
| 4.3.1.4 | Revenue | Total revenue in EGP with icon |
| 4.3.1.5 | Active deals | Number of active promotional deals |
| 4.3.1.6 | Complaints | Open complaints count with icon |
| 4.3.1.7 | Change badge | Trending up/down indicator with percentage |
| 4.3.1.8 | Hover animation | Cards animate on hover |

### 4.3.2 Charts
| # | Feature | Description |
|---|---|---|
| 4.3.2.1 | Revenue chart | Recharts AreaChart, green gradient fill, 6-month data, EGP tooltip |
| 4.3.2.2 | Orders chart | Recharts BarChart, green bars, 7-day data, total orders badge |

### 4.3.3 Store Health
| # | Feature | Description |
|---|---|---|
| 4.3.3.1 | Low stock products | Products with <=10 units, red alert triangle |
| 4.3.3.2 | Pending complaints | Count of open/replied tickets |
| 4.3.3.3 | Expiring deals | Deals ending within 3 days |

### 4.3.4 Orders Overview
| # | Feature | Description |
|---|---|---|
| 4.3.4.1 | Latest orders | 5 most recent orders with customer, total, status |
| 4.3.4.2 | Status badges | Color-coded status (Delivered/Pending/Cancelled) |

### 4.3.5 Inventory Section
| # | Feature | Description |
|---|---|---|
| 4.3.5.1 | Top products | Ranked best-sellers with trend %, units sold, revenue |
| 4.3.5.2 | Low stock products | Products with alert indicators |

### 4.3.6 Engagement Section
| # | Feature | Description |
|---|---|---|
| 4.3.6.1 | Quick actions | 2x2 grid: Add Product, Add Category, Create Deal, Add Admin |
| 4.3.6.2 | Active deals | Deal cards with banner image, discount info, status |
| 4.3.6.3 | Recent activity | Data-driven activity feed with timeAgo helper |

---

## 5. Product Management

| # | Feature | Description |
|---|---|---|
| 5.1 | Product grid | Display all products in card layout |
| 5.2 | Category sidebar filter | Filter products by category |
| 5.3 | Text search | Search across product names |
| 5.4 | Stock filter | Filter by stock level (unit-aware: piece/kg/gram) |
| 5.5 | Price filter | Filter by price range |
| 5.6 | Add product form | Full form with all product fields |
| 5.7 | Edit product form | Pre-filled form for editing |
| 5.8 | Image upload | Single product image upload via uploadService |
| 5.9 | Gallery images | Multiple gallery image upload |
| 5.10 | Bilingual fields | name_ar, name_en, description_ar, description_en |
| 5.11 | Unit type selection | Quantity or Weight |
| 5.12 | Offer/discount fields | discount_price, offer_start_at, offer_end_at, offer_stock |
| 5.13 | SKU auto-generation | Auto-generated SKU if not provided |
| 5.14 | Barcode field | Optional barcode input |
| 5.15 | Delete confirmation | Modal confirmation before deletion |
| 5.16 | Soft-delete handling | Products with orders are deactivated, not deleted |
| 5.17 | Restore product | Restore soft-deleted products |
| 5.18 | Stock management | Edit available quantity and min stock level |
| 5.19 | React Query caching | 5-minute stale time, background refetch |

---

## 6. Category Management

| # | Feature | Description |
|---|---|---|
| 6.1 | Category grid | Display all categories in card layout |
| 6.2 | Image upload | Category banner image upload |
| 6.3 | Bilingual names | name_ar and name_en fields |
| 6.4 | Active/Hidden toggle | Toggle category visibility |
| 6.5 | Add category form | Create new category |
| 6.6 | Edit category form | Edit existing category |
| 6.7 | Delete with confirmation | Modal confirmation before deletion |
| 6.8 | Search filter | Search categories by name |
| 6.9 | Status filter | Filter by Active/Hidden status |
| 6.10 | Statistics cards | Total, Active, Hidden counts |

---

## 7. Order Management

| # | Feature | Description |
|---|---|---|
| 7.1 | Orders table | All orders with customer info, total, status |
| 7.2 | Status filter chips | Pending, Processing, Shipped, Delivered, Canceled filters |
| 7.3 | Text search | Search by order ID, customer name, or phone |
| 7.4 | Animated list | Framer Motion animations on list items |
| 7.5 | Order detail view | Click to see full order details |
| 7.6 | Customer info | Name, email, phone, address display |
| 7.7 | Payment details | Method, transaction ID, receipt image |
| 7.8 | Ordered products | Products with images, prices, quantities |
| 7.9 | Status dropdown | Change order status via PATCH API |
| 7.10 | Print button | Print order details |
| 7.11 | WhatsApp link | Direct link to WhatsApp conversation with customer |
| 7.12 | Complaint chat link | Link to related support chat if exists |
| 7.13 | Pending notification | Banner if customer has unreplied messages |

---

## 8. User (Customer) Management

| # | Feature | Description |
|---|---|---|
| 8.1 | Users table | All customers with name, email, phone, status |
| 8.2 | Search | Search by name, email, or phone |
| 8.3 | Status filter | Active/Blocked filter |
| 8.4 | Top N filter | Best customers sorted by total spent |
| 8.5 | Statistics cards | Total, Active, Blocked counts |
| 8.6 | Bulk select | Checkboxes for multiple user selection |
| 8.7 | Promotional message | Broadcast modal to send message to selected users |
| 8.8 | Add user form | Create new customer account |
| 8.9 | Edit user form | Edit customer details |
| 8.10 | Delete user | Remove customer with cascading cleanup |
| 8.11 | Block/Unblock toggle | Toggle user active status |
| 8.12 | Order stats per user | Total orders and total spent computed per user |

---

## 9. Team Management

| # | Feature | Description |
|---|---|---|
| 9.1 | Owner display | System Owner shown at top (blurred for non-owners) |
| 9.2 | Team member cards | Avatar, name, role, permission badges |
| 9.3 | Add team member | Full form: photo, name, email, phone, job title, salary, status, permissions |
| 9.4 | Edit team member | Pre-filled form for editing |
| 9.5 | Delete team member | Remove with confirmation |
| 9.6 | Toggle status | Enable/disable team member |
| 9.7 | Password reset | Reset member password (never revealed) |
| 9.8 | Permission badges | Visual badges showing assigned permissions |
| 9.9 | Owner password gate | Sensitive actions require owner password verification |
| 9.10 | PasswordConfirmModal | Modal for owner password entry |

### 9.10.1 Permission Matrix Editor
| # | Feature | Description |
|---|---|---|
| 9.10.1.1 | 14 resources | Dashboard, Products, Categories, Orders, Users, Deals, Complaints, Team, Hero Slider, Footer, Payment Methods, Announcements, Best Products, Inventory |
| 9.10.1.2 | 5 actions per resource | View, Add, Edit, Delete, Manage Permissions |
| 9.10.1.3 | Checkbox grid | Per-resource, per-action checkboxes |
| 9.10.1.4 | Select All button | Enable all permissions at once |
| 9.10.1.5 | Remove All button | Disable all permissions at once |
| 9.10.1.6 | Owner lock | Owner's permissions are locked and non-editable |

---

## 10. Deals / Promotions Management

| # | Feature | Description |
|---|---|---|
| 10.1 | Deals list | Table with banner, title, discount, dates, status |
| 10.2 | Statistics cards | Active, Scheduled, Expired, Total counts |
| 10.3 | Status filter | Filter by deal status |
| 10.4 | Category filter | Filter deals by category |
| 10.5 | Add deal form | Title, discount type/value, banner, dates, category, products |
| 10.6 | Edit deal form | Pre-filled form for editing |
| 10.7 | Delete deal | Remove deal (clears offer fields, keeps product) |
| 10.8 | Play/Pause toggle | Enable/disable deal without deleting |
| 10.9 | Status badges | Active/Scheduled/Expired visual indicators |
| 10.10 | Date range display | Start and end date display |

---

## 11. Hero Slider / Banner Management

| # | Feature | Description |
|---|---|---|
| 11.1 | Banner cards | Display all banners with images |
| 11.2 | Image upload | Banner image upload |
| 11.3 | Bilingual fields | title_ar, title_en, subtitle_ar, subtitle_en, button_text_ar, button_text_en |
| 11.4 | Category linking | Link banner to a category |
| 11.5 | Product linking | Link banner to a product |
| 11.6 | Priority reorder | Up/down arrows to change display order |
| 11.7 | Active/Hidden toggle | Toggle banner visibility |
| 11.8 | Add banner form | Create new banner |
| 11.9 | Edit banner form | Edit existing banner |
| 11.10 | Delete banner | Remove with confirmation |
| 11.11 | Custom category filter | Filter banners by linked category |

---

## 12. Footer Settings

| # | Feature | Description |
|---|---|---|
| 12.1 | 4-tab interface | Identity, Contact, Locations, Social Media |
| 12.2 | Identity tab | Logo upload, bilingual "about" text |
| 12.3 | Contact tab | Working hours, phone numbers |
| 12.4 | Locations tab | Branch management with Google Maps links |
| 12.5 | Social Media tab | Facebook, Instagram, WhatsApp, Snapchat, TikTok, X, Telegram |
| 12.6 | Floating save bar | Save button appears when changes are made |
| 12.7 | Single-document CRUD | GET/PUT pattern for settings |

---

## 13. Announcement Banner

| # | Feature | Description |
|---|---|---|
| 13.1 | Announcement form | Title, message, colors, duration |
| 13.2 | Color customization | Background, text, and title color pickers |
| 13.3 | Duration config | Hours, minutes, seconds input |
| 13.4 | Live preview | Real-time preview of announcement appearance |
| 13.5 | Countdown timer | Shows remaining time for current announcement |
| 13.6 | Enable/Disable toggle | Turn announcement on/off |
| 13.7 | Clear button | Remove all active announcements |
| 13.8 | Bilingual content | Arabic and English title/message |

---

## 14. Payment Method Configuration

| # | Feature | Description |
|---|---|---|
| 14.1 | Card-based grid | Payment methods displayed as cards |
| 14.2 | Add payment method | Full form with all fields |
| 14.3 | Edit payment method | Pre-filled form for editing |
| 14.4 | Delete payment method | Remove with confirmation |
| 14.5 | Logo upload | Payment method logo |
| 14.6 | Brand color picker | Custom color for each method |
| 14.7 | Type selection | Online or Offline |
| 14.8 | Receiver info | Name and number for offline transfers |
| 14.9 | QR code URL | QR code image for mobile wallets |
| 14.10 | Require screenshot | Toggle for screenshot requirement |
| 14.11 | Require transaction ID | Toggle for transaction ID requirement |
| 14.12 | Set as default | Mark as default payment method |
| 14.13 | Priority ordering | Change display priority |
| 14.14 | Active/Hidden toggle | Toggle payment method visibility |

---

## 15. Customer Support (Complaints)

| # | Feature | Description |
|---|---|---|
| 15.1 | Split-pane layout | Left sidebar + right chat pane |
| 15.2 | Conversation list | Searchable list of all tickets |
| 15.3 | Status filter pills | All, Pending, Replied, Closed filters |
| 15.4 | Unread badges | Badge per conversation showing unread count |
| 15.5 | New chat button | Start proactive message to customer |
| 15.6 | Chat messages | Admin/user bubbles with different styling |
| 15.7 | File attachments | View images, videos, documents in chat |
| 15.8 | Message editing | Edit admin messages within 5-minute window |
| 15.9 | Message deletion | Soft-delete with "[deleted]" placeholder |
| 15.10 | Status dropdown | Change ticket status (OPEN/REPLIED/CLOSED) |
| 15.11 | Auto-refresh | 15-second polling for new messages |
| 15.12 | Deep-linking | URL params (?orderId=, ?ticketId=) for direct navigation |
| 15.13 | Complaint stats | Count by status (All, Pending, Replied, Closed) |

---

## 16. Best Products Analytics

| # | Feature | Description |
|---|---|---|
| 16.1 | Paginated table | Server-side paginated best-sellers list |
| 16.2 | Rank column | Product ranking by units sold |
| 16.3 | Search | Search by product name |
| 16.4 | Category filter | Filter by product category |
| 16.5 | Configurable "Top N" | Set how many top products to display |
| 16.6 | Revenue column | Total revenue per product in EGP |
| 16.7 | Percentage change | Trend indicator (up/down) |
| 16.8 | Auto-refresh | Background refetch every 30 seconds |

---

## 17. Inventory Management

| # | Feature | Description |
|---|---|---|
| 17.1 | Batch receiving | Record new inventory batch receipt |
| 17.2 | Batch number | Optional batch identifier |
| 17.3 | Quantity received | Number of units added |
| 17.4 | Expiry date | Optional expiry tracking |
| 17.5 | Auto stock update | Stock quantity auto-incremented on batch receipt |
| 17.6 | Batch history | View all received batches with product info |
| 17.7 | Stock levels | Current available quantity per product |

---

## 18. Settings

| # | Feature | Description |
|---|---|---|
| 18.1 | Avatar upload | Profile photo upload |
| 18.2 | Full name edit | Edit display name |
| 18.3 | Job title | Display job title |
| 18.4 | Email display | Email shown but not editable |
| 18.5 | Phone edit | Edit phone number |
| 18.6 | Password reset | New password (never reveals current) |
| 18.7 | Bio | Optional bio text |
| 18.8 | Owner verification | Non-owner saves require owner password |

---

## 19. State Management & Data Fetching

| # | Feature | Description |
|---|---|---|
| 19.1 | TanStack React Query | Server-state management with caching |
| 19.2 | 5-minute stale time | Data considered fresh for 5 minutes |
| 19.3 | 1 retry | Failed requests retried once |
| 19.4 | 13 custom hooks | useProducts, useOrders, useCategories, useTeam, useDeals, useBestProducts, useComplaints, useHeroSlider, useFooter, usePaymentMethods, useDashboard, useDashboardState, usePermission |
| 19.5 | 14 API service modules | Centralized API calls per domain |
| 19.6 | Optimistic updates | UI updates before server confirmation |
| 19.7 | Toast notifications | Success/error feedback on all mutations |
| 19.8 | Loading skeletons | Skeleton UI during data loading |
| 19.9 | Error states | Error display with retry options |
| 19.10 | Empty states | Designed empty states for all lists |

---

## 20. Bilingual / i18n System

| # | Feature | Description |
|---|---|---|
| 20.1 | Translation dictionaries | en.js and ar.js with ~476 keys each |
| 20.2 | t() function | Translation lookup via LanguageContext |
| 20.3 | Language persistence | Saved to localStorage |
| 20.4 | HTML dir attribute | Automatic RTL/LTR on document root |
| 20.5 | Context provider | LanguageProvider wraps entire app |
| 20.6 | Toggle button | EN/AR switch in topbar and login page |

---

## 21. Theme System

| # | Feature | Description |
|---|---|---|
| 21.1 | Dark mode | Toggle dark class on html element |
| 21.2 | Persistence | Saved to localStorage |
| 21.3 | Toggle button | Sun/moon icon in topbar |

---

## 22. Layout & Responsive Design

| # | Feature | Description |
|---|---|---|
| 22.1 | Collapsible sidebar | Sidebar expand/collapse |
| 22.2 | Sticky topbar | Fixed top navigation |
| 22.3 | Main content area | Scrollable content with max-width |
| 22.4 | Mobile responsive | Full responsive from mobile to desktop |
| 22.5 | Scroll to top | Auto-scroll on route change |
| 22.6 | Permission-based rendering | HasPermission component hides/disables elements |

---

## 23. Data & Permissions

| # | Feature | Description |
|---|---|---|
| 23.1 | AuthContext | Centralized auth state (user, token, loading) |
| 23.2 | can() function | Check if user has specific permission |
| 23.3 | hasPermission(id) | Check specific permission by ID |
| 23.4 | isOwner | Boolean for owner-specific features |
| 23.5 | isAdmin | Boolean for admin check |
| 23.6 | Permissions array | Flat array of {resource, actions[]} |
| 23.7 | Owner bypass | Owner automatically has all permissions |
| 23.8 | ProtectedRoute | Route wrapper checking auth + permission |
| 23.9 | HasPermission | Component wrapper for conditional rendering |
| 23.10 | Route config | Centralized routesData with permission IDs |

---

## 24. Quick Actions & Navigation

| # | Feature | Description |
|---|---|---|
| 24.1 | Add Product shortcut | Links to /products/add or /products |
| 24.2 | Add Category shortcut | Links to /add-category |
| 24.3 | Create Deal shortcut | Links to /deals/add |
| 24.4 | Add Admin shortcut | Links to /team/add |
| 24.5 | Scroll to top | Auto-scroll on route change |

---

*Total Storefront Features: ~150+*
*Total Dashboard Features: ~180+*
*Grand Total: ~330+ distinct features across both applications*
