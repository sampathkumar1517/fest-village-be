# Village Festival Manager — Backend

NestJS + TypeORM + PostgreSQL API for the Village Festival Manager app.

## Stack

- NestJS 11
- TypeORM 0.3
- PostgreSQL
- JWT auth (`@nestjs/jwt` + Passport)
- class-validator

## Setup

1. Copy env file and edit credentials:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Ensure PostgreSQL is running and matches `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default `3000`) |
| `JWT_SECRET` | JWT signing secret |
| `DB_HOST` | Postgres host |
| `DB_PORT` | Postgres port |
| `DB_USER` | Postgres user |
| `DB_PASSWORD` | Postgres password |
| `DB_NAME` | Database name |
| `DB_SYNC` | `true` to auto-sync schema (dev only) |

4. Apply schema:

- **Dev (recommended locally):** set `DB_SYNC=true` in `.env` and start the app (entities sync automatically). Categories are seeded on boot.
- **Manual SQL:** run [`src/database/migrations/001-align-reference-schema.sql`](src/database/migrations/001-align-reference-schema.sql) when `DB_SYNC=false`.

5. Start:

```bash
npm run start:dev
```

API: `http://localhost:3000`

## Core API

Unified success shape: `{ success, message, data }`.

### Festivals

| Method | Path | Description |
|--------|------|-------------|
| POST | `/festival` or `/festival/create-festival` | Create festival |
| GET | `/festival` | List festivals |
| GET | `/festival/:id` | Get one |
| GET | `/festival/:id/summary` | Totals for analytics |
| PATCH | `/festival/:id` | Update |
| DELETE | `/festival/:id` | Soft delete |

### Collections (family payments)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/collections` | Record payment (`familyName`, `mobileNumber`, `paidAmount`, `paymentType`: Cash/Online/Cheque, `collectorName`) |
| GET | `/collections/festival/:festivalId` | List by festival |
| DELETE | `/collections/:id` | Soft delete |

### Expenses

| Method | Path | Description |
|--------|------|-------------|
| POST | `/expenses` | Create (`festivalId`, `category` string, `description`, `amount`) |
| GET | `/expenses/festival/:festivalId` | List by festival |
| DELETE | `/expenses/:id` | Soft delete |
| GET | `/expenses/categories/all` | Seeded categories |

### Feedback

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback` | `{ rating: 1-5, comment }` |
| GET | `/feedback` | List |
| DELETE | `/feedback/:id` | Delete |

### Auth / Users (extra)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with password |
| POST | `/auth/login` | Login → JWT |
| POST | `/users/create-user` | Create family member (no login password) |
| GET | `/users` | List users |
| GET | `/users/phone-number/:phone` | Lookup by phone |
| GET/PATCH/DELETE | `/users/:id` | CRUD |

## Database ERD

```
Festival 1──* PaymentDetail (collections)
Festival 1──* Expense
User     1──* PaymentDetail (optional / legacy)
Feedback (app-level ratings)
ExpenseCategory (seeded lookup)
```

**Collection rule:** `totalAmount` is copied from festival `amountPerFamily` at insert. Balance = `totalAmount - paidAmount`.

## Testing

```bash
# Health
curl http://localhost:3000/

# Create festival
curl -X POST http://localhost:3000/festival -H "Content-Type: application/json" -d "{\"festivalName\":\"Test\",\"amountPerFamily\":1000,\"collectionStartDate\":\"2026-03-01\",\"festivalEndDate\":\"2026-03-10\",\"organizerName\":\"A\",\"InchargeName\":\"B\"}"
```

## Build

```bash
npm run build
npm run start:prod
```
