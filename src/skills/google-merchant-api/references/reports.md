# Reports Sub-API Reference

Base: `https://merchantapi.googleapis.com/reports/v1`

Query performance data, competitive insights, and market benchmarks using a SQL-like language.

## Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/{account}/reports:search` | Execute a report query |

## Query Language

Reports use Merchant Center Query Language (MCQL):

```sql
SELECT
  field1,
  field2,
  metric1,
  metric2
FROM table_name
WHERE condition1 AND condition2
ORDER BY metric1 DESC
LIMIT 100
```

## Available Tables

### Performance Tables

| Table | Description |
|-------|-------------|
| `product_performance_view` | Product-level clicks, impressions, CTR, conversions |
| `non_product_performance_view` | Website traffic analytics (non-product pages) |

### Competitive Tables

| Table | Description |
|-------|-------------|
| `price_competitiveness_product_view` | Your prices vs. benchmark prices |
| `price_insights_product_view` | Pricing optimization suggestions |
| `competitive_visibility_competitor_view` | Market share analysis |
| `competitive_visibility_benchmark_view` | Category benchmarks |
| `competitive_visibility_top_merchant_view` | Top merchants in category |

### Best Sellers Tables

| Table | Description |
|-------|-------------|
| `best_sellers_product_cluster_view` | Top-selling product clusters |
| `best_sellers_brand_view` | Top-selling brands |

### Product Status Tables

| Table | Description |
|-------|-------------|
| `product_view` | Product data and status information |

## Common Metrics

| Metric | Description |
|--------|-------------|
| `metrics.clicks` | Total clicks |
| `metrics.impressions` | Total impressions |
| `metrics.ctr` | Click-through rate |
| `metrics.conversions` | Total conversions |
| `metrics.conversionValue` | Total conversion value |
| `metrics.orders` | Total orders |

## Common Segments

| Segment | Description |
|---------|-------------|
| `segments.date` | Date (YYYY-MM-DD) |
| `segments.offerId` | Product offer ID |
| `segments.title` | Product title |
| `segments.brand` | Product brand |
| `segments.categoryL1` - `categoryL5` | Category levels |
| `segments.productTypeL1` - `productTypeL5` | Product type levels |
| `segments.customLabel0` - `customLabel4` | Custom labels |
| `segments.program` | Program (SHOPPING_ADS, FREE_LISTINGS, etc.) |

## Query Examples

### Product Performance by Date

```json
{
  "query": "SELECT segments.date, segments.offerId, segments.title, metrics.clicks, metrics.impressions, metrics.ctr FROM product_performance_view WHERE segments.date BETWEEN '2024-01-01' AND '2024-01-31' ORDER BY metrics.clicks DESC LIMIT 50"
}
```

### Top Products by Conversions

```json
{
  "query": "SELECT segments.offerId, segments.title, segments.brand, metrics.conversions, metrics.conversionValue FROM product_performance_view WHERE segments.date BETWEEN '2024-01-01' AND '2024-03-31' AND segments.program = 'SHOPPING_ADS' ORDER BY metrics.conversions DESC LIMIT 20"
}
```

### Price Competitiveness

```json
{
  "query": "SELECT segments.offerId, segments.title, metrics.benchmarkPrice, metrics.price FROM price_competitiveness_product_view WHERE segments.date = '2024-01-15' ORDER BY segments.offerId"
}
```

### Brand Performance

```json
{
  "query": "SELECT segments.brand, metrics.clicks, metrics.impressions, metrics.ctr FROM product_performance_view WHERE segments.date BETWEEN '2024-01-01' AND '2024-01-31' ORDER BY metrics.clicks DESC LIMIT 10"
}
```

## Response Format

```json
{
  "results": [
    {
      "productPerformanceView": {
        "date": { "year": 2024, "month": 1, "day": 15 },
        "offerId": "SKU-001",
        "title": "Premium Headphones",
        "clicks": "142",
        "impressions": "5230",
        "ctr": 0.0272
      }
    }
  ],
  "nextPageToken": "abc123"
}
```

## Pagination

Reports support pagination via `pageSize` and `pageToken` in the request body:

```json
{
  "query": "SELECT ... FROM ...",
  "pageSize": 1000,
  "pageToken": "abc123"
}
```

Default page size varies by table. Max is typically 1000 rows per page.

## Code Example

```javascript
async function getProductPerformance(merchantId, token, startDate, endDate) {
  const results = [];
  let pageToken = '';

  do {
    const body = {
      query: `
        SELECT
          segments.offerId,
          segments.title,
          metrics.clicks,
          metrics.impressions,
          metrics.ctr,
          metrics.conversions
        FROM product_performance_view
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.clicks DESC
      `,
      pageSize: 1000,
    };
    if (pageToken) body.pageToken = pageToken;

    const response = await fetch(
      `https://merchantapi.googleapis.com/reports/v1/accounts/${merchantId}/reports:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    results.push(...(data.results || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return results;
}
```

```python
import requests

def get_product_performance(merchant_id, token, start_date, end_date):
    results = []
    page_token = ''

    while True:
        body = {
            'query': f"""
                SELECT
                    segments.offerId,
                    segments.title,
                    metrics.clicks,
                    metrics.impressions,
                    metrics.ctr,
                    metrics.conversions
                FROM product_performance_view
                WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
                ORDER BY metrics.clicks DESC
            """,
            'pageSize': 1000,
        }
        if page_token:
            body['pageToken'] = page_token

        response = requests.post(
            f'https://merchantapi.googleapis.com/reports/v1/accounts/{merchant_id}/reports:search',
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
            json=body,
        )
        data = response.json()
        results.extend(data.get('results', []))
        page_token = data.get('nextPageToken', '')
        if not page_token:
            break

    return results
```
