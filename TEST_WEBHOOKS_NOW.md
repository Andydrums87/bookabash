# Quick Test: See Webhooks Working NOW! 🚀

## ✅ What We Just Fixed

Your payment was processing **client-side** (in browser) instead of via webhooks. Now it's fixed!

**Before:** Payment logic runs in browser → Database updates immediately → No webhook needed
**After:** Payment confirmed → Redirect to processing page → **Webhook processes everything** → Success!

---

## 🧪 Test Right Now (5 Steps)

### Step 1: Start Stripe CLI (New Terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Wait for this output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**Copy that `whsec_xxxxx` to your `.env.local`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Restart Next.js Dev Server

In your existing terminal:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 3: Make a Test Payment

1. Go to: http://localhost:3000/payment/secure-party
2. Fill in party details
3. Use test card: **4242 4242 4242 4242**
   - Expiry: 12/25
   - CVC: 123
   - Postcode: SW1A 1AA
4. Click "Pay Securely"

### Step 4: Watch 3 Places! 👀

#### Terminal 1 (Stripe CLI):
You should see:
```bash
2025-11-17 09:45:00  --> payment_intent.succeeded [evt_xxx]
2025-11-17 09:45:01  <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

✅ `[200]` = Webhook received successfully!

#### Terminal 2 (Next.js Dev):
You should see:
```bash
📨 Received webhook event: payment_intent.succeeded
✅ Payment succeeded: { id: 'pi_xxx', amount: 15000, party_id: 'uuid' }
🔄 Processing payment for party uuid
✅ Updated party uuid status to 'planned' and payment_status
📝 Updating 1 existing enquiries
✅ Updated payment status for all enquiries
📧 Sending supplier notification emails...
✅ Email sent to [Supplier Name]
✅ Customer confirmation email sent
✅ Payment processing complete for party uuid
✅ Payment processing completed successfully
```

#### Browser:
You should see:
1. **Processing page** (with loading spinner)
   - "Processing your payment..."
   - Progress bar
2. After 1-3 seconds: **Success page**
   - "Payment Successful!"

### Step 5: Verify Database

Check Supabase:

```sql
SELECT
  id,
  status,
  payment_status,
  payment_intent_id
FROM parties
ORDER BY updated_at DESC
LIMIT 1;
```

**Should show:**
- `status`: `'planned'` ✅
- `payment_status`: `'partial_paid'` or `'fully_paid'` ✅
- `payment_intent_id`: `'pi_xxxxx'` ✅

---

## 🎯 What You'll See NOW vs BEFORE

### ❌ BEFORE (What you saw earlier):
```
Browser Console:
✅ Auto-accepted 1 enquiries
✅ Updated payment status for 1 enquiries
✅ Success URL: /payment/success?...

Terminals: (no webhook logs)
```

### ✅ AFTER (What you'll see now):
```
Stripe CLI Terminal:
--> payment_intent.succeeded
<-- [200] POST http://localhost:3000/api/webhooks/stripe

Next.js Terminal:
📨 Received webhook event: payment_intent.succeeded
✅ Payment processing completed successfully

Browser:
- Processing page (1-3 seconds)
- Success page
```

---

## 🔍 How to Know It's Working

**1. Stripe CLI shows `[200]`**
   - Means webhook reached your server

**2. Next.js shows "Payment processing completed successfully"**
   - Means webhook processed the payment

**3. Browser goes to `/payment/processing` first**
   - NOT directly to `/payment/success`
   - This proves it's using webhook flow!

**4. Database updates match payment intent**
   - Party status = `'planned'`
   - Payment intent ID stored

---

## ⚠️ Common Issues

### Issue: Still no webhook logs

**Check:**
1. Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Webhook secret copied to `.env.local`
3. Next.js restarted after adding secret
4. You're going to `/payment/secure-party` (not just `/payment`)

### Issue: Browser console still shows old logs

**Fix:** Hard refresh the page
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R

Old JavaScript might be cached!

### Issue: Webhook shows `[400]` or `[500]`

**Check Next.js terminal for error:**
- `[400]` = Webhook secret mismatch
- `[500]` = Database or processing error

Look for red error messages in Next.js logs

---

## 🎉 Success Checklist

After testing, you should have:

- ✅ Stripe CLI showing `<-- [200]`
- ✅ Next.js showing processing logs
- ✅ Browser showing processing page first
- ✅ Database updated correctly
- ✅ No more client-side processing logs

**If all checked:** Your webhook system is working! 🎊

---

## 📝 Notes

- **Processing page timeout:** If webhook takes >30 seconds, it still redirects to success (payment is captured)
- **Duplicate webhooks:** Handled automatically (idempotent)
- **Browser closing:** Payment still processes (webhook is server-side)

---

## Next Steps

Once working locally:
1. Deploy to production
2. Configure webhook in Stripe Dashboard
3. Update `STRIPE_WEBHOOK_SECRET` in production env vars
4. Test production webhook with Stripe's "Send test webhook"

See `WEBHOOK_SETUP.md` for full production setup guide!
