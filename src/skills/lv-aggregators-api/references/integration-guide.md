# Integration Guide

Code examples and strategies for generating XML product feeds for Latvian aggregators.

## Table of Contents

1. [Dual-Feed Strategy](#dual-feed-strategy)
2. [Node.js Implementation](#nodejs-implementation)
3. [PHP Implementation](#php-implementation)
4. [Python Implementation](#python-implementation)
5. [Validation](#validation)
6. [Scheduling](#scheduling)
7. [Common Pitfalls](#common-pitfalls)

## Dual-Feed Strategy

Since Salidzini.lv and KurPirkt.lv share a very similar XML structure, use a single product data source and generate both feeds with platform-specific adjustments:

1. Query products from your database
2. Map fields to each platform's tag names
3. Generate separate XML files and host them at distinct URLs

Key field mappings between platforms:

```
brand       -> <brand> (Salidzini)  |  <manufacturer> (KurPirkt)
delivery    -> <delivery_latvija>   |  <delivery_cost_riga>
category    -> "A >> B >> C"        |  "A > B > C"
```

## Node.js Implementation

### Basic Feed Generator

```javascript
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Platform-specific field mappings
const PLATFORM_CONFIG = {
  salidzini: {
    brandTag: 'brand',
    deliveryTag: 'delivery_latvija',
    categorySeparator: ' &gt;&gt; ',
    extraFields: (product) => `
    <model>${escapeXml(product.model || '')}</model>
    <color>${escapeXml(product.color || '')}</color>
    <mpn>${escapeXml(product.mpn || '')}</mpn>
    <ean>${escapeXml(product.ean || '')}</ean>
    <delivery_days_latvija>${product.deliveryDays || ''}</delivery_days_latvija>
    <delivery_days_shop>${product.pickupDays || ''}</delivery_days_shop>
    <service_fee>${product.serviceFee || ''}</service_fee>
    <adult>${product.isAdult ? 'yes' : 'no'}</adult>`,
  },
  kurpirkt: {
    brandTag: 'manufacturer',
    deliveryTag: 'delivery_cost_riga',
    categorySeparator: ' &gt; ',
    extraFields: () => '',
  },
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateItem(product, platform) {
  const config = PLATFORM_CONFIG[platform];
  const categoryPath = product.categories
    ?.join(config.categorySeparator) || '';

  return `  <item>
    <name>${escapeXml(product.name)}</name>
    <link>${escapeXml(product.url)}</link>
    <price>${product.price.toFixed(2)}</price>
    <image>${escapeXml(product.imageUrl || '')}</image>
    <${config.brandTag}>${escapeXml(product.brand || '')}</${config.brandTag}>
    <category_full>${categoryPath}</category_full>
    <category_link>${escapeXml(product.categoryUrl || '')}</category_link>
    <in_stock>${product.stock ?? ''}</in_stock>
    <${config.deliveryTag}>${product.deliveryCost ?? ''}</${config.deliveryTag}>
    <used>${product.isUsed ? '1' : ''}</used>${config.extraFields(product)}
  </item>`;
}

async function generateFeed(products, platform, outputPath) {
  const stream = createWriteStream(outputPath);
  stream.write('<?xml version="1.0" encoding="utf-8" ?>\n<root>\n');

  for (const product of products) {
    stream.write(generateItem(product, platform) + '\n');
  }

  stream.write('</root>\n');
  stream.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// Usage
const products = await fetchProductsFromDatabase();
await Promise.all([
  generateFeed(products, 'salidzini', './public/export/salidzini.xml'),
  generateFeed(products, 'kurpirkt', './public/export/kurpirkt.xml'),
]);
```

### Express.js Dynamic Feed Endpoint

```javascript
import express from 'express';

const app = express();

app.get('/export/:platform.xml', async (req, res) => {
  const { platform } = req.params;
  if (!['salidzini', 'kurpirkt'].includes(platform)) {
    return res.status(404).send('Unknown platform');
  }

  const products = await fetchProductsFromDatabase();

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.write('<?xml version="1.0" encoding="utf-8" ?>\n<root>\n');

  for (const product of products) {
    res.write(generateItem(product, platform) + '\n');
  }

  res.end('</root>\n');
});
```

## PHP Implementation

```php
<?php
header('Content-Type: application/xml; charset=utf-8');

$platform = $_GET['platform'] ?? 'salidzini';

// Fetch products from your database
$products = getProductsFromDB();

$xml = new XMLWriter();
$xml->openMemory();
$xml->startDocument('1.0', 'UTF-8');
$xml->startElement('root');

foreach ($products as $product) {
    $xml->startElement('item');

    $xml->writeElement('name', $product['name']);
    $xml->writeElement('link', $product['url']);
    $xml->writeElement('price', number_format($product['price'], 2, '.', ''));
    $xml->writeElement('image', $product['image_url'] ?? '');

    // Platform-specific brand tag
    $brandTag = $platform === 'kurpirkt' ? 'manufacturer' : 'brand';
    $xml->writeElement($brandTag, $product['brand'] ?? '');

    // Category with platform-specific separator
    $separator = $platform === 'kurpirkt' ? ' > ' : ' >> ';
    $categoryPath = implode($separator, $product['categories'] ?? []);
    $xml->writeElement('category_full', $categoryPath);
    $xml->writeElement('category_link', $product['category_url'] ?? '');

    $xml->writeElement('in_stock', $product['stock'] ?? '');

    // Platform-specific delivery tag
    $deliveryTag = $platform === 'kurpirkt' ? 'delivery_cost_riga' : 'delivery_latvija';
    $xml->writeElement($deliveryTag, $product['delivery_cost'] ?? '');

    $xml->writeElement('used', $product['is_used'] ? '1' : '');

    // Salidzini-specific extra fields
    if ($platform === 'salidzini') {
        $xml->writeElement('model', $product['model'] ?? '');
        $xml->writeElement('color', $product['color'] ?? '');
        $xml->writeElement('mpn', $product['mpn'] ?? '');
        $xml->writeElement('ean', $product['ean'] ?? '');
        $xml->writeElement('delivery_days_latvija', $product['delivery_days'] ?? '');
        $xml->writeElement('delivery_days_shop', $product['pickup_days'] ?? '');
        $xml->writeElement('adult', $product['is_adult'] ? 'yes' : 'no');
    }

    $xml->endElement(); // item
}

$xml->endElement(); // root
echo $xml->outputMemory();
```

## Python Implementation

```python
import xml.etree.ElementTree as ET
from xml.dom import minidom

PLATFORM_CONFIG = {
    'salidzini': {
        'brand_tag': 'brand',
        'delivery_tag': 'delivery_latvija',
        'category_sep': ' >> ',
    },
    'kurpirkt': {
        'brand_tag': 'manufacturer',
        'delivery_tag': 'delivery_cost_riga',
        'category_sep': ' > ',
    },
}

def generate_feed(products: list[dict], platform: str, output_path: str):
    config = PLATFORM_CONFIG[platform]
    root = ET.Element('root')

    for product in products:
        item = ET.SubElement(root, 'item')

        ET.SubElement(item, 'name').text = product['name']
        ET.SubElement(item, 'link').text = product['url']
        ET.SubElement(item, 'price').text = f"{product['price']:.2f}"
        ET.SubElement(item, 'image').text = product.get('image_url', '')

        ET.SubElement(item, config['brand_tag']).text = product.get('brand', '')

        categories = product.get('categories', [])
        ET.SubElement(item, 'category_full').text = config['category_sep'].join(categories)
        ET.SubElement(item, 'category_link').text = product.get('category_url', '')

        ET.SubElement(item, 'in_stock').text = str(product.get('stock', ''))
        ET.SubElement(item, config['delivery_tag']).text = str(product.get('delivery_cost', ''))
        ET.SubElement(item, 'used').text = '1' if product.get('is_used') else ''

        # Salidzini-specific fields
        if platform == 'salidzini':
            ET.SubElement(item, 'model').text = product.get('model', '')
            ET.SubElement(item, 'color').text = product.get('color', '')
            ET.SubElement(item, 'mpn').text = product.get('mpn', '')
            ET.SubElement(item, 'ean').text = product.get('ean', '')
            ET.SubElement(item, 'delivery_days_latvija').text = str(product.get('delivery_days', ''))
            ET.SubElement(item, 'delivery_days_shop').text = str(product.get('pickup_days', ''))
            ET.SubElement(item, 'adult').text = 'yes' if product.get('is_adult') else 'no'

    xml_str = minidom.parseString(ET.tostring(root, encoding='unicode')).toprettyxml(
        indent='  ', encoding=None
    )
    # Replace default XML declaration with utf-8
    xml_str = xml_str.replace(
        "<?xml version=\"1.0\" ?>",
        "<?xml version=\"1.0\" encoding=\"utf-8\" ?>"
    )

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml_str)


# Usage
products = fetch_products_from_db()
generate_feed(products, 'salidzini', 'export/salidzini.xml')
generate_feed(products, 'kurpirkt', 'export/kurpirkt.xml')
```

## Validation

### Salidzini.lv Validator

Use the built-in validator at `https://www.salidzini.lv/shops_info.php` — paste your feed URL at the bottom of the page.

### Manual Validation Checklist

Before submitting your feed, verify:

- [ ] XML is well-formed (valid UTF-8, proper encoding declaration)
- [ ] All required fields (`name`, `link`, `price`) are present for every item
- [ ] Prices are numeric with dot decimal separator (e.g., `305.77`)
- [ ] All URLs are absolute and accessible
- [ ] No duplicate products
- [ ] Product names are concise without promotional text
- [ ] Images have white backgrounds, no watermarks/logos
- [ ] Used/refurbished items have `<used>1</used>`
- [ ] No alcohol/tobacco products (Salidzini)
- [ ] Feed loads within 5 minutes (Salidzini)
- [ ] Stock quantities match what's shown on your shop pages

### Simple XML Validation Script (Node.js)

```javascript
import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser();
const xml = readFileSync('export/salidzini.xml', 'utf-8');
const data = parser.parse(xml);

const items = Array.isArray(data.root.item) ? data.root.item : [data.root.item];
const errors = [];

items.forEach((item, i) => {
  if (!item.name) errors.push(`Item ${i}: missing <name>`);
  if (!item.link) errors.push(`Item ${i}: missing <link>`);
  if (!item.price || isNaN(Number(item.price))) {
    errors.push(`Item ${i}: invalid or missing <price>`);
  }
  if (item.name && String(item.name).length > 200) {
    errors.push(`Item ${i}: name exceeds 200 characters`);
  }
});

console.log(`Checked ${items.length} items, found ${errors.length} errors`);
errors.forEach(e => console.error(e));
```

## Scheduling

### Cron (Linux)

```bash
# Regenerate feeds every day at 3 AM
0 3 * * * /usr/bin/node /var/www/shop/scripts/generate-feeds.js >> /var/log/feed-export.log 2>&1
```

### Node.js with node-cron

```javascript
import cron from 'node-cron';

// Run daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Generating aggregator feeds...');
  const products = await fetchProductsFromDatabase();
  await generateFeed(products, 'salidzini', './public/export/salidzini.xml');
  await generateFeed(products, 'kurpirkt', './public/export/kurpirkt.xml');
  console.log('Feeds generated successfully');
});
```

### Windows Task Scheduler

```batch
schtasks /create /tn "GenerateAggregatorFeeds" /tr "node C:\shop\scripts\generate-feeds.js" /sc daily /st 03:00
```

## Common Pitfalls

1. **Wrong encoding** - Always use UTF-8. Latvian characters (ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž) will break if the file isn't properly encoded.

2. **HTML entities in XML** - The category separator `>>` must be escaped as `&gt;&gt;` in Salidzini feeds. Use CDATA sections for fields that may contain special characters.

3. **Price format** - Use dot (`.`), never comma (`,`). `305.77` is correct, `305,77` will fail.

4. **Promotional text in names** - Aggregators actively check for and reject names with "Free shipping", "Best price", "Akcija", etc.

5. **Missing or low-quality images** - Images with logos, text overlays, or non-white backgrounds get rejected. Better to leave `<image>` empty than provide a non-compliant image.

6. **Stale feeds** - Update at least daily. If your feed shows products that are out of stock or have wrong prices, the aggregator may penalize your shop.

7. **Slow feed response** - Salidzini requires feed delivery within 5 minutes. For large catalogs (10,000+ items), pre-generate the XML file rather than building it dynamically per request.

8. **Duplicate products** - Same product with different colors/sizes should ideally be separate items with unique names, not duplicates of the same listing.
