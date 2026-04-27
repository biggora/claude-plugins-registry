---
name: paysera-integration
description: "Use this skill whenever the user wants to integrate PaySera payment gateway into a website or application. Triggers include: adding PaySera payments, PaySera Checkout V3 integration, payment processing with PaySera, card payments via PaySera, bank transfers through PaySera, e-wallet payments in EU/Baltic countries, PaySera order creation, PaySera webhooks, PaySera refunds, PaySera payment capture, or any mention of PaySera as a payment provider. Also use when the user mentions \"paysera.com\", \"PaySera Checkout\", or needs to accept payments across the EU using PaySera's payment infrastructure. Also triggers on: \"@biggora/paysera\", \"paysera npm\", \"paysera SDK\", \"paysera TypeScript SDK\", \"paysera module\", \"NestJS paysera\", \"paysera client library\", \"PaySera Checkout V3 API\", \"paysera OAuth\".
"
---

# PaySera Checkout V3 Integration

Integrate PaySera payment gateway into any web application. PaySera supports
card payments (Visa, Mastercard), bank transfers, e-wallets, and mobile payments
across 180+ countries with strong coverage in the Baltics and EU.

**Official docs**: https://developers.paysera.com
**TypeScript SDK**: https://www.npmjs.com/package/@biggora/paysera

## Quick Start Checklist

Before integrating, confirm these with the user:

1. **Credentials** — `clientId` and `clientSecret` from PaySera merchant account
2. **Integration type** — `@biggora/paysera` SDK or direct API?
3. **Payment methods needed** — cards, bank transfers, e-wallets?
4. **Payment flow** — one-time, reservation/capture, or recurring?
5. **Webhook endpoint** — URL where PaySera sends payment notifications

