# Inventories Sub-API Reference

Base: `https://merchantapi.googleapis.com/inventories/v1`

Manage product availability and pricing at the store level (local) or region level (regional).

## Local Inventories

Store-level inventory for brick-and-mortar locations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/{account}/products/{product}/localInventories` | Insert/update local inventory |
| `GET` | `/accounts/{account}/products/{product}/localInventories` | List local inventories |
| `DELETE` | `/accounts/{account}/products/{product}/localInventories/{storeCode}` | Delete local inventory |

### LocalInventory Object

```json
{
  "name": "accounts/123456/products/en~US~SKU001/localInventories/STORE-NYC-01",
  "account": "accounts/123456",
  "storeCode": "STORE-NYC-01",
  "availability": "in_stock",
  "price": {
    "amountMicros": "69990000",
    "currencyCode": "USD"
  },
  "salePrice": {
    "amountMicros": "59990000",
    "currencyCode": "USD"
  },
  "salePriceEffectiveDate": {
    "startTime": "2024-12-01T00:00:00Z",
    "endTime": "2024-12-31T23:59:59Z"
  },
  "quantity": "25",
  "pickupMethod": "buy",
  "pickupSla": "same day",
  "instoreProductLocation": "Aisle 5, Shelf B",
  "customAttributes": [
    { "name": "display_unit", "value": "true" }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `storeCode` | string | Required | Your store identifier (must match Google Business Profile) |
| `availability` | enum | Optional | `in_stock`, `out_of_stock`, `preorder`, `backorder` |
| `price` | Price | Optional | Store-specific price override |
| `salePrice` | Price | Optional | Store-specific sale price |
| `salePriceEffectiveDate` | Interval | Optional | Sale period |
| `quantity` | int64 | Optional | Stock quantity |
| `pickupMethod` | enum | Optional | `buy`, `reserve`, `ship_to_store`, `not_supported` |
| `pickupSla` | enum | Optional | `same_day`, `next_day`, `2_day` ... `7_day`, `multi_week` |
| `instoreProductLocation` | string | Optional | Physical location in store |
| `customAttributes[]` | array | Optional | Additional attributes |

### Insert Example

```javascript
const MERCHANT_ID = '123456';
const PRODUCT_ID = 'en~US~SKU001';

const localInventory = {
  storeCode: 'STORE-NYC-01',
  availability: 'in_stock',
  price: { amountMicros: '69990000', currencyCode: 'USD' },
  quantity: '25',
  pickupMethod: 'buy',
  pickupSla: 'same_day',
};

const response = await fetch(
  `https://merchantapi.googleapis.com/inventories/v1/accounts/${MERCHANT_ID}/products/${PRODUCT_ID}/localInventories`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(localInventory),
  }
);
```

## Regional Inventories

Region-level overrides for pricing and availability based on geographic regions you define.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/{account}/products/{product}/regionalInventories` | Insert/update regional inventory |
| `GET` | `/accounts/{account}/products/{product}/regionalInventories` | List regional inventories |
| `DELETE` | `/accounts/{account}/products/{product}/regionalInventories/{region}` | Delete regional inventory |

### RegionalInventory Object

```json
{
  "name": "accounts/123456/products/en~US~SKU001/regionalInventories/northeast",
  "account": "accounts/123456",
  "region": "northeast",
  "availability": "in_stock",
  "price": {
    "amountMicros": "74990000",
    "currencyCode": "USD"
  },
  "salePrice": {
    "amountMicros": "64990000",
    "currencyCode": "USD"
  },
  "salePriceEffectiveDate": {
    "startTime": "2024-12-01T00:00:00Z",
    "endTime": "2024-12-31T23:59:59Z"
  },
  "customAttributes": []
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `region` | string | Required | Region ID (must be defined via Accounts > Regions) |
| `availability` | enum | Optional | Same as local inventory |
| `price` | Price | Optional | Region-specific price override |
| `salePrice` | Price | Optional | Region-specific sale price |
| `salePriceEffectiveDate` | Interval | Optional | Sale period |
| `customAttributes[]` | array | Optional | Additional attributes |

### Workflow: Set Up Regional Pricing

1. **Define regions** via the Accounts sub-API:
```javascript
// Create a region
await fetch(
  `https://merchantapi.googleapis.com/accounts/v1/accounts/${MERCHANT_ID}/regions`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'US Northeast',
      postalCodeArea: {
        regionCode: 'US',
        postalCodes: [
          { begin: '10000', end: '14999' },
          { begin: '06000', end: '06999' },
        ],
      },
    }),
  }
);
```

2. **Set regional inventory** for products:
```javascript
await fetch(
  `https://merchantapi.googleapis.com/inventories/v1/accounts/${MERCHANT_ID}/products/en~US~SKU001/regionalInventories`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region: 'northeast',
      price: { amountMicros: '74990000', currencyCode: 'USD' },
      availability: 'in_stock',
    }),
  }
);
```

## Bulk Inventory Updates

For updating many products' inventory, use async parallel requests:

```javascript
// Update inventory for multiple products in parallel
const inventoryUpdates = [
  { productId: 'en~US~SKU001', storeCode: 'STORE-01', quantity: '50', availability: 'in_stock' },
  { productId: 'en~US~SKU002', storeCode: 'STORE-01', quantity: '0', availability: 'out_of_stock' },
  { productId: 'en~US~SKU003', storeCode: 'STORE-01', quantity: '12', availability: 'in_stock' },
];

const results = await Promise.allSettled(
  inventoryUpdates.map(({ productId, ...inventory }) =>
    fetch(
      `https://merchantapi.googleapis.com/inventories/v1/accounts/${MERCHANT_ID}/products/${productId}/localInventories`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory),
      }
    )
  )
);
```

Respect rate limits — implement exponential backoff for `429` responses.
