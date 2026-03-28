# Products Sub-API Reference

Base: `https://merchantapi.googleapis.com/products/v1`

## Resources

### ProductInput (Write)

Used to submit product data. Changes take several minutes to process.

**Endpoints:**
- `POST /accounts/{account}/productInputs:insert` - Insert product
- `PATCH /accounts/{account}/productInputs/{productInput}` - Update product
- `DELETE /accounts/{account}/productInputs/{productInput}` - Delete product

All write operations require `dataSource` query parameter:
```
?dataSource=accounts/{account}/dataSources/{dataSourceId}
```

**ProductInput fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Output | `accounts/{account}/productInputs/{id}` |
| `product` | string | Output | Name of processed product |
| `offerId` | string | Required, immutable | Your unique SKU/ID |
| `contentLanguage` | string | Required, immutable | ISO 639-1 (e.g., `en`) |
| `feedLabel` | string | Required, immutable | Max 20 chars, A-Z 0-9 hyphen underscore |
| `legacyLocal` | boolean | Optional, immutable | Set true for local-only products |
| `productAttributes` | object | Optional | All product attributes (see below) |
| `customAttributes[]` | array | Optional | Max 2500 attrs, 102.4KB total |
| `versionNumber` | int64 | Optional, immutable | Prevents out-of-order updates |

### Product (Read-only)

The processed product with status and validation results.

**Endpoints:**
- `GET /accounts/{account}/products/{product}` - Get single product
- `GET /accounts/{account}/products` - List products (paginated)

**Product fields include everything from ProductInput plus:**

| Field | Type | Description |
|-------|------|-------------|
| `productStatus` | object | Processing status, destination statuses, item-level issues |
| `productStatus.destinationStatuses[]` | array | Per-destination approval status |
| `productStatus.itemLevelIssues[]` | array | Validation warnings/errors |

## ProductAttributes

All typed product attributes live under `productAttributes`:

### Identity

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Product name (max 150 chars) |
| `description` | string | Product description (max 5000 chars) |
| `link` | string | Landing page URL |
| `canonicalLink` | string | Canonical URL |
| `imageLink` | string | Primary image (min 100x100px) |
| `additionalImageLinks[]` | string[] | Up to 10 additional images |
| `brand` | string | Brand name |
| `gtin` | string | Global Trade Item Number |
| `mpn` | string | Manufacturer Part Number |
| `identifierExists` | boolean | False if no GTIN/MPN/brand |

### Classification

| Field | Type | Description |
|-------|------|-------------|
| `googleProductCategory` | string | Google taxonomy ID or path |
| `productTypes[]` | string[] | Your own category hierarchy |
| `channel` | enum | `ONLINE` or `LOCAL` |
| `condition` | enum | `new`, `refurbished`, `used` |
| `adult` | boolean | Adult content flag |
| `ageGroup` | enum | `newborn`, `infant`, `toddler`, `kids`, `adult` |
| `gender` | enum | `male`, `female`, `unisex` |

### Pricing

| Field | Type | Description |
|-------|------|-------------|
| `price` | Price | Regular price |
| `salePrice` | Price | Sale price |
| `salePriceEffectiveDate` | Interval | When sale price applies |
| `costOfGoodsSold` | Price | COGS for reporting |
| `autoPricingMinPrice` | Price | Minimum for auto-pricing |
| `installment` | Installment | Monthly payment info |
| `subscriptionCost` | SubscriptionCost | Recurring charge |
| `loyaltyPrograms[]` | LoyaltyProgram[] | Loyalty pricing |

**Price object (Merchant API v1):**
```json
{
  "amountMicros": "79990000",
  "currencyCode": "USD"
}
```
1 unit = 1,000,000 micros. $79.99 = `79990000`.

**Installment object:**
```json
{
  "months": "12",
  "amount": { "amountMicros": "6660000", "currencyCode": "USD" },
  "downpayment": { "amountMicros": "0", "currencyCode": "USD" },
  "creditType": "finance"
}
```

### Availability & Inventory

| Field | Type | Values |
|-------|------|--------|
| `availability` | enum | `in_stock`, `out_of_stock`, `preorder`, `backorder` |
| `availabilityDate` | Timestamp | When preorder/backorder becomes available |
| `expirationDate` | Timestamp | Auto-deletion date (max 30 days) |
| `sellOnGoogleQuantity` | int64 | Buy on Google quantity |

### Shipping & Dimensions

| Field | Type | Description |
|-------|------|-------------|
| `shipping[]` | Shipping[] | Per-country/region shipping overrides |
| `shippingWeight` | Weight | Package weight |
| `shippingLength` | Dimension | Package length |
| `shippingWidth` | Dimension | Package width |
| `shippingHeight` | Dimension | Package height |
| `shippingLabel` | string | Maps to account-level shipping settings |
| `transitTimeLabel` | string | Maps to transit time tables |
| `freeShippingThreshold[]` | FreeShippingThreshold[] | Free shipping minimums |
| `minHandlingTime` | int64 | Business days |
| `maxHandlingTime` | int64 | Business days |

