# DineFlow — Supabase Database Schema

> Generated from the actual DineFlow Supabase database inspection on 2026-08-30.
> This file is intended to give Claude accurate database context.
>
> IMPORTANT: Treat the actual Supabase database and this document as authoritative over guesses or conventional naming.

## 1. Database Overview

The application uses these application-level tables in the `public` schema:

- `Category`
- `Food`
- `Order`
- `OrderItem`
- `RestaurantSettings`
- `User`
- `Account`
- `Session`
- `VerificationToken`

The restaurant/application tables are primarily:

`Category` → `Food` → `OrderItem` → `Order`

with:

`User` → `Order`

and:

`RestaurantSettings`

## 2. Important Naming Rules

The database uses **PascalCase table names** and **camelCase column names**.

Examples:

- `Category`, NOT `categories`
- `Food`, NOT `foods`
- `Order`, NOT `orders`
- `OrderItem`, NOT `order_items`
- `RestaurantSettings`, NOT `restaurant_settings`
- `categoryId`, NOT `category_id`
- `createdAt`, NOT `created_at`
- `orderNumber`, NOT `order_number`

Do NOT invent snake_case table or column names.

When writing Supabase queries, use the exact table/column names from this document.

## 3. Category

Table: `Category`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| name | text | NO | none |
| slug | text | NO | none |
| description | text | YES | null |
| image | text | YES | null |
| isActive | boolean | NO | true |
| createdAt | timestamp without time zone | NO | CURRENT_TIMESTAMP |
| updatedAt | timestamp without time zone | NO | null |

Primary key:

- `Category.id`

Referenced by:

- `Food.categoryId` → `Category.id`

## 4. Food

Table: `Food`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| name | text | NO | none |
| slug | text | NO | none |
| description | text | NO | none |
| price | integer | NO | none |
| image | text | YES | null |
| rating | double precision | NO | 4.5 |
| reviewCount | integer | NO | 0 |
| prepTimeMinutes | integer | NO | none |
| ingredients | ARRAY | YES | null |
| isAvailable | boolean | NO | true |
| isPopular | boolean | NO | false |
| isFeatured | boolean | NO | false |
| categoryId | text | NO | none |
| createdAt | timestamp without time zone | NO | CURRENT_TIMESTAMP |
| updatedAt | timestamp without time zone | NO | null |

Primary key:

- `Food.id`

Foreign key:

- `Food.categoryId` → `Category.id`

Important:

- `price` is an integer.
- `ingredients` is a PostgreSQL array type.
- `categoryId` is required.
- `isAvailable`, `isPopular`, and `isFeatured` have database defaults.

## 5. Order

Table: `Order`

Use the exact table name `Order`.

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| orderNumber | text | NO | none |
| userId | text | YES | null |
| fullName | text | NO | none |
| email | text | NO | none |
| phone | text | NO | none |
| orderType | USER-DEFINED (`OrderType`) | NO | none |
| address | text | YES | null |
| city | text | YES | null |
| postalCode | text | YES | null |
| paymentMethod | USER-DEFINED (`PaymentMethod`) | NO | none |
| paymentStatus | USER-DEFINED (`PaymentStatus`) | NO | PENDING |
| status | USER-DEFINED (`OrderStatus`) | NO | PLACED |
| subtotal | integer | NO | none |
| deliveryFee | integer | NO | none |
| total | integer | NO | none |
| estimatedReadyMinutes | integer | NO | none |
| createdAt | timestamp without time zone | NO | CURRENT_TIMESTAMP |
| updatedAt | timestamp without time zone | NO | null |

Primary key:

- `Order.id`

Foreign key:

- `Order.userId` → `User.id`

Important:

- `userId` is nullable, so an order can exist without a linked user.
- `paymentStatus` defaults to `PENDING`.
- `status` defaults to `PLACED`.
- Monetary fields are stored as integers.
- Do not assume decimal/numeric money fields.
- Delivery-specific fields such as `address`, `city`, and `postalCode` are nullable.

