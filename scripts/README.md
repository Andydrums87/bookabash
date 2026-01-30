# Scripts

## Create Local Supplier User

This script creates a local supplier account and links all your existing suppliers to it.

### Prerequisites

Make sure you have the following in your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Usage

Run the script:
```bash
npm run create-supplier-user
```

This will:
1. Create a Supabase auth user with email: `andydrums87@gmail.com`
2. Find all suppliers with `data->owner->email` matching that email
3. Link those suppliers to the new auth user by setting `auth_user_id`

### Login Credentials

After running the script, you can sign in at `/suppliers/onboarding/auth/signin` with:

- **Email:** `andydrums87@gmail.com`
- **Password:** `LocalSupplier123!`

### Customization

If you want to use a different email or password, edit the constants at the top of `create-local-supplier-user.js`:

```javascript
const SUPPLIER_EMAIL = 'your-email@example.com'
const SUPPLIER_PASSWORD = 'YourPassword123!'
```
