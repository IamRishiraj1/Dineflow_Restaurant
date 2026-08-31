# DineFlow — Project Context

## Overview
DineFlow is an existing restaurant ordering and management web application.

Live application:
https://dineflow-restaurant-two.vercel.app

Do not treat the live URL as the source code. Use it as a visual/reference point; use the repository for implementation.

## Current Objective
Connect the existing application to the real Supabase database.

The database must become the source of truth so that admin edits and submitted customer orders persist across refreshes and browsers.

## Technology
The project uses a Next.js/React/TypeScript architecture with Supabase and Vercel. Confirm exact versions and folder structure from the repository.

## Main Application Areas
Customer:
- menu/category browsing
- food details/customization where already implemented
- cart
- checkout/order submission
- restaurant information

Admin:
- food management
- category management
- order management
- restaurant settings

Preserve the current UI during the database migration.

## Database Model
Main relationship:

Category
  └──< Food
          └──< OrderItem
                  └──> Order
                          └──> User (optional)

Authentication relationships:
User
  ├──< Account
  ├──< Session
  └──< Order

Settings:
RestaurantSettings

See `supabase-schema.md` for the inspected schema.

## Important Tables
- `Category`
- `Food`
- `Order`
- `OrderItem`
- `RestaurantSettings`
- `User`
- `Account`
- `Session`
- `VerificationToken`

## Important Relationships
- `Food.categoryId` → `Category.id`
- `OrderItem.orderId` → `Order.id`
- `OrderItem.foodId` → `Food.id`
- `Order.userId` → `User.id`
- `Account.userId` → `User.id`
- `Session.userId` → `User.id`

`Order.userId` and `OrderItem.foodId` are nullable.

`OrderItem` stores its own `name`, `price`, `quantity`, and `image` as order-time data.

`RestaurantSettings` is intended as a singleton-style record.

## Enum Values
OrderStatus:
`PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`

OrderType:
`DELIVERY`, `PICKUP`

PaymentMethod:
`CARD`, `CASH`

PaymentStatus:
`PAID`, `PENDING`, `FAILED`

Role:
`CUSTOMER`, `ADMIN`

Do not invent alternative values.

## Persistence Architecture
Desired flow:

UI
→ React Context/components
→ Next.js API routes
→ Supabase
→ PostgreSQL

CatalogContext should use `/api/categories` and `/api/foods` instead of localStorage persistence.

OrderContext should use `/api/orders` for submitted orders and admin order operations.

Settings should use `/api/settings`.

The cart may remain browser-local if intentionally designed that way.

## RLS
Inspection of `pg_policies` returned no rows for the `public` schema. Do not assume existing application RLS policies. Still implement appropriate server-side authorization, especially for admin operations.

## Development Workflow
Preferred roles:
- ChatGPT: architecture, planning, teaching, prompts
- Claude: lead developer/implementation
- VS Code: development
- GitHub: source control
- Supabase: database
- Vercel: deployment

The owner prefers learning by doing and incremental changes.

## Broader Product Context
Possible future features include:
- food customization
- Bangladesh payment integration
- QR ordering
- delivery
- CRM
- loyalty

These are future/product context, not automatic requirements for the current database migration.
