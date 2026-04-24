# @biggora/paysera SDK Examples

Extended code examples for every resource in the `@biggora/paysera` SDK.

## Client Configuration

### Minimal Configuration

```typescript
import { createPayseraClient } from '@biggora/paysera';

const paysera = createPayseraClient({
  clientId: process.env.PAYSERA_CLIENT_ID!,
  clientSecret: process.env.PAYSERA_CLIENT_SECRET!,
});
```

### Full Configuration

```typescript
const paysera = createPayseraClient({
  clientId: process.env.PAYSERA_CLIENT_ID!,
  clientSecret: process.env.PAYSERA_CLIENT_SECRET!,
  baseUrl: 'https://api.paysera.com/checkout/v3/',
  tokenUrl: 'https://api.paysera.com/oauth/token',
  timeoutMs: 15_000,
  fetch: customFetchImplementation,
});
```

### Manual Token Management

```typescript
// Get current access token (fetches if expired)
const token = await paysera.getAccessToken();

// Force token refresh (useful after credential rotation)
paysera.clearAccessToken();
```

---

## Orders

### Create Order

```typescript
const order = await paysera.orders.create({
  amount: { amount: '4999', currency: 'EUR' },
  description: 'Annual subscription',
  order_id: `ORDER-${Date.now()}`,
  callback_url: 'https://example.com/api/paysera/webhook',
  success_redirect: 'https://example.com/checkout/success',
  failure_redirect: 'https://example.com/checkout/failure',
  cancel_redirect: 'https://example.com/checkout/cancel',
});

console.log(order.id);           // "ord_abc123"
console.log(order.checkout_url); // "https://pay.paysera.com/checkout/ord_abc123"
console.log(order.status);       // "created"
```

### List Orders

```typescript
// All orders
const allOrders = await paysera.orders.list();

// Filtered by status
const paidOrders = await paysera.orders.list({ status: 'paid' });

// With pagination
const page = await paysera.orders.list({ limit: 20, offset: 40 });
```

### Read Order

```typescript
const order = await paysera.orders.read('ord_abc123');

if (order.status === 'paid') {
  console.log('Payment confirmed');
} else if (order.status === 'failed') {
  console.log('Payment failed');
}
```

### Update Order

```typescript
const updated = await paysera.orders.update('ord_abc123', {
  description: 'Updated order description',
});
```

### Cancel Order

```typescript
const canceled = await paysera.orders.cancel('ord_abc123');
console.log(canceled.status); // "canceled"
```

### Check Order Status Flow

```typescript
async function waitForPayment(orderId: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const order = await paysera.orders.read(orderId);

    switch (order.status) {
      case 'paid':
        return true;
      case 'failed':
      case 'canceled':
      case 'expired':
        return false;
      default:
        await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return false;
}
```

---

## Payments

### List Payments

```typescript
// All payments
const payments = await paysera.payments.list();

// Payments for a specific order
const orderPayments = await paysera.payments.list({ order_id: 'ord_abc123' });
```

### Read Payment

```typescript
const payment = await paysera.payments.read('pay_xyz789');
console.log(payment.status);       // "authorized" | "captured" | ...
console.log(payment.amount);       // { amount: "2999", currency: "EUR" }
console.log(payment.order_id);     // "ord_abc123"
```

### Capture Payment (Full)

```typescript
const captured = await paysera.payments.capture('pay_xyz789');
console.log(captured.status); // "captured"
```

### Capture Payment (Partial)

```typescript
const captured = await paysera.payments.capture('pay_xyz789', {
  amount: { amount: '1500', currency: 'EUR' },
});
```

### Cancel Payment

```typescript
const canceled = await paysera.payments.cancel('pay_xyz789');
console.log(canceled.status); // "canceled"
```

---

## Refunds

### Create Full Refund

```typescript
const refund = await paysera.refunds.create({
  payment_id: 'pay_xyz789',
  amount: { amount: '2999', currency: 'EUR' },
  description: 'Customer requested full refund',
});
console.log(refund.id);     // "ref_def456"
console.log(refund.status); // "pending"
```

### Create Partial Refund

```typescript
const refund = await paysera.refunds.create({
  payment_id: 'pay_xyz789',
  amount: { amount: '1000', currency: 'EUR' },
  description: 'Partial refund for returned item',
});
```

### List Refunds

```typescript
// All refunds
const refunds = await paysera.refunds.list();

// Refunds for a specific payment
const paymentRefunds = await paysera.refunds.list({ payment_id: 'pay_xyz789' });
```

### Read Refund

```typescript
const refund = await paysera.refunds.read('ref_def456');

if (refund.status === 'succeeded') {
  console.log('Refund completed');
}
```

### Cancel Pending Refund

```typescript
const canceled = await paysera.refunds.cancel('ref_def456');
console.log(canceled.status); // "canceled"
```

---

## Webhooks

### Register Webhook

```typescript
const webhook = await paysera.webhooks.create({
  url: 'https://example.com/api/paysera/webhook',
  event_types: ['order.paid', 'order.failed', 'payment.captured', 'refund.succeeded'],
});
console.log(webhook.id); // "wh_ghi789"
```

### List Webhooks

```typescript
const webhooks = await paysera.webhooks.list();
for (const wh of webhooks.data ?? []) {
  console.log(wh.id, wh.url, wh.event_types);
}
```

### Read Webhook

```typescript
const webhook = await paysera.webhooks.read('wh_ghi789');
```

### Update Webhook

```typescript
const updated = await paysera.webhooks.update('wh_ghi789', {
  url: 'https://example.com/api/v2/paysera/webhook',
  event_types: ['order.paid', 'order.failed'],
});
```

### Delete Webhook

```typescript
await paysera.webhooks.delete('wh_ghi789');
```

### Parse Incoming Webhook Event

```typescript
import { parseWebhookEvent } from '@biggora/paysera';
import type { PayseraWebhookEvent } from '@biggora/paysera';

app.post('/api/paysera/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event: PayseraWebhookEvent = parseWebhookEvent(req.body);

  switch (event.type ?? event.event_type) {
    case 'order.paid': {
      const order = await paysera.orders.read(event.data.order_id);
      if (order.status === 'paid') {
        await fulfillOrder(order);
      }
      break;
    }
    case 'refund.succeeded': {
      await handleRefund(event.data);
      break;
    }
  }

  res.sendStatus(200);
});
```

---

## Type Imports

```typescript
import { createPayseraClient, PayseraApiError, parseWebhookEvent } from '@biggora/paysera';

import type {
  PayseraClient,
  PayseraClientOptions,
  PayseraOrder,
  PayseraOrderStatus,
  PayseraPayment,
  PayseraPaymentStatus,
  PayseraRefund,
  PayseraRefundStatus,
  PayseraWebhook,
  PayseraWebhookEvent,
  PayseraMoney,
  PayseraList,
} from '@biggora/paysera';
```

### Status Type Reference

```typescript
type PayseraOrderStatus = 'created' | 'pending' | 'paid' | 'failed' | 'canceled' | 'expired';
type PayseraPaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'canceled';
type PayseraRefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';
```