**Shipping object:**
```json
{
  "price": { "amountMicros": "5990000", "currencyCode": "USD" },
  "country": "US",
  "region": "CA",
  "service": "Standard",
  "minHandlingTime": "0",
  "maxHandlingTime": "1",
  "minTransitTime": "3",
  "maxTransitTime": "7"
}
```

### Physical Attributes

| Field | Type | Description |
|-------|------|-------------|
| `color` | string | Product color |
| `material` | string | Material composition |
| `pattern` | string | Design pattern |
| `sizes[]` | string[] | Available sizes |
| `sizeSystem` | enum | Sizing system (US, EU, UK, etc.) |
| `sizeType` | enum | `regular`, `petite`, `plus`, `big_and_tall`, `maternity` |
| `productHeight` | Dimension | Product height |
| `productLength` | Dimension | Product length |
| `productWidth` | Dimension | Product width |
| `productWeight` | Weight | Product weight |
| `itemGroupId` | string | Groups variants together |
| `multipack` | int64 | Number of identical items in pack |
| `isBundle` | boolean | Merchant-defined bundle |

### Destinations & Ads

| Field | Type | Description |
|-------|------|-------------|
| `includedDestinations[]` | string[] | Opt-in destinations |
| `excludedDestinations[]` | string[] | Opt-out destinations |
| `adsRedirect` | string | Ads-specific redirect URL |
| `adsLabels[]` | string[] | Campaign grouping labels |
| `customLabel0` - `customLabel4` | string | Shopping campaign labels |
| `promotionIds[]` | string[] | Associated promotion IDs |
| `pause` | string | Set to `"ads"` to pause |

### Structured Content

```json
{
  "structuredTitle": {
    "content": "AI-optimized product title",
    "digitalSourceType": "trained_algorithmic_media"
  },
  "structuredDescription": {
    "content": "AI-optimized description",
    "digitalSourceType": "trained_algorithmic_media"
  }
}
```

### Tax (Content API only, auto-calculated in Merchant API)

```json
{
  "taxes": [
    {
      "rate": 8.25,
      "country": "US",
      "region": "TX",
      "taxShip": true
    }
  ]
}
```

### Certifications

```json
{
  "certifications": [
    {
      "certificationAuthority": "European_Commission",
      "certificationName": "EPREL",
      "certificationCode": "123456",
      "certificationValue": "A+"
    }
  ]
}
```

### Product Details & Highlights

```json
{
  "productDetails": [
    {
      "sectionName": "Technical Specs",
      "attributeName": "Battery Life",
      "attributeValue": "30 hours"
    }
  ],
  "productHighlights": [
    "Active noise cancellation",
    "30-hour battery life",
    "Bluetooth 5.3"
  ]
}
```

## Insert Example (Full)

```javascript
const productInput = {
  offerId: 'HEADPHONE-PRO-001',
  contentLanguage: 'en',
  feedLabel: 'US',
  productAttributes: {
    title: 'ProAudio X500 Wireless Headphones',
    description: 'Premium noise-cancelling headphones with 30hr battery, Bluetooth 5.3, and Hi-Res audio support.',
    link: 'https://store.example.com/proaudio-x500',
    imageLink: 'https://cdn.example.com/images/x500-main.jpg',
    additionalImageLinks: [
      'https://cdn.example.com/images/x500-side.jpg',
      'https://cdn.example.com/images/x500-case.jpg',
    ],
    availability: 'in_stock',
    condition: 'new',
    price: { amountMicros: '149990000', currencyCode: 'USD' },
    salePrice: { amountMicros: '119990000', currencyCode: 'USD' },
    brand: 'ProAudio',
    gtin: '0123456789012',
    googleProductCategory: 'Electronics > Audio > Headphones',
    productTypes: ['Electronics', 'Audio', 'Wireless Headphones'],
    channel: 'ONLINE',
    color: 'Midnight Black',
    sizes: ['One Size'],
    itemGroupId: 'X500-GROUP',
    shipping: [
      {
        price: { amountMicros: '0', currencyCode: 'USD' },
        country: 'US',
        service: 'Free Standard',
        minTransitTime: '3',
        maxTransitTime: '7',
      },
    ],
    productHighlights: [
      'Active noise cancellation with transparency mode',
      '30-hour battery, 5-min quick charge for 3 hours',
      'Bluetooth 5.3 with multipoint connection',
    ],
    customLabel0: 'electronics-sale',
    customLabel1: 'high-margin',
  },
  customAttributes: [
    { name: 'warranty_years', value: '2' },
    { name: 'driver_size_mm', value: '40' },
  ],
};
```

## Pagination

List responses include `nextPageToken`:

```javascript
let pageToken = '';
const allProducts = [];

do {
  const url = new URL(`https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/products`);
  url.searchParams.set('pageSize', '250');
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  allProducts.push(...(data.products || []));
  pageToken = data.nextPageToken || '';
} while (pageToken);
```
