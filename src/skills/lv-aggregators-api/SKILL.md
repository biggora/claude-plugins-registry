---
name: lv-aggregators-api
description: "Use this skill whenever the user wants to work with Latvian price comparison / aggregator platforms, specifically Salidzini.lv or KurPirkt.lv. Triggers include: creating or generating XML product feeds, integrating an e-commerce store with Latvian aggregators, exporting product catalogs for salidzini or kurpirkt, validating XML feed format, debugging feed errors, setting up product data export for Latvian price comparison sites, or any mention of \"salidzini\", \"kurpirkt\", \"cenu salīdzināšana\", \"preču eksports\", \"XML feed Latvia\", \"Latvian marketplace integration\", or \"price aggregator feed\". Also use when the user mentions e-commerce product feeds for the Latvian market, product data export in LV context, or wants to list products on Latvian comparison shopping engines, even without naming a specific platform.
"
---

# Latvian Price Aggregator APIs

Generate and manage XML product feeds for Latvia's two major price comparison platforms: **Salidzini.lv** and **KurPirkt.lv**.

## Platform Overview

| Aspect | Salidzini.lv | KurPirkt.lv |
|--------|-------------|-------------|
| Daily visitors | ~47,000 | 30,000-45,000 |
| Monthly visitors | ~1.3 million | N/A |
| Listed shops | N/A | 1,200+ |
| Feed format | XML (UTF-8) | XML (UTF-8) |
| Feed update | At least daily | Regular (daily recommended) |
| Contact | Web form on shops_info.php | kurpirkt@kurpirkt.lv / +371 26533032 |
| Registration | Online form | Email application |

Both platforms use similar XML feed formats with minor differences in field names and requirements. If a shop targets both platforms, a single feed generator can produce both formats with minimal adjustments.

## Quick Start

To integrate with either platform:

1. **Generate an XML feed** from your product database (see format details in reference files)
2. **Host the feed** at a public URL (e.g., `https://yourshop.lv/export/salidzini.xml`)
3. **Auto-update** the feed at least once daily via a scheduled script/cron job
4. **Place the aggregator's banner** on your shop's homepage
5. **Submit your application** through the platform's registration process
6. **Validate** your feed using the platform's validator (Salidzini provides one at their shops_info page)

## Feed Format Comparison

Both platforms use `<root>` as the root element and `<item>` for each product. The key differences:

| Field | Salidzini.lv | KurPirkt.lv | Notes |
|-------|-------------|-------------|-------|
| Product name | `<name>` (required) | `<name>` (required) | Max 200 chars on Salidzini |
| Product URL | `<link>` (required) | `<link>` (required) | Max 500 chars, full URL |
| Price | `<price>` (required) | `<price>` (required) | EUR, dot decimal separator |
| Image | `<image>` | `<image>` | White bg, no logos/watermarks |
| Brand | `<brand>` | `<manufacturer>` | **Different tag name** |
| Category | `<category_full>` | `<category_full>` | Hierarchy with `>>` (Salidzini) or `>` (KurPirkt) |
| Category link | `<category_link>` | `<category_link>` | Optional on KurPirkt |
| Stock | `<in_stock>` | `<in_stock>` | Numeric quantity |
| Used/refurbished | `<used>` | `<used>` | Value `1` for used items |
| Delivery cost | `<delivery_latvija>` | `<delivery_cost_riga>` | **Different tag name & scope** |
| Delivery days | `<delivery_days_latvija>` | N/A | Salidzini only |
| In-store pickup days | `<delivery_days_shop>` | N/A | Salidzini only |
| Service fee | `<service_fee>` | N/A | Salidzini only |
| Model | `<model>` | N/A | Salidzini only |
| Color | `<color>` | N/A | Salidzini only |
| MPN | `<mpn>` | N/A | Salidzini only |
| EAN/GTIN | `<ean>` | N/A | Salidzini only |
| Adult content | `<adult>` | N/A | `yes`/`no`, required for adult shops |
| OTC medicine | `<over_the_counter_medicine>` | N/A | Salidzini only, value `1` |

## Reference Files

For detailed per-platform documentation, field specifications, code examples, and validation rules:

- **`references/salidzini.md`** - Complete Salidzini.lv feed specification, all fields, rules, and examples
- **`references/kurpirkt.md`** - Complete KurPirkt.lv feed specification and registration process
- **`references/integration-guide.md`** - Code examples for generating feeds in Node.js, PHP, Python; dual-feed strategy; validation; scheduling

Read the relevant reference file when you need detailed field-level documentation or implementation code.

## Common Rules (Both Platforms)

### Pricing
- All prices in **EUR with VAT** included
- Use **dot** (`.`) as decimal separator
- Price must be the final price a consumer pays (excluding delivery)
- Include any additional fees in the price

### Product Names
- Include brand/manufacturer, model, and product code
- Keep names concise and descriptive
- No promotional text ("Free shipping", "Best price", "Sale", etc.)
- No vague phrases ("Best choice", "Highest quality", "Buy now")

### Images
- Must show the actual product appearance
- **White background**, no frames
- No shop logos, prices, watermarks, or promotional overlays
- No text like "In stock", "Gift", "0% credit"
- If no product image available, leave the `<image>` tag empty
- Salidzini: min 500x500px recommended, max 16MB

### Prohibited Content
- Alcohol and tobacco products (Salidzini)
- Products with delivery times exceeding 30 days (Salidzini)
- Duplicate product entries
- Products not available for purchase/delivery in Latvia

### Feed Technical Requirements
- **UTF-8 encoding** (declared in XML header)
- Feed response time must be under **5 minutes** (Salidzini)
- Host at a stable public URL on your registered domain
- Auto-generate and update at least daily
- CDATA sections supported: `<name><![CDATA[Product Name]]></name>`
