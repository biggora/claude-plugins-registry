---
name: google-merchant-api
description: "Use this skill whenever the user wants to work with Google Merchant Center APIs, including the new Merchant API (v1) or the legacy Content API for Shopping (v2.1). Triggers include: uploading or managing products, product feeds, inventory management (local/regional), promotions, data sources, reports, merchant reviews, product reviews, shipping settings, account management, order tracking, conversion sources, or any Google Shopping integration. Also use for tasks like \"add products to Google Shopping\", \"sync inventory with Merchant Center\", \"set up product feeds\", \"manage promotions\", \"get shopping performance reports\", \"migrate from Content API to Merchant API\", \"configure shipping in Merchant Center\", or \"upload product data to Google\". Use this skill even when the user mentions e-commerce product feeds, Google Shopping listings, or product data specifications without explicitly naming the API."
---

# Google Merchant API

Programmatically manage Google Merchant Center accounts, products, inventory, promotions, and more.

## API Landscape

Google provides two APIs for Merchant Center. The **Merchant API (v1)** is the current standard. The **Content API for Shopping (v2.1)** is the legacy API, sunsetting **August 18, 2026**.

| Aspect | Merchant API (v1) | Content API for Shopping (v2.1) |
|--------|-------------------|----------------------------------|
| Base URL | `https://merchantapi.googleapis.com` | `https://shoppingcontent.googleapis.com` |
| Transport | gRPC (default) + REST | REST only |
| Status | Active, GA | Sunset August 18, 2026 |
| Design | Modular sub-APIs | Monolithic |
| Batching | Async / HTTP batching | `customBatch` methods |

**Always prefer the Merchant API for new integrations.** Only use Content API if maintaining legacy code or if a feature hasn't migrated yet.

## Authentication

Both APIs use Google OAuth 2.0. Two approaches:

### Service Account (server-to-server)

Best for automated backends. Create a service account in Google Cloud Console, download the JSON key, and grant it access in Merchant Center.

```javascript
// Node.js with google-auth-library
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
  keyFile: 'service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/content'],
});
const client = await auth.getClient();
const token = await client.getAccessToken();
```

```python
# Python with google-auth
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    'service-account-key.json',
    scopes=['https://www.googleapis.com/auth/content']
)
```

### OAuth 2.0 Client (user-interactive)

Best for apps acting on behalf of merchants. Requires consent flow.

```javascript
// Node.js OAuth2 flow
const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/content'],
});

// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
```

**Required scope:** `https://www.googleapis.com/auth/content`

### Setup Prerequisites

1. Create a Google Cloud project
2. Enable the "Google Merchant API" (or "Content API for Shopping" for legacy)
3. Create credentials (service account or OAuth client)
4. Register the GCP project with your Merchant Center account via developer registration

## Merchant API Architecture

The Merchant API is organized into **14 independent sub-APIs**, each versioned separately:

| Sub-API | Purpose | Stable Version |
|---------|---------|----------------|
| **Accounts** | Account settings, users, shipping, business info, programs | v1 |
| **Products** | Product inputs and processed products | v1 |
| **Inventories** | Local and regional inventory | v1 |
| **Data Sources** | Feed management (API, file, autofeed) | v1 |
| **Reports** | Performance and market insights | v1 |
| **Promotions** | Promotional campaigns | v1 |
| **Conversions** | Conversion source tracking | v1 |
| **Notifications** | Push notifications for product changes | v1 |
| **Reviews** | Product and merchant reviews | v1beta |
| **Order Tracking** | Shipping signal tracking | v1 |
| **LFP** | Local Feeds Partnership | v1 |
| **Quota** | API usage limits | v1 |
| **Issue Resolution** | Product/account issue handling | v1 |
| **Product Studio** | AI-powered image/text generation | v1alpha |

For detailed endpoints and schemas for each sub-API, read the corresponding file in `references/`.

## URL Structure

```
https://merchantapi.googleapis.com/{SUB_API}/{VERSION}/{RESOURCE_NAME}:{METHOD}
```

Standard REST methods (GET, POST, PATCH, DELETE) omit the `:{METHOD}` suffix. Custom methods use the suffix.

