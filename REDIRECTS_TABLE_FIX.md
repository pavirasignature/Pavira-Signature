# Fix Supabase Redirects Table Error

## Problem
The application is throwing this error:
```
Supabase Redirect fetch error, falling back to empty list: Could not find the table 'public.redirects' in the schema cache
```

## Solution
The `redirects` table is missing from your Supabase database. Follow these steps to create it:

### Step 1: Apply the Migration in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Select your project: **Pavira Signature**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL from `migrations/003_create_redirects_table.sql`
6. Click **Run** button

### Step 2: Verify the Table Creation

After running the migration, verify the table was created:

1. In Supabase Dashboard, go to **Database** → **Tables**
2. You should see `redirects` table in the list
3. Confirm it has these columns:
   - `id` (BIGINT, Primary Key)
   - `oldPath` (TEXT, Unique)
   - `newPath` (TEXT)
   - `isActive` (BOOLEAN)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Step 3: Test the Fix

1. Restart your backend server
2. Check the console - the error should be gone
3. The redirects API should now work properly

### SQL Migration Details

The migration creates:
- ✅ `redirects` table with proper schema
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance optimization
- ✅ Unique constraint on `oldPath`
- ✅ Default values for timestamps

### Rollback (if needed)

If you need to remove the table:
```sql
DROP TABLE IF NOT EXISTS "public"."redirects" CASCADE;
```

### Backend Schema Expected

The backend model expects these fields in the redirects table:
- `id` - Supabase auto-generated unique identifier
- `oldPath` - The old URL path to redirect FROM
- `newPath` - The new URL path to redirect TO
- `isActive` - Boolean to enable/disable redirects

## Testing the API

Once the table is created, you can test the redirects API:

```bash
# Get all active redirects
curl http://localhost:5000/api/redirects

# Create a new redirect (POST)
curl -X POST http://localhost:5000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{
    "oldPath": "/old-product",
    "newPath": "/products/new-product"
  }'
```

## Troubleshooting

**Issue:** Still getting the error after applying migration
- Solution: Clear Supabase schema cache by refreshing the dashboard or wait a few seconds for cache to update

**Issue:** "relation already exists" error
- Solution: The table already exists - the migration includes `IF NOT EXISTS` clauses to handle this safely

**Issue:** Permission denied error
- Solution: Ensure your Supabase user has admin/DDL permissions in the SQL editor

## Files Changed
- `migrations/003_create_redirects_table.sql` - New migration file for redirects table

---

Need help? Check the backend model at `backend/models/Redirect.js` for implementation details.
