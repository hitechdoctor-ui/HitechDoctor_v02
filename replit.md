# HiTech Doctor - Tech Repair & E-Commerce Platform

## Overview

HiTech Doctor is a Greek-language tech repair shop and e-commerce platform. It provides:

- **Public storefront**: Home page, services showcase, product shop (eShop), and checkout flow
- **Admin panel**: Dashboard, product management, order management, and customer management
- **Shopping cart**: Persistent cart using Zustand with localStorage
- **Order processing**: Full checkout flow creating customers and orders in the database

The app is designed for a Greek tech repair business offering mobile/tablet repairs, IT support, networking services, and data recovery, alongside an online store for accessories and parts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Structure

The project uses a **monorepo layout** with three main areas:

- `client/` — React frontend (Vite, TypeScript)
- `server/` — Express backend (Node.js, TypeScript)
- `shared/` — Shared types, DB schema, and route definitions used by both client and server

This shared layer prevents duplication and keeps API contracts in sync between frontend and backend.

### Frontend Architecture

- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight alternative to React Router) — note: Wouter `<Link>` must NOT wrap `<a>` tags directly
- **State Management**: Zustand with `persist` middleware for the shopping cart (survives page refresh via localStorage)
- **Server State**: TanStack React Query for all API data fetching, mutations, and cache invalidation
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom dark "high-tech" theme (deep navy background, vibrant cyan primary color)
- **Fonts**: Inter (body) and Outfit (display/headings), loaded from Google Fonts
- **SEO**: react-helmet-async for dynamic `<head>` management per page
- **Forms**: react-hook-form with Zod resolvers for validation

### Backend Architecture

- **Framework**: Express 5 (with TypeScript via tsx in dev)
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage layer**: `DatabaseStorage` class implementing the `IStorage` interface (defined in `server/storage.ts`) — all DB access goes through this interface
- **Routes**: Registered in `server/routes.ts`, paths/schemas defined in `shared/routes.ts`
- **Dev server**: Vite middleware is integrated into the Express server in development for HMR
- **Production build**: esbuild bundles the server; Vite builds the client into `dist/public/`

### Shared API Contract (`shared/routes.ts`)

A centralized `api` object defines every endpoint's method, path, Zod input schema, and response schemas. Both the server (for validation) and client hooks (for typed fetching and response parsing) consume this same object. A `buildUrl()` helper handles path param substitution.

### Database Schema (`shared/schema.ts`)

Four tables in PostgreSQL via Drizzle:

| Table | Purpose |
|---|---|
| `products` | Items for sale (name, description, price, category, subcategory, imageUrl, compatibleModels) |
| `customers` | Customer records created at checkout |
| `orders` | Order records linked to a customer, with status and total |
| `order_items` | Line items linking orders to products with quantity and price snapshot |

`products` has two extra columns:
- `subcategory` (text, nullable): e.g. `screen-protectors`, `cases`, `chargers`
- `compatible_models` (text[], nullable): list of device models the product fits (e.g. all iPhone 8–17 variants for screen protectors)

Zod schemas are auto-generated from the Drizzle table definitions using `drizzle-zod`.

### Routing (Pages)

**Public routes:**
- `/` — Home (hero, services overview)
- `/services` — Detailed services page (10 service cards; each can link to a dedicated subpage)
- `/services/episkeui-kiniton` — Dedicated mobile repair page with 5 brand cards (iPhone, Samsung, Xiaomi, Huawei, OnePlus) + "Άλλη Μάρκα" CTA
- `/eshop` — Product catalog with category filtering
- `/checkout` — Cart checkout form

**Admin routes (no auth guard currently):**
- `/admin` — Dashboard
- `/admin/products` — CRUD for products
- `/admin/orders` — View and update order status
- `/admin/customers` — View customer list

### Cart Flow

1. User browses eShop → clicks "Add to cart" → Zustand store updates
2. Cart drawer slides in (Sheet component) showing items
3. User goes to `/checkout`, fills in name/email/phone/address
4. On submit, `useCheckout` mutation POSTs to `/api/orders/create` with customer info + cart items
5. Server creates/finds customer, creates order + order items in a transaction
6. Cart is cleared on success

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection via `DATABASE_URL` environment variable
- **Drizzle ORM** — Schema definition and query builder
- **connect-pg-simple** — Listed as dependency (session store capability if sessions are added)

### UI & Styling
- **Radix UI** — Headless accessible component primitives (full suite installed)
- **shadcn/ui** — Component library layered on Radix (New York style variant)
- **Tailwind CSS** — Utility-first CSS with custom dark theme CSS variables
- **Recharts** — Charting library (available via `chart.tsx` component)
- **Embla Carousel** — Carousel component
- **Vaul** — Drawer component
- **Lucide React** — Icon set
- **cmdk** — Command palette component

### Forms & Validation
- **react-hook-form** — Form state management
- **@hookform/resolvers** — Zod integration for form validation
- **Zod** — Schema validation used on both client and server

### Data Fetching
- **TanStack React Query v5** — Server state, caching, and mutations

### State Management
- **Zustand** — Client state (shopping cart), persisted to localStorage

### SEO
- **react-helmet-async** — Dynamic document head management

### Build & Dev Tools
- **Vite** — Frontend dev server and bundler
- **esbuild** — Server bundler for production
- **tsx** — TypeScript execution for dev server
- **@replit/vite-plugin-runtime-error-modal** — Dev error overlay
- **@replit/vite-plugin-cartographer** and **@replit/vite-plugin-dev-banner** — Replit-specific dev plugins (only active in Replit environment)

### Google Fonts
- Architects Daughter, DM Sans, Fira Code, Geist Mono, Inter, Outfit — loaded in `client/index.html`

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (mandatory; app throws on startup without it)