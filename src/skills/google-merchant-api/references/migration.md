# Migration: Content API for Shopping to Merchant API

The Content API for Shopping (v2.1) sunsets **August 18, 2026**. The Merchant API (v1) is the replacement.

## Key Architectural Changes

### 1. Products Split into Input + Output

**Content API:** Single `products` resource for read and write.

**Merchant API:** Split into:
- `productInputs` - What you submit (write)
- `products` - What Google processed (read-only, includes status)

This means `productstatuses` is gone — status is now part of the `products` resource.

### 2. Modular Sub-APIs

**Content API:** Monolithic API with all resources under one service.

**Merchant API:** 14 independent sub-APIs, each with own versioning:
- `products/v1`, `accounts/v1`, `inventories/v1`, `reports/v1`, etc.

### 3. Resource Naming

**Content API ID format:**
```
channel:contentLanguage:targetCountry:offerId
Example: online:en:US:sku123
```

**Merchant API name format:**
```
accounts/{accountId}/products/{contentLanguage}~{feedLabel}~{offerId}
Example: accounts/123456/products/en~US~sku123
```

### 4. Price Format

**Content API:**
```json
{ "value": "79.99", "currency": "USD" }
```

**Merchant API:**
```json
{ "amountMicros": "79990000", "currencyCode": "USD" }
```

Conversion: `amountMicros = value * 1000000`

### 5. Field Nesting

**Content API:** Flat top-level attributes.
```json
{
  "offerId": "SKU-001",
  "title": "My Product",
  "price": { "value": "79.99", "currency": "USD" }
}
```

**Merchant API:** Attributes nested under `productAttributes`.
```json
{
  "offerId": "SKU-001",
  "productAttributes": {
    "title": "My Product",
    "price": { "amountMicros": "79990000", "currencyCode": "USD" }
  }
}
```

### 6. targetCountry → feedLabel

`targetCountry` is renamed to `feedLabel`. Values are the same (e.g., `US`, `GB`).

### 7. Batching

**Content API:** `customBatch` methods.

**Merchant API:** No custom batch. Use async parallel requests or HTTP batching instead.

### 8. Data Source Required

All `productInputs` write operations require a `dataSource` query parameter:
```
POST /products/v1/accounts/{id}/productInputs:insert?dataSource=accounts/{id}/dataSources/{dsId}
```

### 9. Base64url Encoding

Product names containing special characters (`% . + / : ~ , ( * ! ) & ? = @ # $`) must use unpadded base64url encoding (RFC 4648 Section 5).

## Method Mapping

| Content API Method | Merchant API Method |
|-------------------|---------------------|
| `products.insert` | `productInputs:insert` |
| `products.update` | `productInputs:patch` |
| `products.delete` | `productInputs:delete` |
| `products.get` | `products.get` |
| `products.list` | `products.list` |
| `products.custombatch` | Async parallel requests |
| `productstatuses.get` | `products.get` (status included) |
| `productstatuses.list` | `products.list` (status included) |
| `productstatuses.custombatch` | Async parallel requests |
| `accounts.get` | `accounts.get` |
| `accounts.list` | `accounts.list` |
| `accounts.update` | `accounts.patch` |
| `accounts.insert` | `accounts:createAndConfigure` |
| `accounts.delete` | `accounts.delete` |
| `accountstatuses.get` | `accounts/{id}/issues.list` |
| `datafeeds.*` | `dataSources.*` |
| `datafeedstatuses.*` | `dataSources/{id}/fileUploads/{id}` |
| `liasettings.*` | `omnichannelSettings.*` |
| `shippingsettings.*` | `shippingSettings.*` |
| `regions.*` | `regions.*` |
| `returnpolicy.*` | `onlineReturnPolicies.*` |

## Migration Strategy

### Recommended Order

