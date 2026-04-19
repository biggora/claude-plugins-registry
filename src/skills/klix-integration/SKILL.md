---
name: klix-integration
description: >
  Use this skill whenever the user wants to integrate Klix payment gateway into a website
  or application. Triggers include: adding Klix payments, checkout integration, payment
  processing with Klix, card payments via Klix, Apple Pay/Google Pay through Klix,
  bank payments (PIS) in Baltic countries, Klix Pay Later / installments, recurring
  payments, payment reservations/captures, Klix widget setup, Klix API calls, or any
  mention of Klix as a payment provider. Also use when the user mentions "klix.app",
  "Klix by Citadele", or needs to accept payments in Latvia, Lithuania, or Estonia
  using local banks. Always use this skill for any Klix-related payment integration work,
  even if the user just says "add payments" in a Baltic-region project context.
  Also triggers on: "@biggora/klix", "klix npm", "klix SDK", "klix TypeScript SDK",
  "klix module", "NestJS klix", "klix client library".
---

# Klix Payment Gateway Integration

Integrate Klix (by Citadele) payment gateway into any web application or website.
Klix supports card payments, Apple Pay, Google Pay, bank transfers (PIS) across
the Baltics, and Pay Later installments.

**Official docs**: https://developers.klix.app/
**Full API reference (OpenAPI)**: https://portal.klix.app/api/schema/v1/

## Quick Start Checklist

Before integrating, confirm these with the user:

1. **Credentials** — Brand ID and Secret Key (from Klix merchant portal or test env)
2. **Integration type** — eCommerce plugin, widget library, or direct API?
3. **Payment methods needed** — cards, Apple Pay, Google Pay, bank PIS, Pay Later?
4. **Payment scenarios** — one-time, recurring, reservation/capture?

If unsure, start with the **test environment** to prototype.

---

## Test Environment

Use these credentials for development and testing:

| Field | Value |
|-------|-------|
| Brand ID | `702314b8-dd86-41fa-9a22-510fdd71fa92` |
| Secret Key (full features) | `IB-bzOdJLgJjbsaA34Qpxkg1TTIrW-iDuni6JuzbP--KgtsREHzvIvLLTH8E5T0CZcSbYM3qNmfeogpWW_RZaA==` |
| Secret Key (simple) | `No51P_Dq4jQGeha6_eQpfjAFe67u3QYHEO95jrcCux0zPfByd8x9poSa6xINQPz1hyUGKNYoxa16rnUkSUI_MA==` |

**Test cards:**

| Type | PAN | CVV | Expiry | 3DS Password |
|------|-----|-----|--------|--------------|
| VISA | 4505 1312 3400 0029 | 123 | 06/28 | hint |
| Mastercard | 5191 6312 3400 0024 | 583 | 06/28 | hint |

Any cardholder name is accepted. On the test payment page, choose "successful" or "failed" scenario.

---

## Integration Approaches

Choose based on the project:

### 1. eCommerce Plugin (no code)
For WooCommerce (3.5+), Shopify, Magento (2.0+), OpenCart (3.0+), PrestaShop (1.7+), Mozello.
See `references/ecommerce-plugins.md` for platform-specific setup.

### 2. Frontend Widget (Pay Later only)
For showing monthly payment calculators on product/cart pages.
See `references/pay-later-widget.md`.

### 3. `@biggora/klix` TypeScript SDK (recommended for Node.js / TypeScript)
Typed SDK wrapping the REST API with built-in caching, error types, signature
verification, and first-class NestJS support. Dual ESM/CJS. Node.js 20+.
**See the SDK section below for details.**

### 4. Direct API Integration (recommended for non-Node.js stacks)
Full control over payment flow via raw HTTP requests. Works with any language.
**See the API Reference section below.**

---

## `@biggora/klix` SDK (Node.js / TypeScript)

### Installation

```bash
npm install @biggora/klix
```

### Client Setup

```typescript
import { createKlixClient } from '@biggora/klix';

const klix = createKlixClient({
  apiKey: process.env.KLIX_API_KEY!,
  brandId: process.env.KLIX_BRAND_ID!,
});
```