**Examples:**
```
GET    .../products/v1/accounts/123456/products/en~US~sku123
POST   .../products/v1/accounts/123456/productInputs:insert
DELETE .../products/v1/accounts/123456/productInputs/en~US~sku123
POST   .../reports/v1/accounts/123456/reports:search
```

## Resource Naming

Resources use hierarchical names instead of flat IDs:

```
accounts/{account_id}
accounts/{account_id}/products/{product_id}
accounts/{account_id}/products/{product_id}/localInventories/{store_code}
accounts/{account_id}/products/{product_id}/regionalInventories/{region_id}
```

**Product identifier format:** `{contentLanguage}~{feedLabel}~{offerId}`
- Example: `en~US~sku123`
- Legacy local products: prefix with `local~` (e.g., `local~en~US~sku123`)

**Base64url encoding required** when product names contain special characters: `% . + / : ~ , ( * ! ) & ? = @ # $`

## Core Workflows

### Insert a Product

Products are managed through the split `productInputs` (write) / `products` (read) model.

```javascript
// Node.js - Insert a product via Merchant API
const fetch = require('node-fetch');

const MERCHANT_ID = '123456789';
const DATA_SOURCE_ID = '987654321';

const productInput = {
  offerId: 'SKU-001',
  contentLanguage: 'en',
  feedLabel: 'US',
  productAttributes: {
    title: 'Premium Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones with 30hr battery',
    link: 'https://example.com/headphones',
    imageLink: 'https://example.com/images/headphones.jpg',
    availability: 'in_stock',
    condition: 'new',
    price: { amountMicros: '79990000', currencyCode: 'USD' }, // $79.99
    brand: 'AudioBrand',
    gtin: '0123456789012',
    googleProductCategory: 'Electronics > Audio > Headphones',
    channel: 'ONLINE',
  },
};

const response = await fetch(
  `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/productInputs:insert?dataSource=accounts/${MERCHANT_ID}/dataSources/${DATA_SOURCE_ID}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productInput),
  }
);
```

```python
# Python - Insert a product via Merchant API
import requests

MERCHANT_ID = '123456789'
DATA_SOURCE_ID = '987654321'

product_input = {
    'offerId': 'SKU-001',
    'contentLanguage': 'en',
    'feedLabel': 'US',
    'productAttributes': {
        'title': 'Premium Wireless Headphones',
        'description': 'Noise-cancelling Bluetooth headphones with 30hr battery',
        'link': 'https://example.com/headphones',
        'imageLink': 'https://example.com/images/headphones.jpg',
        'availability': 'in_stock',
        'condition': 'new',
        'price': {'amountMicros': '79990000', 'currencyCode': 'USD'},
        'brand': 'AudioBrand',
        'gtin': '0123456789012',
        'googleProductCategory': 'Electronics > Audio > Headphones',
        'channel': 'ONLINE',
    },
}

response = requests.post(
    f'https://merchantapi.googleapis.com/products/v1/accounts/{MERCHANT_ID}/productInputs:insert',
    params={'dataSource': f'accounts/{MERCHANT_ID}/dataSources/{DATA_SOURCE_ID}'},
    headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
    json=product_input,
)
```

**The `dataSource` query parameter is required for all write operations.**

### List Products

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://merchantapi.googleapis.com/products/v1/accounts/$MERCHANT_ID/products?pageSize=50"
```

Response includes pagination:
```json
{
  "products": [...],
  "nextPageToken": "abc123"
}
```
Pass `pageToken=abc123` for the next page.

### Update Inventory

```javascript
// Update local inventory for a store
const localInventory = {
  storeCode: 'STORE-NYC-01',
  availability: 'in_stock',
  price: { amountMicros: '69990000', currencyCode: 'USD' },
  quantity: '25',
};

await fetch(
  `https://merchantapi.googleapis.com/inventories/v1/accounts/${MERCHANT_ID}/products/en~US~SKU-001/localInventories`,
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

### Query Reports

