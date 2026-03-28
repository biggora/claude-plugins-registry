# Data Sources Sub-API Reference

Base: `https://merchantapi.googleapis.com/datasources/v1`

Manage how product data flows into Merchant Center — via API, file uploads, or automatic crawling.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/{account}/dataSources` | Create data source |
| `GET` | `/accounts/{account}/dataSources/{dataSource}` | Get data source |
| `GET` | `/accounts/{account}/dataSources` | List data sources |
| `PATCH` | `/accounts/{account}/dataSources/{dataSource}` | Update data source |
| `DELETE` | `/accounts/{account}/dataSources/{dataSource}` | Delete data source |
| `POST` | `/accounts/{account}/dataSources/{dataSource}:fetch` | Trigger file fetch |
| `GET` | `/accounts/{account}/dataSources/{dataSource}/fileUploads/{fileUpload}` | Get file upload status |

## Data Source Types

### Primary API Data Source

Products inserted directly via `productInputs:insert`.

```json
{
  "displayName": "My API Feed",
  "primaryProductDataSource": {
    "channel": "ONLINE_PRODUCTS",
    "contentLanguage": "en",
    "feedLabel": "US"
  }
}
```

### Primary File Data Source

Products loaded from a file (URL fetch or direct upload).

```json
{
  "displayName": "Daily Product Feed",
  "primaryProductDataSource": {
    "channel": "ONLINE_PRODUCTS",
    "contentLanguage": "en",
    "feedLabel": "US"
  },
  "fileInput": {
    "fetchSettings": {
      "enabled": true,
      "fetchUri": "https://example.com/feeds/products.xml",
      "timeOfDay": { "hours": 6, "minutes": 0 },
      "dayOfMonth": 0,
      "timeZone": "America/New_York",
      "frequency": "DAILY"
    },
    "fileName": "products.xml",
    "fileInputType": "FETCH"
  }
}
```

### Supplemental API Data Source

Adds/overrides attributes on products from a primary source.

```json
{
  "displayName": "Price Overrides",
  "supplementalProductDataSource": {
    "referencingPrimaryDataSources": [
      "accounts/123456/dataSources/primary-feed-id"
    ]
  }
}
```

### Supplemental File Data Source

```json
{
  "displayName": "Weekly Sale Prices",
  "supplementalProductDataSource": {
    "referencingPrimaryDataSources": [
      "accounts/123456/dataSources/primary-feed-id"
    ]
  },
  "fileInput": {
    "fetchSettings": {
      "enabled": true,
      "fetchUri": "https://example.com/feeds/sale-prices.tsv",
      "frequency": "WEEKLY",
      "dayOfWeek": "MONDAY",
      "timeOfDay": { "hours": 3, "minutes": 0 },
      "timeZone": "America/New_York"
    },
    "fileName": "sale-prices.tsv",
    "fileInputType": "FETCH"
  }
}
```

## Channel Types

| Channel | Description |
|---------|-------------|
| `ONLINE_PRODUCTS` | Online product listings |
| `LOCAL_PRODUCTS` | Local/in-store product listings |
| `PRODUCTS` | Both online and local |

## Fetch Frequency

| Value | Description |
|-------|-------------|
| `DAILY` | Every day at specified time |
| `WEEKLY` | Specified day + time each week |
| `MONTHLY` | Specified day of month + time |

## File Input Types

| Type | Description |
|------|-------------|
| `FETCH` | Google fetches from your URL on schedule |
| `GOOGLE_SHEETS` | Data from a Google Sheet |
| `UPLOAD` | Direct file upload via SFTP or Merchant Center UI |

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Resource name (output only) |
| `dataSourceId` | string | Numeric ID (output only) |
| `displayName` | string | Human-readable name |
| `primaryProductDataSource` | object | Config for primary data source |
| `supplementalProductDataSource` | object | Config for supplemental source |
| `fileInput` | object | File-based fetch/upload settings |
| `input` | enum | `API`, `FILE`, `UI`, `AUTOFEED` (output only) |

## Common Workflows

### Create Primary API Feed and Insert Products

```javascript
// Step 1: Create the data source
const dsResponse = await fetch(
  `https://merchantapi.googleapis.com/datasources/v1/accounts/${MERCHANT_ID}/dataSources`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Product API Feed',
      primaryProductDataSource: {
        channel: 'ONLINE_PRODUCTS',
        contentLanguage: 'en',
        feedLabel: 'US',
      },
    }),
  }
);
const dataSource = await dsResponse.json();
const dataSourceName = dataSource.name; // accounts/123456/dataSources/789

// Step 2: Insert products referencing this data source
await fetch(
  `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/productInputs:insert?dataSource=${dataSourceName}`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId: 'SKU-001',
      contentLanguage: 'en',
      feedLabel: 'US',
      productAttributes: {
        title: 'My Product',
        // ... other attributes
      },
    }),
  }
);
```

### Create Supplemental Feed for Sale Prices

```javascript
// Supplemental feed overrides specific attributes
const dsResponse = await fetch(
  `https://merchantapi.googleapis.com/datasources/v1/accounts/${MERCHANT_ID}/dataSources`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName: 'Sale Price Overrides',
      supplementalProductDataSource: {
        referencingPrimaryDataSources: [primaryDataSourceName],
      },
    }),
  }
);
const supplementalDS = await dsResponse.json();

// Insert supplemental data (only the fields you want to override)
await fetch(
  `https://merchantapi.googleapis.com/products/v1/accounts/${MERCHANT_ID}/productInputs:insert?dataSource=${supplementalDS.name}`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offerId: 'SKU-001',
      contentLanguage: 'en',
      feedLabel: 'US',
      productAttributes: {
        salePrice: { amountMicros: '59990000', currencyCode: 'USD' },
        salePriceEffectiveDate: {
          startTime: '2024-12-01T00:00:00Z',
          endTime: '2024-12-31T23:59:59Z',
        },
      },
    }),
  }
);
```

### Trigger Manual File Fetch

```javascript
await fetch(
  `https://merchantapi.googleapis.com/datasources/v1/accounts/${MERCHANT_ID}/dataSources/${DATA_SOURCE_ID}:fetch`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  }
);
```