## 6. OrderItem

Table: `OrderItem`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| name | text | NO | none |
| price | integer | NO | none |
| quantity | integer | NO | none |
| image | text | YES | null |
| orderId | text | NO | none |
| foodId | text | YES | null |

Primary key:

- `OrderItem.id`

Foreign keys:

- `OrderItem.orderId` → `Order.id`
- `OrderItem.foodId` → `Food.id`

Important:

- `orderId` is required.
- `foodId` is nullable.
- `name`, `price`, and `quantity` are stored directly on the order item, which preserves a snapshot of the purchased item data.
- Do not assume an order item must always have a current Food record.

## 7. RestaurantSettings

Table: `RestaurantSettings`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | `singleton` |
| name | text | NO | none |
| phone | text | NO | none |
| email | text | NO | none |
| address | text | NO | none |
| currency | text | NO | `BDT` |
| deliveryFee | integer | NO | 60 |
| minimumOrder | integer | NO | 200 |
| openingHours | jsonb | NO | none |
| updatedAt | timestamp without time zone | NO | null |

Primary key:

- `RestaurantSettings.id`

Important:

- The default ID is `singleton`.
- This appears to be a singleton settings record.
- Do not create multiple settings records unless the existing application/database design explicitly requires it.
- Currency defaults to `BDT`.
- `deliveryFee` defaults to `60`.
- `minimumOrder` defaults to `200`.
- `openingHours` is JSONB.

## 8. User

Table: `User`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| name | text | YES | null |
| email | text | YES | null |
| emailVerified | timestamp without time zone | YES | null |
| image | text | YES | null |
| password | text | YES | null |
| phone | text | YES | null |
| role | USER-DEFINED (`Role`) | NO | CUSTOMER |
| createdAt | timestamp without time zone | NO | CURRENT_TIMESTAMP |
| updatedAt | timestamp without time zone | NO | null |

Primary key:

- `User.id`

Used by:

- `Account.userId` → `User.id`
- `Session.userId` → `User.id`
- `Order.userId` → `User.id`

## 9. Account

Table: `Account`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| userId | text | NO | none |
| type | text | NO | none |
| provider | text | NO | none |
| providerAccountId | text | NO | none |
| refresh_token | text | YES | null |
| access_token | text | YES | null |
| expires_at | integer | YES | null |
| token_type | text | YES | null |
| scope | text | YES | null |
| id_token | text | YES | null |
| session_state | text | YES | null |

Primary key:

- `Account.id`

Foreign key:

- `Account.userId` → `User.id`

This appears to be an authentication/provider account table.

## 10. Session

Table: `Session`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| id | text | NO | none |
| sessionToken | text | NO | none |
| userId | text | NO | none |
| expires | timestamp without time zone | NO | none |

Primary key:

- `Session.id`

Foreign key:

- `Session.userId` → `User.id`

## 11. VerificationToken

Table: `VerificationToken`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| identifier | text | NO | none |
| token | text | NO | none |
| expires | timestamp without time zone | NO | none |

The inspection confirmed these three columns and NOT NULL constraints.

## 12. Enum Types

The application-specific enum values are:

### OrderStatus

```text
PLACED
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED
```

### OrderType

```text
DELIVERY
PICKUP
```

### PaymentMethod

```text
CARD
CASH
```

### PaymentStatus

```text
PAID
PENDING
FAILED
```

### Role

```text
CUSTOMER
ADMIN
```

There are also Supabase/PostgreSQL/system-related enum types in the database. They are not part of the DineFlow business logic and should not be used when implementing the restaurant APIs.

## 13. Relationships

The important application relationships are:

```text
Category
   │
   └──< Food
           │
           └──< OrderItem
                    │
                    └──> Order
                             │
                             └──> User (optional)
```

