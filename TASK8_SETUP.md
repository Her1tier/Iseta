# Task 8: Order Management System - Setup Instructions

## Database Setup

You need to run the SQL migration to create the `orders` table in Supabase.

###Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase_migrations/create_orders_table.sql`
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push supabase_migrations/create_orders_table.sql
```

## What's Been Implemented

### ✅ Database
- **`orders` table** with complete schema
- Customer info fields (name, phone)
- Order details (quantity, price_at_time, variations)
- Status tracking (pending, paid, completed, cancelled)
- Notes field
- Timestamps (created_at, updated_at)
- RLS policies (sellers can only see their own orders)
- Indexes for performance
- Auto-update trigger for `updated_at`

### ✅ Components Created

1. **`/src/pages/dashboard/Orders.jsx`**
   - Orders list with table view
   - Stats cards (total, pending, completed, revenue)
   - Search by customer name/phone
   - Filter by status
   - Create Order button
   - Click to view details

2. **`/src/components/dashboard/CreateOrderModal.jsx`**
   - Product selection dropdown
   - Customer info inputs
   - Quantity and price fields
   - Dynamic variation selectors
   - Status selector
   - Notes textarea
   - Phone number validation (+250)
   - Stock availability check
   - Total calculation

3. **`/src/components/dashboard/OrderDetailsModal.jsx`**
   - Full order information display
   - Product details with image
   - Customer info with click-to-call
   - Status-based action buttons:
     - Mark as Paid (pending → paid)
     - Mark as Completed (paid → completed)
     - Cancel Order
     - Delete Order
     - WhatsApp Customer
   - Inventory management on status changes
   - Timestamps display

### ✅ Navigation
- Added Orders route to Dashboard: `/dashboard/orders`
- Sidebar link already exists in DashboardLayout

## Testing Steps

After running the database migration:

1. Start dev server: `npm run dev`
2. Login to your account
3. Navigate to `/dashboard/orders`
4. Click **Create Order**
5. Fill in the form and submit
6. Verify order appears in the list
7. Click on an order to view details
8. Test status updates:
   - Mark as Paid
   - Mark as Completed (check inventory decreases)
   - Cancel Order
9. Test WhatsApp customer link
10. Test delete order (check inventory restores if was completed)
11. Test search and filtering

## Order Workflow

```
New Order (via WhatsApp)
    ↓
Create in Dashboard (status: pending)
    ↓
Customer Pays → Mark as Paid (status: paid)
    ↓
Seller Delivers → Mark as Completed (status: completed, inventory -1)
```

**Cancel anytime:** pending or paid → cancelled

## Key Features

- **Manual Order Creation**: Sellers create orders after WhatsApp conversations
- **Status Tracking**: pending → paid → completed workflow
- **Inventory Sync**: Auto-deduct stock when marking as completed
- **Customer Contact**: Direct WhatsApp and phone links
- **Search & Filter**: Find orders quickly
- **Revenue Tracking**: See total from completed orders
- **Mobile Responsive**: Works on all devices

## Next Steps

Once tested:
- Mark Task 8 as complete in TASKS.md
- Consider adding:
  - Order number generation
  - Export to CSV
  - Order notifications
  - Revenue charts