### Available Resources

| Resource | Methods |
|----------|---------|
| `klix.purchases` | `create`, `read`, `cancel`, `capture`, `charge`, `refund`, `release` |
| `klix.balance` | `get` |
| `klix.paymentMethods` | `list({ currency })` — 60s cache built-in |
| `klix.clients` | `create`, `list`, `iterateAll`, `listRecurringTokens(clientId)` |
| `klix.billing` | `sendInvoice` |
| `klix.billingTemplates` | `create`, `list`, `addSubscriber`, `sendInvoice`, `listClients` |
| `klix.companyStatements` | `create`, `list` |
| `klix.webhooks` | `create`, `list`, `listDeliveries` |

`brandId` is auto-injected into `paymentMethods.list()` and purchase calls.

### Purchase Example

```typescript
const purchase = await klix.purchases.create({
  currency: 'EUR',
  reference: 'ORDER-1001',
  client: { email: 'customer@example.com' },
  purchase: {
    products: [{ name: 'Pro subscription', price: 1999, quantity: 1 }],
  },
  success_callback: 'https://example.com/api/klix/callback',
  success_redirect: 'https://example.com/checkout/success',
  failure_redirect: 'https://example.com/checkout/failure',
});
// Redirect customer to purchase.checkout_url
```

### Error Handling

```typescript
import { KlixApiError } from '@biggora/klix';

try {
  await klix.purchases.read('invalid-id');
} catch (err) {
  if (err instanceof KlixApiError) {
    console.error(err.status, err.code, err.message, err.details);
  }
}
```

### Signature Verification

```typescript
// Success callback verification
const valid = await klix.verifySuccessCallback(rawBodyBuffer, signatureHeader);

// Webhook payload verification
import { verifyWebhookPayload } from '@biggora/klix';
const valid = verifyWebhookPayload(rawBodyBuffer, signatureHeader, webhook.public_key);
```

### NestJS Integration

Import from `@biggora/klix/nestjs`. Requires `rawBody: true` in NestFactory.

```typescript
import { KlixModule } from '@biggora/klix/nestjs';

@Module({
  imports: [
    KlixModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.getOrThrow('KLIX_API_KEY'),
        brandId: config.getOrThrow('KLIX_BRAND_ID'),
      }),
    }),
  ],
})
export class AppModule {}
```

Inject the client in services:

```typescript
import { InjectKlixClient } from '@biggora/klix/nestjs';
import type { KlixClient } from '@biggora/klix';

@Injectable()
export class PaymentsService {
  constructor(@InjectKlixClient() private readonly klix: KlixClient) {}

  async createPayment(order: Order) {
    return this.klix.purchases.create({ /* ... */ });
  }
}
```

Use `KlixSignatureVerifier` for callback verification in controllers:

```typescript
import { KlixSignatureVerifier } from '@biggora/klix/nestjs';

@Controller('klix')
export class KlixController {
  constructor(private readonly verifier: KlixSignatureVerifier) {}

  @Post('callback')
  async callback(@Req() req: RawBodyRequest<Request>) {
    const valid = await this.verifier.verifySuccessCallback(
      req.rawBody ?? Buffer.alloc(0),
      String(req.headers['x-signature'] ?? ''),
    );
    if (valid) {
      // process the payment
    }
    return { ok: true };
  }
}
```

---

## API Reference (Direct HTTP)

> If using `@biggora/klix` SDK, these endpoints are handled automatically.
> This section is for direct HTTP integration with non-Node.js stacks.

**Base URL**: `https://portal.klix.app/api/v1/`

**Authentication**: Bearer token in the `Authorization` header:
```
Authorization: Bearer <Secret Key>
```