More explicitly:

```text
Food.categoryId
    → Category.id

OrderItem.orderId
    → Order.id

OrderItem.foodId
    → Food.id

Order.userId
    → User.id

Account.userId
    → User.id

Session.userId
    → User.id
```

## 14. Primary Keys

Confirmed primary keys:

```text
Account.id
Category.id
Food.id
Order.id
OrderItem.id
RestaurantSettings.id
Session.id
User.id
```

`VerificationToken` was inspected and has NOT NULL constraints on `identifier`, `token`, and `expires`. The query used for constraints did not expose a conventional named primary key for it, so do not invent one without inspecting the actual database definition.

## 15. RLS / Row Level Security

The inspection query against `pg_policies` returned:

```text
No rows returned
```

Therefore, there are currently **no rows in `pg_policies` for the `public` schema**.

Do not assume that existing application-specific RLS policies are present.

IMPORTANT SECURITY NOTE:

The absence of RLS policies does not mean the API should expose every operation to every client. API route authorization must still be designed carefully, especially for:

- admin food/category/settings mutations
- order status updates
- order listing
- authentication-related records

Before making security-sensitive changes, inspect the existing authentication/authorization architecture.

## 16. Current Database-Integration Goal

The current DineFlow task is to move the application from browser/localStorage persistence to real Supabase persistence.

Required APIs:

### Categories

```text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/[id]
DELETE /api/categories/[id]
```

### Foods

```text
GET    /api/foods
POST   /api/foods
PATCH  /api/foods/[id]
DELETE /api/foods/[id]
```

### Orders

```text
GET    /api/orders
POST   /api/orders
PATCH  /api/orders/[id]
```

### Restaurant Settings

```text
GET   /api/settings
PATCH /api/settings
```

## 17. Frontend Persistence Goal

`CatalogContext` should use API calls for:

- loading categories
- creating categories
- editing categories
- deleting categories
- loading foods
- creating foods
- editing foods
- deleting foods

`OrderContext` should use API calls for:

- submitting customer orders
- fetching orders where required by the existing architecture
- updating order status for admin functionality

Restaurant settings should use API calls for:

- loading settings
- saving settings

The browser may continue to store a temporary shopping cart if that is intentional.

However, localStorage must NOT remain the source of truth for:

- categories
- foods
- submitted orders
- restaurant settings

## 18. Developer Rules for Claude

When modifying this project:

1. Inspect the existing source code before changing it.
2. Use the actual schema above.
3. Do not rename database tables to conventional lowercase names.
4. Do not invent columns.
5. Do not change database types without explicit reason.
6. Reuse the existing Supabase client/server utilities.
7. Do not create a second Supabase configuration.
8. Do not expose environment secrets.
9. Do not print `.env.local` values.
10. Do not redesign the UI during database integration.
11. Preserve existing frontend data structures where practical.
12. Add loading and error states for network operations.
13. Validate API input.
14. Handle Supabase/database errors cleanly.
15. Do not claim a test passed unless it was actually performed.
16. Before destructive database operations, inspect dependencies and obtain explicit confirmation.
17. For order creation, do not blindly trust client-provided prices if authoritative Food records can be used to validate/recalculate pricing.
18. Remember that `OrderItem` intentionally stores `name`, `price`, and `image` as order-time data.

## 19. Important Caveat

This document was generated from database metadata queries rather than a full `supabase db dump`.

Therefore, it intentionally documents the confirmed:

- tables
- columns
- data types
- defaults
- nullability
- primary keys reported by the inspection
- foreign keys
- application enum values
- RLS policy result

It does NOT attempt to invent undocumented:

- indexes
- triggers
- functions
- views
- storage policies
- exact `ON DELETE` / `ON UPDATE` actions
- unique constraints not exposed by the inspection
- check constraint expressions

If any of those become relevant to implementation, inspect the live Supabase database before making assumptions.
