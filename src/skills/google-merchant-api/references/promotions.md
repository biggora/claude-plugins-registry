# Promotions Sub-API Reference

Base: `https://merchantapi.googleapis.com/promotions/v1`

Manage promotional offers that display alongside your product listings on Google Shopping.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/{account}/promotions:insert` | Create promotion |
| `GET` | `/accounts/{account}/promotions/{promotion}` | Get promotion |
| `GET` | `/accounts/{account}/promotions` | List promotions |

## Promotion Object

```json
{
  "name": "accounts/123456/promotions/SUMMER_SALE_2024",
  "promotionId": "SUMMER_SALE_2024",
  "contentLanguage": "en",
  "targetCountry": "US",
  "redemptionChannel": ["ONLINE"],
  "promotionStatus": {
    "destinationStatuses": [
      {
        "reportingContext": "FREE_LISTINGS",
        "status": "APPROVED"
      }
    ],
    "itemLevelIssues": []
  },
  "attributes": {
    "longTitle": "20% off all headphones - Summer Sale",
    "promotionDisplayTimePeriod": {
      "startTime": "2024-06-01T00:00:00Z",
      "endTime": "2024-08-31T23:59:59Z"
    },
    "promotionEffectiveTimePeriod": {
      "startTime": "2024-06-01T00:00:00Z",
      "endTime": "2024-08-31T23:59:59Z"
    },
    "offerType": "GENERIC_CODE",
    "genericRedemptionCode": "SUMMER20",
    "percentOff": 20,
    "couponValueType": "PERCENT_OFF",
    "productApplicability": "SPECIFIC_PRODUCTS",
    "productTypeInclusion": ["Electronics > Audio > Headphones"],
    "storeApplicability": "ALL_STORES"
  }
}
```

## Key Fields

### Identification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `promotionId` | string | Required | Unique promotion identifier |
| `contentLanguage` | string | Required | ISO 639-1 language code |
| `targetCountry` | string | Required | CLDR territory code |
| `redemptionChannel[]` | enum[] | Required | `ONLINE`, `IN_STORE`, or both |

### Promotion Attributes

| Field | Type | Description |
|-------|------|-------------|
| `longTitle` | string | Promotion title (max 60 chars) |
| `promotionDisplayTimePeriod` | Interval | When promotion is shown to users |
| `promotionEffectiveTimePeriod` | Interval | When promotion can be redeemed |
| `offerType` | enum | `NO_CODE`, `GENERIC_CODE`, `UNIQUE_CODE` (see below) |
| `genericRedemptionCode` | string | Code for `GENERIC_CODE` type |
| `couponValueType` | enum | Discount type (see below) |

### Discount Types (`couponValueType`)

| Value | Required Fields |
|-------|-----------------|
| `MONEY_OFF` | `moneyOffAmount` (Price object) |
| `PERCENT_OFF` | `percentOff` (integer 1-100) |
| `BUY_M_GET_N_MONEY_OFF` | `minimumPurchaseQuantity`, `getMoney`, `moneyOffAmount` |
| `BUY_M_GET_N_PERCENT_OFF` | `minimumPurchaseQuantity`, `freeGiftValue`, `percentOff` |
| `BUY_M_GET_MONEY_OFF` | `minimumPurchaseQuantity`, `moneyOffAmount` |
| `BUY_M_GET_PERCENT_OFF` | `minimumPurchaseQuantity`, `percentOff` |
| `FREE_GIFT` | `freeGiftDescription`, `freeGiftValue` (optional), `freeGiftItemId` (optional) |
| `FREE_SHIPPING_STANDARD` | (no extra fields) |
| `FREE_SHIPPING_OVERNIGHT` | (no extra fields) |
| `FREE_SHIPPING_TWO_DAY` | (no extra fields) |

### Offer Types

| Value | Description |
|-------|-------------|
| `NO_CODE` | Automatic discount, no code needed |
| `GENERIC_CODE` | Single code shared by all customers |
| `UNIQUE_CODE` | Unique code per customer (requires file upload) |

### Product Targeting

| Field | Type | Description |
|-------|------|-------------|
| `productApplicability` | enum | `ALL_PRODUCTS` or `SPECIFIC_PRODUCTS` |
| `productTypeInclusion[]` | string[] | Product types to include |
| `productTypeExclusion[]` | string[] | Product types to exclude |
| `brandInclusion[]` | string[] | Brands to include |
| `brandExclusion[]` | string[] | Brands to exclude |
| `itemIdInclusion[]` | string[] | Specific offer IDs to include |
| `itemIdExclusion[]` | string[] | Specific offer IDs to exclude |
| `itemGroupIdInclusion[]` | string[] | Item group IDs to include |
| `itemGroupIdExclusion[]` | string[] | Item group IDs to exclude |

### Minimum Purchase

| Field | Type | Description |
|-------|------|-------------|
| `minimumPurchaseAmount` | Price | Minimum cart value |
| `minimumPurchaseQuantity` | int64 | Minimum item count |
| `limitQuantity` | int64 | Max uses per order |
| `limitValue` | Price | Max discount per order |

## Examples

### Percentage Discount with Code

```javascript
const promotion = {
  promotionId: 'SPRING_SALE_2024',
  contentLanguage: 'en',
  targetCountry: 'US',
  redemptionChannel: ['ONLINE'],
  attributes: {
    longTitle: '15% off electronics with code SPRING15',
    promotionDisplayTimePeriod: {
      startTime: '2024-03-01T00:00:00Z',
      endTime: '2024-03-31T23:59:59Z',
    },
    promotionEffectiveTimePeriod: {
      startTime: '2024-03-01T00:00:00Z',
      endTime: '2024-03-31T23:59:59Z',
    },
    offerType: 'GENERIC_CODE',
    genericRedemptionCode: 'SPRING15',
    couponValueType: 'PERCENT_OFF',
    percentOff: 15,
    productApplicability: 'SPECIFIC_PRODUCTS',
    productTypeInclusion: ['Electronics'],
  },
};

await fetch(
  `https://merchantapi.googleapis.com/promotions/v1/accounts/${MERCHANT_ID}/promotions:insert`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(promotion),
  }
);
```

### Free Shipping (No Code)

```javascript
const promotion = {
  promotionId: 'FREE_SHIP_50',
  contentLanguage: 'en',
  targetCountry: 'US',
  redemptionChannel: ['ONLINE'],
  attributes: {
    longTitle: 'Free standard shipping on orders over $50',
    promotionDisplayTimePeriod: {
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-12-31T23:59:59Z',
    },
    promotionEffectiveTimePeriod: {
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-12-31T23:59:59Z',
    },
    offerType: 'NO_CODE',
    couponValueType: 'FREE_SHIPPING_STANDARD',
    productApplicability: 'ALL_PRODUCTS',
    minimumPurchaseAmount: { amountMicros: '50000000', currencyCode: 'USD' },
  },
};
```

### Linking Promotions to Products

Add the `promotionIds` field to product inputs:

```javascript
const productInput = {
  offerId: 'SKU-001',
  contentLanguage: 'en',
  feedLabel: 'US',
  productAttributes: {
    // ... other attributes
    promotionIds: ['SPRING_SALE_2024', 'FREE_SHIP_50'],
  },
};
```
