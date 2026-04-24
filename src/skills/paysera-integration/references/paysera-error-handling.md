# PaySera Error Handling

Error types, HTTP status codes, retry patterns, and common error scenarios.

## PayseraApiError

The SDK throws `PayseraApiError` for all API errors. It extends `Error` with
additional properties:

```typescript
import { PayseraApiError } from '@biggora/paysera';

try {
  await paysera.orders.read('invalid-id');
} catch (err) {
  if (err instanceof PayseraApiError) {
    err.status;    // HTTP status code (e.g., 404)
    err.code;      // Error code string (e.g., "not_found")
    err.message;   // Human-readable error message
    err.details;   // Additional error details (varies by endpoint)
    err.raw;       // Raw response body (for debugging)
    err.requestId; // Request ID header (for PaySera support)
  }
}
```

### Logging Best Practices

Always include `requestId` when logging errors — it helps PaySera support
investigate issues:

```typescript
} catch (err) {
  if (err instanceof PayseraApiError) {
    logger.error('PaySera API error', {
      status: err.status,
      code: err.code,
      message: err.message,
      requestId: err.requestId,
    });
  }
}
```

---

## PayseraWebhookVerificationUnavailableError

Thrown when calling `verifyWebhookPayload()`:

```typescript
import { PayseraWebhookVerificationUnavailableError } from '@biggora/paysera';
```

**Why it throws:** PaySera Checkout V3 documentation does not expose a stable
webhook signature verification algorithm.

**Workaround:** Always verify order status via the API after receiving a webhook:

```typescript
import { parseWebhookEvent } from '@biggora/paysera';

const event = parseWebhookEvent(rawBody);
// Do NOT rely on the webhook payload alone
const order = await paysera.orders.read(event.data.order_id);
if (order.status === 'paid') {
  // Safe to process
}
```

---

## Network Errors

The SDK wraps network errors as `PayseraApiError` with specific codes:

| Code | Cause |
|------|-------|
| `request_timeout` | Request exceeded `timeoutMs` |
| `network_error` | DNS failure, connection refused, etc. |

```typescript
} catch (err) {
  if (err instanceof PayseraApiError && err.code === 'request_timeout') {
    // Request timed out — safe to retry
  }
}
```

---

## HTTP Status Codes

| Status | Meaning | Retryable |
|--------|---------|-----------|
| 400 | Bad Request — invalid parameters or body | No |
| 401 | Unauthorized — invalid or expired token | Yes (refresh token) |
| 403 | Forbidden — insufficient permissions | No |
| 404 | Not Found — resource does not exist | No |
| 409 | Conflict — invalid state transition | No |
| 422 | Unprocessable Entity — business logic error | No |
| 429 | Too Many Requests — rate limited | Yes (backoff) |
| 500 | Internal Server Error | Yes (backoff) |
| 502 | Bad Gateway | Yes (backoff) |
| 503 | Service Unavailable | Yes (backoff) |

---

## Retry Pattern

Retry only transient errors (429, 500, 502, 503) and network errors:

```typescript
import { PayseraApiError } from '@biggora/paysera';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !isRetryable(err)) {
        throw err;
      }
      const delay = Math.min(1000 * 2 ** attempt, 10_000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof PayseraApiError)) return false;
  if (err.code === 'request_timeout' || err.code === 'network_error') return true;
  if (!err.status) return false;
  return err.status === 429 || err.status >= 500;
}
```

### Usage

```typescript
const order = await withRetry(() => paysera.orders.create({ ... }));
```

---

## Token Handling

The SDK handles OAuth2 tokens automatically:

- **Auto-refresh:** Tokens are refreshed 30 seconds before expiry.
- **Deduplication:** Concurrent requests share a single token fetch.
- **401 recovery:** If you get a 401 and suspect stale tokens, call
  `paysera.clearAccessToken()` and retry.

```typescript
try {
  await paysera.orders.read(orderId);
} catch (err) {
  if (err instanceof PayseraApiError && err.status === 401) {
    paysera.clearAccessToken();
    await paysera.orders.read(orderId); // Will fetch a fresh token
  }
}
```

---

## Common Error Scenarios

### Capturing an Already Captured Payment

```
PayseraApiError: Payment is already captured.
  status: 409, code: "invalid_state"
```

Check payment status before capture:
```typescript
const payment = await paysera.payments.read(paymentId);
if (payment.status === 'authorized') {
  await paysera.payments.capture(paymentId);
}
```

### Refunding More Than Captured Amount

```
PayseraApiError: Refund amount exceeds captured amount.
  status: 422, code: "invalid_parameters"
```

Track cumulative refunds and validate before creating:
```typescript
const refunds = await paysera.refunds.list({ payment_id: paymentId });
const totalRefunded = (refunds.data ?? [])
  .filter((r) => r.status !== 'canceled' && r.status !== 'failed')
  .reduce((sum, r) => sum + Number(r.amount?.amount ?? 0), 0);
const remaining = capturedAmount - totalRefunded;
```

### Canceling a Paid Order

```
PayseraApiError: Cannot cancel order in current state.
  status: 409, code: "invalid_state"
```

Paid orders cannot be canceled. Use refunds instead.

### Webhook Delivery Failures

If your webhook endpoint returns non-2xx or times out, PaySera may retry
delivery. Implement idempotent processing to handle duplicate events:

```typescript
async function handleWebhookEvent(event: PayseraWebhookEvent) {
  const existing = await db.webhookEvents.findUnique({ where: { eventId: event.id } });
  if (existing) return; // Already processed

  await db.webhookEvents.create({ data: { eventId: event.id, processedAt: new Date() } });
  // Process event...
}
```
