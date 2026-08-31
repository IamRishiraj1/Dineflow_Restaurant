# DineFlow — Current Requirements

## Goal
Connect the existing app to real Supabase persistence.

Supabase must be the source of truth for:
- categories
- foods
- submitted orders
- restaurant settings

Do not rebuild or redesign the application.

## 1. Categories API
Implement:
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/[id]`
- `DELETE /api/categories/[id]`

Use the actual `Category` schema. Validate input, handle errors, and return useful server responses.

## 2. Foods API
Implement:
- `GET /api/foods`
- `POST /api/foods`
- `PATCH /api/foods/[id]`
- `DELETE /api/foods/[id]`

Use the actual `Food` schema and `Food.categoryId → Category.id` relationship. Include category data when required by the existing UI.

## 3. Orders API
Implement:
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/[id]`

POST must validate customer data, order type, payment method, items, quantities, and authoritative food/pricing data where appropriate. Create `Order` and `OrderItem` records according to the actual schema.

PATCH is primarily for status updates. Valid statuses:
`PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`

Protect admin-only operations using the existing auth/authorization architecture.

## 4. Settings API
Implement:
- `GET /api/settings`
- `PATCH /api/settings`

Use `RestaurantSettings`. It is intended as a singleton-style record. Known defaults include:
- id: `singleton`
- currency: `BDT`
- deliveryFee: `60`
- minimumOrder: `200`

Do not create multiple settings records unnecessarily.

## 5. CatalogContext Migration
Replace localStorage persistence with API calls.

Initial loading:
- `GET /api/categories`
- `GET /api/foods`

Mutations:
- category POST/PATCH/DELETE
- food POST/PATCH/DELETE

Add loading/error/mutation states. After success, use server responses to update React state.

## 6. OrderContext Migration
Submitted orders must use `POST /api/orders`.

On checkout:
1. validate order
2. submit to API
3. wait for success
4. use server-created order data
5. clear cart only after success
6. preserve cart and show error if submission fails

Admin order operations should use:
- `GET /api/orders`
- `PATCH /api/orders/[id]`

Do not use localStorage as the source of truth for submitted orders.

## 7. Settings Frontend
Replace settings localStorage persistence with:
- `GET /api/settings`
- `PATCH /api/settings`

Add loading, saving, and error states.

## 8. LocalStorage Audit
Search the project for `localStorage` and `sessionStorage`.

Remove obsolete persistence for:
- categories
- foods
- submitted orders
- restaurant settings

Do not automatically remove:
- shopping cart
- UI preferences
- other legitimate browser-only state

## 9. Database Cleanup
Only after real writes work:
1. inspect current data
2. identify test/junk data
3. inspect relationships
4. use existing safe seed/reset mechanism if available
5. remove only appropriate test data

Never blindly reset production/real data.

## 10. Required Tests

### Food
- add food in `/admin/foods`
- refresh
- confirm it remains

### Food edit/delete
- edit, refresh, confirm persistence
- delete test food, refresh, confirm deletion

### Categories
- create/edit/delete
- refresh after each
- confirm persistence

### Orders
- submit a customer order
- confirm API succeeds
- confirm Supabase persistence
- confirm cart clears only after success

### Admin order status
- fetch order
- change status
- refresh
- confirm status persists

### Settings
- change setting
- save
- refresh
- confirm persistence

### Two browsers
Browser A changes a food/category.
Browser B refreshes/re-fetches.
Browser B must receive the database-backed value.

### Failure handling
Confirm network/API failures:
- show an error
- do not falsely show success
- do not lose the customer cart after failed order submission

## 11. Verification
Run available:
- TypeScript/typecheck
- ESLint
- production build
- tests

Search again for obsolete catalog/order/settings localStorage persistence.

## 12. Non-Goals
Do not:
- redesign UI
- rebuild the whole app
- replace Next.js/Supabase
- add unrelated features
- add unnecessary dependencies
- change database schema without a clear reason
- expose secrets
- blindly reset the database

## 13. Implementation Order
1. inspect project
2. Categories API
3. Foods API
4. Orders API
5. Settings API
6. CatalogContext migration
7. OrderContext migration
8. Settings frontend migration
9. localStorage audit
10. cleanup/reseed
11. end-to-end testing
12. final build verification

## 14. Definition of Done
- Categories persist in Supabase
- Foods persist in Supabase
- Submitted orders persist in Supabase
- Settings persist in Supabase
- CatalogContext no longer relies on localStorage for catalog truth
- OrderContext no longer relies on localStorage for submitted-order truth
- Settings no longer rely on localStorage
- Loading/error states exist
- Admin changes survive refresh
- Orders survive refresh
- Status changes survive refresh
- Two-browser behavior is database-backed
- Typecheck/lint/build pass where configured
- No secrets exposed
