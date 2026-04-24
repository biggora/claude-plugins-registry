# PaySera Checkout V3 API Reference

Detailed HTTP API reference for direct integration without the `@biggora/paysera` SDK.

**Base URL**: `https://api.paysera.com/checkout/v3/`
**Token URL**: `https://api.paysera.com/oauth/token`

## Authentication

PaySera Checkout V3 uses OAuth2 `client_credentials` grant.

### Token Request

```bash
curl -X POST https://api.paysera.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

### Token Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Token Caching

Cache the token for `expires_in` seconds minus a safety margin (30 seconds recommended).
Refresh when `currentTime > tokenAcquiredAt + expiresIn - 30`.

If multiple requests arrive while the token is being refreshed, deduplicate the
token request — make only one request and share the result.

### Using the Token

Include in all API requests:

```
Authorization: Bearer <ACCESS_TOKEN>
Accept: application/json
Content-Type: application/json
```

---

## Orders API

### Create Order

```
POST /orders
```

Request body:
```json
{
  "amount": {
    "amount": "2999",
    "currency": "EUR"
  },
  "description": "Order #1001",
  "order_id": "ORDER-1001",
  "callback_url": "https://yoursite.com/api/paysera/webhook",
  "success_redirect": "https://yoursite.com/success",
  "failure_redirect": "https://yoursite.com/failure",
  "cancel_redirect": "https://yoursite.com/cancel"
}
```

Response:
```json
{
  "id": "ord_abc123",
  "status": "created",
  "amount": { "amount": "2999", "currency": "EUR" },
  "checkout_url": "https://pay.paysera.com/checkout/ord_abc123",
  "order_id": "ORDER-1001"
}
```

Redirect the customer to `checkout_url` to complete payment.

### List Orders

```
GET /orders
GET /orders?status=paid&limit=20&offset=0
```

Response:
```json
{
  "data": [
    { "id": "ord_abc123", "status": "paid", "amount": { "amount": "2999", "currency": "EUR" } }
  ]
}
```

### Read Order

```
GET /orders/:id
```

### Update Order

```
PATCH /orders/:id
```

Request body (partial update):
```json
{
  "description": "Updated description"
}
```

### Cancel Order

```
POST /orders/:id/cancel
```

### Order Statuses

| Status | Description |
|--------|-------------|
| `created` | Order created, awaiting payment |
| `pending` | Payment initiated, processing |
| `paid` | Payment successful |
| `failed` | Payment failed |
| `canceled` | Order canceled by merchant or customer |
| `expired` | Order expired before payment |

---

## Payments API

### List Payments

```
GET /payments
GET /payments?order_id=ord_abc123
```

### Read Payment

```
GET /payments/:id
```

### Capture Payment

Capture an authorized payment. Omit body for full capture.

```
POST /payments/:id/capture
```

Optional body for partial capture:
```json
{
  "amount": { "amount": "1500", "currency": "EUR" }
}
```

### Cancel Payment

```
POST /payments/:id/cancel
```

### Payment Statuses

| Status | Description |
|--------|-------------|
| `pending` | Payment initiated, processing |
| `authorized` | Funds reserved, awaiting capture |
| `captured` | Funds captured successfully |
| `failed` | Payment failed |
| `canceled` | Payment canceled |

---

## Refunds API

### Create Refund

```
POST /refunds
```

Request body:
```json
{
  "payment_id": "pay_xyz789",
  "amount": { "amount": "2999", "currency": "EUR" },
  "description": "Customer requested refund"
}
```

### List Refunds

```
GET /refunds
GET /refunds?payment_id=pay_xyz789
```

### Read Refund

```
GET /refunds/:id
```

### Cancel Refund

```
POST /refunds/:id/cancel
```

### Refund Statuses

| Status | Description |
|--------|-------------|
| `pending` | Refund initiated, processing |
| `succeeded` | Refund completed |
| `failed` | Refund failed |
| `canceled` | Refund canceled |

---

## Webhooks API

### Create Webhook

```
POST /webhooks
```

Request body:
```json
{
  "url": "https://yoursite.com/api/paysera/webhook",
  "event_types": ["order.paid", "order.failed", "payment.captured"]
}
```

### List Webhooks

```
GET /webhooks
```

### Read Webhook

```
GET /webhooks/:id
```

### Update Webhook

```
PATCH /webhooks/:id
```

### Delete Webhook

```
DELETE /webhooks/:id
```

Returns HTTP 204 No Content on success.

---

## Common Types

### PayseraMoney

All monetary amounts use string-based representation:

```json
{
  "amount": "2999",
  "currency": "EUR"
}
```

`amount` is in the smallest currency unit (cents for EUR). The string type
avoids floating-point precision issues.

### PayseraList

Paginated list responses follow this structure:

```json
{
  "data": [ ... ],
  "next": "https://api.paysera.com/checkout/v3/orders?cursor=abc"
}
```

Use the `next` URL for pagination. When `next` is `null`, there are no more pages.

---

## Supported Countries and Currencies

**Primary markets:** Lithuania, Latvia, Estonia (direct bank connections).
**Coverage:** 180+ countries, 30+ currencies.
**Card networks:** Visa, Mastercard, Maestro.
**Payment methods:** Cards, bank transfers, e-wallets, Apple Pay, Google Pay.

### Supported Languages

Use ISO 639-2/B codes for the `language` parameter:

| Code | Language |
|------|----------|
| `LIT` | Lithuanian |
| `LAV` | Latvian |
| `EST` | Estonian |
| `RUS` | Russian |
| `ENG` | English |
| `POL` | Polish |
| `DEU` | German |
| `FRA` | French |
| `SPA` | Spanish |
