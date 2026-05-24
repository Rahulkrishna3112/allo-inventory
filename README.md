# Allo Inventory — Stock Reservation System

A full-stack Next.js application that solves the e-commerce inventory reservation problem — ensuring only one user can reserve the last item in stock at a time.

## 🔗 Live Demo
[Coming soon after deployment]

## 🚀 Features
- Real-time inventory tracking across multiple warehouses
- 10-minute reservation hold with live countdown timer
- Concurrency-safe reservations using Redis distributed locking
- Auto-expiry — stock automatically released if not purchased in time
- Confirm or cancel reservations

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma 7 |
| Cache/Lock | Upstash Redis |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |

## 🗄 Database Schema
- **Product** — product details (name, price, description)
- **Warehouse** — warehouse locations
- **Stock** — stock levels per product per warehouse (total vs reserved)
- **Reservation** — reservation records with status (pending/confirmed/released) and expiry time

## 🔌 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products with stock |
| GET | `/api/warehouses` | List all warehouses |
| POST | `/api/reservations` | Create a 10-min reservation |
| POST | `/api/reservations/:id/confirm` | Confirm purchase |
| POST | `/api/reservations/:id/release` | Cancel reservation |

## ⚡ Concurrency Handling
The core challenge — two users buying the last item simultaneously — is solved using a **Redis distributed lock**:
1. When a user clicks Reserve, a Redis lock is acquired for that product
2. Stock availability is checked and reservation is created atomically
3. Lock is released immediately after
4. If another request comes in while locked, it gets a 409 error and is asked to retry

## 🏃 Running Locally

1. Clone the repo
```bash
git clone https://github.com/Rahulkrishna3112/allo-inventory.git
cd allo-inventory
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables in `.env`
```env
DATABASE_URL="your-supabase-url"
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Seed the database
```bash
npx ts-node --esm prisma/seed.ts
```

6. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
