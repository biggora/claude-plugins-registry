# Content API for Shopping v2.1 (Legacy Reference)

**Sunset date: August 18, 2026.** Use the Merchant API for new integrations.

Base: `https://shoppingcontent.googleapis.com/content/v2.1`

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/{merchantId}/products` | Insert product |
| `PATCH` | `/{merchantId}/products/{productId}` | Update product |
| `DELETE` | `/{merchantId}/products/{productId}` | Delete product |
| `GET` | `/{merchantId}/products/{productId}` | Get product |
| `GET` | `/{merchantId}/products` | List products |
| `POST` | `/products/batch` | Batch operations |

**Product ID format:** `channel:contentLanguage:targetCountry:offerId`
Example: `online:en:US:SKU-001`

### Insert Product

```javascript
const product = {
  offerId: 'SKU-001',
  title: 'Premium Wireless Headphones',
  description: 'Noise-cancelling Bluetooth headphones',
  link: 'https://example.com/headphones',
  imageLink: 'https://example.com/images/headphones.jpg',
  contentLanguage: 'en',
  targetCountry: 'US',
  channel: 'online',
  availability: 'in stock',
  condition: 'new',
  price: { value: '79.99', currency: 'USD' },
  brand: 'AudioBrand',
  gtin: '0123456789012',
  googleProductCategory: 'Electronics > Audio > Headphones',
};

const response = await fetch(
  `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT_ID}/products`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }
);
```

### Custom Batch

```javascript
const batchRequest = {
  entries: [
    {
      batchId: 1,
      merchantId: MERCHANT_ID,
      method: 'insert',
      product: {
        offerId: 'SKU-001',
        title: 'Product 1',
        // ...
      },
    },
    {
      batchId: 2,
      merchantId: MERCHANT_ID,
      method: 'insert',
      product: {
        offerId: 'SKU-002',
        title: 'Product 2',
        // ...
      },
    },
  ],
};

const response = await fetch(
  `https://shoppingcontent.googleapis.com/content/v2.1/products/batch`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequest),
  }
);
```

## Product Statuses

| Method | Endpoint |
|--------|----------|
| `GET` | `/{merchantId}/productstatuses/{productId}` |
| `GET` | `/{merchantId}/productstatuses` |
| `POST` | `/productstatuses/batch` |

```json
{
  "productId": "online:en:US:SKU-001",
  "title": "Premium Headphones",
  "destinationStatuses": [
    {
      "destination": "SurfacesAcrossGoogle",
      "status": "approved",
      "approvedCountries": ["US"],
      "pendingCountries": [],
      "disapprovedCountries": []
    }
  ],
  "itemLevelIssues": [
    {
      "code": "missing_recommended_attribute",
      "servability": "unaffected",
      "description": "Missing product highlight",
      "detail": "Add product highlights for better visibility",
      "attributeName": "product_highlight"
    }
  ]
}
```

## Accounts

| Method | Endpoint |
|--------|----------|
| `GET` | `/{merchantId}/accounts/{accountId}` |
| `GET` | `/{merchantId}/accounts` |
| `POST` | `/{merchantId}/accounts` |
| `PATCH` | `/{merchantId}/accounts/{accountId}` |
| `DELETE` | `/{merchantId}/accounts/{accountId}` |

## Datafeeds

| Method | Endpoint |
|--------|----------|
| `GET` | `/{merchantId}/datafeeds/{datafeedId}` |
| `GET` | `/{merchantId}/datafeeds` |
| `POST` | `/{merchantId}/datafeeds` |
| `PATCH` | `/{merchantId}/datafeeds/{datafeedId}` |
| `DELETE` | `/{merchantId}/datafeeds/{datafeedId}` |
| `POST` | `/{merchantId}/datafeeds/{datafeedId}/fetchNow` |

```json
{
  "id": "123456789",
  "name": "Daily Product Feed",
  "contentType": "products",
  "fileName": "products.xml",
  "fetchSchedule": {
    "fetchUrl": "https://example.com/feeds/products.xml",
    "hour": 6,
    "timeZone": "America/New_York",
    "dayOfMonth": 0,
    "weekday": "monday",
    "paused": false
  },
  "format": {
    "fileEncoding": "utf-8",
    "quotingMode": "none"
  },
  "targets": [
    {
      "language": "en",
      "country": "US",
      "includedDestinations": ["SurfacesAcrossGoogle", "ShoppingAds"]
    }
  ]
}
```

## Price Object (Content API)

```json
{
  "value": "79.99",
  "currency": "USD"
}
```

`value` is a decimal string. `currency` is ISO 4217.

## Key Enums

**availability:** `in stock`, `out of stock`, `preorder`, `backorder`
(Note: spaces, not underscores — unlike Merchant API)

**condition:** `new`, `refurbished`, `used`

**channel:** `online`, `local`
(Note: lowercase strings — unlike Merchant API enums)

## Pagination

List endpoints support `maxResults` and `pageToken`:

```
GET /{merchantId}/products?maxResults=250&pageToken=abc123
```

## Error Format

```json
{
  "error": {
    "errors": [
      {
        "domain": "content.ContentErrorDomain",
        "reason": "not_found",
        "message": "product not found"
      }
    ],
    "code": 404,
    "message": "product not found"
  }
}
```