**Required headers** for all requests:
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <SECRET_KEY>
```

**Amounts** are always in **cents** (e.g., 3000 = 30.00 EUR).

### Core Endpoints

#### List Available Payment Methods
```
GET /payment_methods/?currency=EUR&brand_id=<BRAND_ID>
```
Returns available methods with names, logos, country availability.
**Cache this response** — rate-limited to max 1 request/minute.

#### Create a Purchase
```
POST /purchases/
```

Minimal request body:
```json
{
  "brand_id": "<BRAND_ID>",
  "success_callback": "https://yoursite.com/api/klix/callback",
  "success_redirect": "https://yoursite.com/order/success",
  "failure_redirect": "https://yoursite.com/order/failure",
  "cancel_redirect": "https://yoursite.com/order/cancel",
  "purchase": {
    "language": "en",
    "products": [
      {
        "name": "Product name",
        "price": 2999
      }
    ]
  },
  "client": {
    "email": "customer@example.com"
  },
  "reference": "ORDER-123"
}
```

Response includes `id` (purchase ID) and `checkout_url` — redirect the customer there.

#### Get Purchase Status
```
GET /purchases/<PURCHASE_ID>/
```

#### Capture Reserved Funds
```
POST /purchases/<PURCHASE_ID>/capture/
```
Optional body for partial capture: `{"amount": 1500}`

#### Release Reserved Funds
```
POST /purchases/<PURCHASE_ID>/release/
```

#### Charge Recurring Payment
```
POST /purchases/<PURCHASE_ID>/charge
```
Body: `{"recurring_token": "<TOKEN>"}`

### Payment Flow

```
1. Server: POST /purchases/ → get checkout_url
2. Client: Redirect customer to checkout_url
3. Customer: Completes payment on Klix page
4. Klix: POST to success_callback (server-to-server)
5. Klix: Redirect customer to success_redirect or failure_redirect
6. Server: Verify payment via GET /purchases/<ID>/
```

Always verify payment status server-side via the callback. Do not rely solely on the redirect.

---

## Payment Scenarios

### One-Time Payment
Standard flow as shown above. No extra parameters needed.

### Recurring Payments
1. Create initial purchase with `"force_recurring": true`
2. On success callback, store the purchase `id` as the recurring token
3. For subsequent charges: create a new purchase, then call `/charge` with the token

```json
{
  "brand_id": "<BRAND_ID>",
  "force_recurring": true,
  "success_callback": "https://yoursite.com/api/klix/callback",
  "success_redirect": "https://yoursite.com/success",
  "failure_redirect": "https://yoursite.com/failure",
  "purchase": {
    "products": [{"name": "Subscription", "price": 999}]
  },
  "client": {"email": "user@example.com"}
}
```

### Reservation (Authorization Hold)
1. Create purchase with `"skip_capture": true`
2. Funds are held (status: "hold")
3. Later: capture full/partial amount or release
4. Auto-releases after **6 days** if not captured

### Restrict Payment Methods
Use `payment_method_whitelist` to show only specific methods:
```json
{
  "payment_method_whitelist": ["klix", "klix_apple_pay", "klix_google_pay"]
}
```

### Native Apple Pay / Google Pay
1. Create purchase with `payment_method_whitelist: ["klix_apple_pay"]` (or `klix_google_pay`)
2. Get encrypted token from Apple/Google Pay JS API
3. POST to `https://portal.klix.app/api/v1/p/<PURCHASE_ID>/`
   - Form data: `pm=klix_apple_pay`, `s2s=true`, `token=<Base64_token>`
4. If response contains `threeDsRedirectUrl`, redirect customer for 3DS verification

**Apple Pay detection**: `window.ApplePaySession && ApplePaySession.canMakePayments()`

### Bulk Payments (PIS)
Supported on: `citadele_*_pis`, `seb_*_pis`, `swedbank_*_pis`
Include `payment_method_details.pis_bulk_purchase[]` with creditor IBAN, name, amount, reference.
All IBANs must be pre-whitelisted with Klix.

---

## Supported Payment Methods

See `references/payment-methods.md` for the full list of 24 methods across Latvia, Lithuania, and Estonia.