If unsure about credentials, the user can obtain them from the
[PaySera merchant dashboard](https://www.paysera.com).

---

## Integration Approaches

Choose based on the project:

### 1. `@biggora/paysera` TypeScript SDK (recommended for Node.js / TypeScript)
Typed SDK wrapping the Checkout V3 REST API with OAuth2 token auto-caching,
typed error handling, and first-class NestJS support. Dual ESM/CJS. Node.js 20+.
**See the SDK section below for details.**

### 2. Direct API Integration (for non-Node.js stacks)
Full control over payment flow via raw HTTP requests with OAuth2 client_credentials.
Works with any language.
**See the API Reference section below.**

---

## `@biggora/paysera` SDK (Node.js / TypeScript)

### Installation

```bash
npm install @biggora/paysera
```

### Client Setup

```typescript
import { createPayseraClient } from '@biggora/paysera';

const paysera = createPayseraClient({
  clientId: process.env.PAYSERA_CLIENT_ID!,
  clientSecret: process.env.PAYSERA_CLIENT_SECRET!,
});
```

### Client Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | `string` | *required* | OAuth2 client ID from PaySera |
| `clientSecret` | `string` | *required* | OAuth2 client secret from PaySera |
| `baseUrl` | `string` | `https://api.paysera.com/checkout/v3/` | API base URL |
| `tokenUrl` | `string` | `https://api.paysera.com/oauth/token` | OAuth2 token endpoint |
| `timeoutMs` | `number` | `30000` | Request timeout in milliseconds |
| `fetch` | `FetchLike` | `globalThis.fetch` | Custom fetch implementation |

The SDK automatically acquires and caches OAuth2 access tokens. Tokens are
refreshed 30 seconds before expiry.

### Available Resources

| Resource | Methods |
|----------|---------|
| `paysera.orders` | `create`, `list`, `read`, `update`, `cancel` |
| `paysera.payments` | `list`, `read`, `capture`, `cancel` |
| `paysera.refunds` | `create`, `list`, `read`, `cancel` |
| `paysera.webhooks` | `create`, `list`, `read`, `update`, `delete` |

### Order Creation Example

```typescript
const order = await paysera.orders.create({
  amount: { amount: '2999', currency: 'EUR' },
  description: 'Pro subscription',
  order_id: 'ORDER-1001',
  callback_url: 'https://example.com/api/paysera/webhook',
  success_redirect: 'https://example.com/checkout/success',
  failure_redirect: 'https://example.com/checkout/failure',
  cancel_redirect: 'https://example.com/checkout/cancel',
});
// Redirect customer to order.checkout_url
```

### Reading Order Status

```typescript
const order = await paysera.orders.read('order-id');
if (order.status === 'paid') {
  // Payment confirmed
}
```

### Capturing a Payment

```typescript
// Full capture
await paysera.payments.capture('payment-id');

// Partial capture
await paysera.payments.capture('payment-id', { amount: { amount: '1500', currency: 'EUR' } });
```

### Creating a Refund

```typescript
const refund = await paysera.refunds.create({
  payment_id: 'payment-id',
  amount: { amount: '2999', currency: 'EUR' },
  description: 'Customer requested refund',
});
```

### Error Handling

```typescript
import { PayseraApiError } from '@biggora/paysera';

try {
  await paysera.orders.read('invalid-id');
} catch (err) {
  if (err instanceof PayseraApiError) {
    console.error(err.status, err.code, err.message, err.details);
    // err.requestId is useful for PaySera support tickets
  }
}
```

### Webhook Handling

```typescript
import { parseWebhookEvent } from '@biggora/paysera';

// Parse incoming webhook payload
const event = parseWebhookEvent(rawBody);
console.log(event.type, event.data);

// After receiving webhook, verify order status via API
const order = await paysera.orders.read(event.data.order_id);
if (order.status === 'paid') {
  await updateOrderStatus(order.id, 'paid');
}
```

> **Note:** `verifyWebhookPayload()` currently throws
> `PayseraWebhookVerificationUnavailableError` because PaySera documentation
> does not expose a stable webhook signature algorithm. Always verify payment
> status via `paysera.orders.read()` after receiving a webhook.

### NestJS Integration

Import from `@biggora/paysera/nestjs`. Requires `rawBody: true` in NestFactory.

```typescript
import { PayseraModule } from '@biggora/paysera/nestjs';

@Module({
  imports: [
    PayseraModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        clientId: config.getOrThrow('PAYSERA_CLIENT_ID'),
        clientSecret: config.getOrThrow('PAYSERA_CLIENT_SECRET'),
      }),
    }),
  ],
})
export class AppModule {}
```

Inject the client in services:

```typescript
import { InjectPayseraClient } from '@biggora/paysera/nestjs';
import type { PayseraClient } from '@biggora/paysera';

@Injectable()
export class PaymentsService {
  constructor(@InjectPayseraClient() private readonly paysera: PayseraClient) {}

  async createOrder(orderData: CreateOrderDto) {
    return this.paysera.orders.create({ /* ... */ });
  }
}
```

Use `PayseraWebhookVerifier` for webhook parsing in controllers:

```typescript
import { PayseraWebhookVerifier } from '@biggora/paysera/nestjs';

@Controller('paysera')
export class PayseraController {
  constructor(
    private readonly verifier: PayseraWebhookVerifier,
    private readonly paysera: PayseraClient,
  ) {}

  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const event = this.verifier.parse(req.rawBody ?? Buffer.alloc(0));
    // Verify order status via API
    const order = await this.paysera.orders.read(event.data.order_id);
    if (order.status === 'paid') {
      // Process the payment
    }
    return { ok: true };
  }
}
```

---

## API Reference (Direct HTTP)

> If using `@biggora/paysera` SDK, these endpoints are handled automatically.
> This section is for direct HTTP integration with non-Node.js stacks.

**Base URL**: `https://api.paysera.com/checkout/v3/`
**Token URL**: `https://api.paysera.com/oauth/token`

### OAuth2 Token Acquisition

```bash
curl -X POST https://api.paysera.com/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Cache the token and refresh 30 seconds before `expires_in`.

**Required headers** for all API requests:
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
```

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create order, returns `checkout_url` |
| `GET` | `/orders/:id` | Read order status |
| `PATCH` | `/orders/:id` | Update order |
| `POST` | `/orders/:id/cancel` | Cancel order |
| `GET` | `/payments` | List payments |
| `GET` | `/payments/:id` | Read payment |
| `POST` | `/payments/:id/capture` | Capture authorized payment |
| `POST` | `/payments/:id/cancel` | Cancel payment |
| `POST` | `/refunds` | Create refund |
| `GET` | `/refunds/:id` | Read refund |
| `POST` | `/refunds/:id/cancel` | Cancel refund |
| `POST` | `/webhooks` | Register webhook |
| `GET` | `/webhooks/:id` | Read webhook |
| `PATCH` | `/webhooks/:id` | Update webhook |
| `DELETE` | `/webhooks/:id` | Delete webhook |

### Minimal Order Creation

```json
POST /orders
{
  "amount": { "amount": "2999", "currency": "EUR" },
  "description": "Order #1001",
  "order_id": "ORDER-1001",
  "callback_url": "https://yoursite.com/api/paysera/webhook",
  "success_redirect": "https://yoursite.com/success",
  "failure_redirect": "https://yoursite.com/failure"
}
```

Response includes `id` (order ID) and `checkout_url` — redirect the customer there.

---

## Payment Flow

```
1. Server: POST /orders → get checkout_url
2. Client: Redirect customer to checkout_url
3. Customer: Completes payment on PaySera page
4. PaySera: POST webhook to your callback_url
5. Server: Parse webhook event, verify order status via GET /orders/:id
6. Server: Update order in database
```

Always verify payment status server-side via the API. Do not rely solely on
the redirect URL.

---

## Payment Scenarios

### One-Time Payment
Standard flow as shown above. Create order → redirect → webhook → verify.

### Reservation / Capture (Authorization Hold)
1. Create order with authorization mode
2. Payment is authorized (status: `authorized`)
3. Later: capture full or partial amount via `paysera.payments.capture(id)`
4. Or cancel: `paysera.payments.cancel(id)`

```typescript
// Capture full amount
await paysera.payments.capture('payment-id');

// Capture partial amount
await paysera.payments.capture('payment-id', {
  amount: { amount: '1500', currency: 'EUR' },
});

// Release hold
await paysera.payments.cancel('payment-id');
```

### Refunds

Full or partial refund of a captured payment:

```typescript
// Full refund
await paysera.refunds.create({
  payment_id: 'payment-id',
  amount: { amount: '2999', currency: 'EUR' },
});

// Partial refund
await paysera.refunds.create({
  payment_id: 'payment-id',
  amount: { amount: '1000', currency: 'EUR' },
  description: 'Partial refund for returned item',
});
```

---

## Webhook Handling

### Register a Webhook

```typescript
await paysera.webhooks.create({
  url: 'https://yoursite.com/api/paysera/webhook',
  event_types: ['order.paid', 'order.failed', 'payment.captured'],
});
```

Or register via the PaySera merchant dashboard.

### Process Incoming Webhooks

```typescript
import { parseWebhookEvent } from '@biggora/paysera';

app.post('/api/paysera/webhook', async (req, res) => {
  const event = parseWebhookEvent(req.body);

  // Always verify order status via API (signature verification unavailable)
  const order = await paysera.orders.read(event.data.order_id);

  if (order.status === 'paid') {
    await updateOrderStatus(order.id, 'paid');
  }

  res.sendStatus(200);
});
```

> **Important:** Respond with HTTP 200 quickly. Perform heavy processing
> asynchronously. PaySera may retry failed webhook deliveries.

---

## Reference Files

Read these for deeper details on specific topics:

- `references/paysera-api-reference.md` — Full Checkout V3 API endpoints, parameters, responses, statuses
- `references/paysera-sdk-examples.md` — Extended code examples for all SDK resources
- `references/paysera-nestjs-integration.md` — Comprehensive NestJS patterns (module, services, controllers, testing)
- `references/paysera-error-handling.md` — Error types, HTTP status codes, retry patterns, common scenarios

---

## Common Integration Patterns

### NestJS
1. `npm install @biggora/paysera`
2. Import `PayseraModule.forRootAsync()` in AppModule with `ConfigService`
3. Inject `PayseraClient` via `@InjectPayseraClient()` in payment services
4. Use `PayseraWebhookVerifier` in webhook controller
5. Enable `rawBody: true` in `NestFactory.create()`

### Next.js / React
1. `npm install @biggora/paysera`
2. Create API route `POST /api/checkout` — use `paysera.orders.create()`, return `checkout_url`
3. Create API route `POST /api/paysera/webhook` — use `parseWebhookEvent()` + `paysera.orders.read()`
4. Redirect to `checkout_url` from client via `router.push()`
5. Create success/failure/cancel pages

### Express / Node.js
1. `npm install @biggora/paysera`
2. Initialize client: `createPayseraClient({ clientId, clientSecret })`
3. `POST /checkout` — `paysera.orders.create(...)`, return `checkout_url`
4. `POST /webhook/paysera` — `parseWebhookEvent()`, then `paysera.orders.read()`
5. `GET /order/:id/status` — `paysera.orders.read(id)`

### Any Other Stack
1. Acquire OAuth2 token via POST to `https://api.paysera.com/oauth/token`
2. Make HTTP requests to the API directly (see API Reference section)
3. Cache tokens and refresh before expiry