1. **Accounts** - Foundation for everything else
2. **Products** - Core product management
3. **Data Sources** - Feed management (compatible across APIs)
4. **Reports** - Performance data
5. **Everything else** - Promotions, inventory, notifications, etc.

### Incremental Approach

You can migrate one sub-API at a time. Content API and Merchant API can coexist:
- Data sources created with Content API work with Merchant API
- Products inserted via Content API are visible through Merchant API
- Migrate sub-APIs independently, test each before moving to the next

### Code Migration Example

**Before (Content API):**
```javascript
// Insert product
const response = await fetch(
  `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT_ID}/products`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId: 'SKU-001',
      title: 'Premium Headphones',
      description: 'Great headphones',
      link: 'https://example.com/product',
      imageLink: 'https://example.com/image.jpg',
      contentLanguage: 'en',
      targetCountry: 'US',
      channel: 'online',
      availability: 'in stock',
      condition: 'new',
      price: { value: '79.99', currency: 'USD' },
      brand: 'AudioBrand',
      gtin: '0123456789012',
    }),
  }
);

// Get product status
const status = await fetch(
  `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT_ID}/productstatuses/online:en:US:SKU-001`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

**After (Merchant API):**
```javascript
// Insert product input
const response = await fetch(
  `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/productInputs:insert?dataSource=accounts/${MERCHANT_ID}/dataSources/${DS_ID}`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId: 'SKU-001',
      contentLanguage: 'en',
      feedLabel: 'US',
      productAttributes: {
        title: 'Premium Headphones',
        description: 'Great headphones',
        link: 'https://example.com/product',
        imageLink: 'https://example.com/image.jpg',
        availability: 'in_stock',
        condition: 'new',
        price: { amountMicros: '79990000', currencyCode: 'USD' },
        brand: 'AudioBrand',
        gtin: '0123456789012',
        channel: 'ONLINE',
      },
    }),
  }
);

// Get product (includes status)
const product = await fetch(
  `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/products/en~US~SKU-001`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
// product.productStatus contains destinationStatuses and itemLevelIssues
```

## Price Conversion Helper

```javascript
// Content API price → Merchant API price
function toMerchantPrice(contentPrice) {
  return {
    amountMicros: String(Math.round(parseFloat(contentPrice.value) * 1_000_000)),
    currencyCode: contentPrice.currency,
  };
}

// Merchant API price → Content API price
function toContentPrice(merchantPrice) {
  return {
    value: String(parseInt(merchantPrice.amountMicros) / 1_000_000),
    currency: merchantPrice.currencyCode,
  };
}
```

```python
# Content API price → Merchant API price
def to_merchant_price(content_price):
    return {
        'amountMicros': str(round(float(content_price['value']) * 1_000_000)),
        'currencyCode': content_price['currency'],
    }

# Merchant API price → Content API price
def to_content_price(merchant_price):
    return {
        'value': str(int(merchant_price['amountMicros']) / 1_000_000),
        'currency': merchant_price['currencyCode'],
    }
```

## Product ID Conversion

```javascript
// Content API ID → Merchant API name
function toMerchantProductName(contentId, accountId) {
  // contentId format: "online:en:US:sku123"
  const [channel, lang, country, ...offerId] = contentId.split(':');
  const offer = offerId.join(':');
  const prefix = channel === 'local' ? 'local~' : '';
  return `accounts/${accountId}/products/${prefix}${lang}~${country}~${offer}`;
}

// Merchant API name → Content API ID
function toContentProductId(merchantName) {
  // merchantName: "accounts/123/products/en~US~sku123"
  const productPart = merchantName.split('/products/')[1];
  const isLocal = productPart.startsWith('local~');
  const parts = (isLocal ? productPart.slice(6) : productPart).split('~');
  const [lang, feedLabel, ...offerId] = parts;
  const channel = isLocal ? 'local' : 'online';
  return `${channel}:${lang}:${feedLabel}:${offerId.join('~')}`;
}
```