Key method IDs:
- `klix` — Card payments (Visa, Mastercard)
- `klix_apple_pay` — Apple Pay
- `klix_google_pay` — Google Pay
- `klix_pay_later` — Installments
- `*_pis` — Bank transfers (e.g., `swedbank_lv_pis`, `seb_ee_pis`)
- `*_digilink` — Citadele bank links

---

## Callback Handling

Klix sends a server-to-server POST to `success_callback` when payment completes.
Implement a POST endpoint that:

1. Receives the callback
2. Verifies payment by calling `GET /purchases/<ID>/`
3. Updates order status in your database
4. Returns HTTP 200

Example (Node.js/Express):
```javascript
app.post('/api/klix/callback', async (req, res) => {
  const purchaseId = req.body.id;
  const response = await fetch(
    `https://portal.klix.app/api/v1/purchases/${purchaseId}/`,
    { headers: { 'Authorization': `Bearer ${process.env.KLIX_SECRET_KEY}` } }
  );
  const purchase = await response.json();
  if (purchase.status === 'paid') {
    await updateOrderStatus(purchase.reference, 'paid');
  }
  res.sendStatus(200);
});
```

**Using `@biggora/klix` SDK:**
```javascript
import { createKlixClient } from '@biggora/klix';

const klix = createKlixClient({
  apiKey: process.env.KLIX_SECRET_KEY,
  brandId: process.env.KLIX_BRAND_ID,
});

app.post('/api/klix/callback', async (req, res) => {
  const valid = await klix.verifySuccessCallback(
    req.rawBody, req.headers['x-signature']
  );
  if (valid) {
    const purchase = await klix.purchases.read(req.body.id);
    if (purchase.status === 'paid') {
      await updateOrderStatus(purchase.reference, 'paid');
    }
  }
  res.sendStatus(200);
});
```

Note: enable raw body parsing (`express.raw()` or `{ rawBody: true }` in NestJS) for signature verification.

---

## Branding Guidelines

- Show Klix logo alongside other payment methods in footer and checkout
- Use official button assets from https://developers.klix.app/static-assets/
- Checkout button labels by language (LV/EN/LT/RU) — see `references/branding.md`
- Apple Pay: follow Apple's representation guidelines
- Contact marketing@klix.app for custom landing page text changes

---

## Reference Files

Read these for deeper details on specific topics:

- `references/payment-methods.md` — Full list of 24 payment methods with country/validation details
- `references/pay-later-widget.md` — Frontend widget for installment calculator display
- `references/ecommerce-plugins.md` — Platform-specific plugin setup (WooCommerce, Shopify, etc.)
- `references/branding.md` — Logo assets, button labels, landing page requirements

---

## Common Integration Patterns

### Next.js / React
1. `npm install @biggora/klix`
2. Create API route `POST /api/checkout` — use `klix.purchases.create()`, return `checkout_url`
3. Create API route `POST /api/klix/callback` — use `klix.verifySuccessCallback()` + `klix.purchases.read()`
4. Redirect to `checkout_url` from client via `router.push()`
5. Create success/failure/cancel pages

### Express / Node.js
1. `npm install @biggora/klix`
2. Initialize client: `createKlixClient({ apiKey, brandId })`
3. `POST /checkout` — `klix.purchases.create(...)`, return `checkout_url`
4. `POST /webhook/klix` — `klix.verifySuccessCallback()`, then `klix.purchases.read()`
5. `GET /order/:id/status` — `klix.purchases.read(id)`

### NestJS
1. `npm install @biggora/klix`
2. Import `KlixModule.forRootAsync()` in AppModule with `ConfigService`
3. Inject `KlixClient` via `@InjectKlixClient()` in payment services
4. Use `KlixSignatureVerifier` in webhook controller
5. Enable `rawBody: true` in `NestFactory.create()`

### PHP / Laravel
1. Use `klix/klix-sdk-php` from Packagist (official SDK)
2. Create checkout controller
3. Add webhook route for callback

### Any Other Stack
1. Make HTTP requests to the API directly (see API Reference section)
2. Or generate a client from the OpenAPI schema: `https://portal.klix.app/api/schema/v1/`