```javascript
// Get product performance data
const query = {
  query: `
    SELECT
      segments.offer_id,
      segments.title,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr
    FROM product_performance_view
    WHERE segments.date BETWEEN '2024-01-01' AND '2024-01-31'
    ORDER BY metrics.clicks DESC
    LIMIT 100
  `,
};

const response = await fetch(
  `https://merchantapi.googleapis.com/reports/v1/accounts/${MERCHANT_ID}/reports:search`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  }
);
```

Reports use a **SQL-like query language** with `SELECT`, `FROM`, `WHERE`, `ORDER BY`, and `LIMIT`.

Available report tables:
- `product_performance_view` - Clicks, impressions, CTR
- `non_product_performance_view` - Website traffic analytics
- `price_competitiveness_product_view` - Price benchmarking
- `price_insights_product_view` - Pricing optimization
- `best_sellers_product_cluster_view` - Top products
- `best_sellers_brand_view` - Top brands
- `competitive_visibility_competitor_view` - Market share

## Product Data Types & Formats

### Price Object (Merchant API v1)

```json
{
  "amountMicros": "79990000",
  "currencyCode": "USD"
}
```
`amountMicros` = price in micros (1 unit = 1,000,000 micros). So $79.99 = `79990000`.

### Price Object (Content API v2.1)

```json
{
  "value": "79.99",
  "currency": "USD"
}
```

### Key Enums

**Availability:**
- `in_stock`, `out_of_stock`, `preorder`, `backorder`

**Condition:**
- `new`, `refurbished`, `used`

**Channel:**
- `ONLINE`, `LOCAL` (Merchant API)
- `"online"`, `"local"` (Content API)

**Age Group:**
- `newborn`, `infant`, `toddler`, `kids`, `adult`

**Gender:**
- `male`, `female`, `unisex`

### Required Product Fields

At minimum, every product needs:

| Field | Description |
|-------|-------------|
| `offerId` | Your unique product identifier |
| `contentLanguage` | ISO 639-1 language code (e.g., `en`) |
| `feedLabel` | Target market (e.g., `US`, `GB`) |
| `title` | Product name (max 150 chars) |
| `description` | Product description (max 5000 chars) |
| `link` | Landing page URL |
| `imageLink` | Primary image URL (min 100x100px, max 64MB) |
| `availability` | Stock status |
| `price` | Product price with currency |
| `channel` | `ONLINE` or `LOCAL` |

**Conditionally required:**
- `brand` - Required for all products except movies, books, musical recordings
- `gtin` - Required for all products with a known GTIN
- `condition` - Required if product is used or refurbished
- `googleProductCategory` - Strongly recommended; required for some categories

### Custom Attributes

For attributes not covered by typed fields, use custom attributes (max 2500 per product, 102.4KB total):

```json
{
  "customAttributes": [
    { "name": "warranty_years", "value": "3" },
    { "name": "compatible_with", "value": "Model X, Model Y" }
  ]
}
```

## Feed Formats

### API (Recommended)

Use `productInputs:insert` / `productInputs:patch` for real-time updates.

### File-Based Feeds

Supported formats for file data sources:

**Tab-Separated Values (TSV):**
```
id	title	description	link	image_link	availability	price	brand	gtin	condition
SKU-001	Premium Headphones	Noise-cancelling...	https://...	https://...	in stock	79.99 USD	AudioBrand	0123456789012	new
```

**XML (Atom/RSS):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:g="http://base.google.com/ns/1.0">
  <title>Product Feed</title>
  <entry>
    <g:id>SKU-001</g:id>
    <g:title>Premium Headphones</g:title>
    <g:description>Noise-cancelling...</g:description>
    <g:link>https://example.com/headphones</g:link>
    <g:image_link>https://example.com/images/headphones.jpg</g:image_link>
    <g:availability>in stock</g:availability>
    <g:price>79.99 USD</g:price>
    <g:brand>AudioBrand</g:brand>
    <g:gtin>0123456789012</g:gtin>
    <g:condition>new</g:condition>
  </entry>
</feed>
```

File feeds use **snake_case** attribute names (e.g., `image_link`), while the API uses **camelCase** (e.g., `imageLink`).

## Data Sources

Data sources define how product data flows into Merchant Center:

| Type | Description |
|------|-------------|
| **Primary API** | Products inserted via API |
| **Primary File** | Products from file upload (scheduled fetch or direct upload) |
| **Supplemental API** | Supplements primary with additional attributes via API |
| **Supplemental File** | Supplements primary with additional attributes via file |
| **Autofeed** | Google auto-crawls your site for product data |

```javascript
// Create a primary API data source
const dataSource = {
  displayName: 'My API Feed',
  primaryProductDataSource: {
    channel: 'ONLINE_PRODUCTS',
    contentLanguage: 'en',
    feedLabel: 'US',
  },
};

await fetch(
  `https://merchantapi.googleapis.com/datasources/v1/accounts/${MERCHANT_ID}/dataSources`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(dataSource),
  }
);
```

## Migration: Content API to Merchant API

Read `references/migration.md` for the full migration guide. Key changes:

| Content API | Merchant API |
|-------------|-------------|
| `products.insert` | `productInputs:insert` (write) + `products.get` (read) |
| `products.get` returns mutable data | `products.get` returns processed read-only data |
| `productstatuses` separate service | Status embedded in `products` resource |
| `id` format: `channel:lang:country:offerId` | `name` format: `accounts/{id}/products/lang~feedLabel~offerId` |
| `targetCountry` | `feedLabel` |
| Top-level attributes | Nested under `productAttributes` |
| `customBatch` | Async requests / HTTP batching |
| Price as `{ value, currency }` | Price as `{ amountMicros, currencyCode }` |

## Client Libraries

Google provides official client libraries:

| Language | Package |
|----------|---------|
| Node.js | `@google-shopping/products`, `@google-shopping/accounts`, etc. |
| Python | `google-shopping-merchant-products`, `google-shopping-merchant-accounts`, etc. |
| Java | `google-shopping-merchant-products`, etc. |
| PHP | `google/shopping-merchant-products`, etc. |

Each sub-API has its own package. Install only what you need.

```bash
# Node.js
npm install @google-shopping/products @google-shopping/accounts

# Python
pip install google-shopping-merchant-products google-shopping-merchant-accounts
```

## Error Handling

The API returns standard Google API error responses:

```json
{
  "error": {
    "code": 400,
    "message": "Request contains an invalid argument.",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "INVALID_PRODUCT_INPUT",
        "metadata": {
          "field": "productAttributes.price"
        }
      }
    ]
  }
}
```

Common error codes:
- `400 INVALID_ARGUMENT` - Bad request data
- `401 UNAUTHENTICATED` - Missing or invalid credentials
- `403 PERMISSION_DENIED` - Insufficient access
- `404 NOT_FOUND` - Resource doesn't exist
- `429 RESOURCE_EXHAUSTED` - Rate limit exceeded (implement exponential backoff)
- `409 ALREADY_EXISTS` - Duplicate resource

## Quotas and Rate Limits

Check your current quota usage:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://merchantapi.googleapis.com/quota/v1/accounts/$MERCHANT_ID/quotas"
```

General guidelines:
- Implement **exponential backoff** for `429` errors
- Use async/parallel requests instead of `customBatch`
- Monitor quota consumption through the Quota sub-API
- Spread requests evenly rather than bursting

## Notifications (Push Updates)

Instead of polling for product changes, subscribe to push notifications:

```javascript
const subscription = {
  registeredEvent: 'PRODUCT_STATUS_CHANGE',
  callBackUri: 'https://your-server.com/merchant-webhook',
};

await fetch(
  `https://merchantapi.googleapis.com/notifications/v1/accounts/${MERCHANT_ID}/notificationsubscriptions`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  }
);
```

## Reference Files

For detailed endpoint schemas and examples for each sub-API, consult:

- `references/products.md` - ProductInput fields, Products read, product attributes
- `references/accounts.md` - Account management, shipping, business info, programs, users
- `references/inventories.md` - Local and regional inventory management
- `references/datasources.md` - Data source creation and management
- `references/reports.md` - Report queries, available tables, metrics and segments
- `references/promotions.md` - Promotion creation and management
- `references/migration.md` - Content API to Merchant API migration guide
- `references/content-api-legacy.md` - Content API for Shopping v2.1 reference (for legacy code)

Read the relevant reference file when you need detailed field-level documentation for a specific sub-API.
