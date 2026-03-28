# KurPirkt.lv XML Feed Specification

Latvia's largest price comparison and product search portal (30,000-45,000 daily visitors, 1,200+ listed shops). Documentation source: `https://www.kurpirkt.lv/veikaliem.php`

## Registration

Submit an application via email to **kurpirkt@kurpirkt.lv** with:

1. URL to your product XML feed (e.g., `https://www.yourshop.lv/files/export/kurpirkt.php`)
2. Link to your shop's contact information page
3. Link to your shop's delivery information page
4. Your company's legal details (rekvizīti)
5. Email address for the shop's admin profile (e.g., `info@yourshop.lv`)
6. Confirmation that the KurPirkt.lv partner banner is placed on your shop

**Phone:** +371 26533032

Each application is reviewed and verified before being added to the KurPirkt.lv database. Confirmation email is sent upon approval. If no confirmation within one week, contact them again.

## Shop Requirements

- Products must have clearly displayed prices and payment methods
- All products must be deliverable or available for pickup in Latvia
- Delivery prices and terms must be clearly stated
- Clear product return process and warranty terms required
- KurPirkt.lv partner banner must be placed on shop's homepage
- Self-reviews on KurPirkt.lv are prohibited
- Misusing KurPirkt.lv database (copying, scraping) is prohibited
- Shops violating terms or consumer rights may be disconnected (with prior notice)
- KurPirkt.lv may charge for clicks from the search engine
- Terms changes are communicated at least 15 days before taking effect
- Shops can opt out of terms changes within 5 days before they take effect
- Shops can terminate cooperation with at least 5 days notice
- KurPirkt.lv can terminate cooperation with at least 30 days notice with stated reasons

## XML Feed Structure

```xml
<?xml version='1.0' encoding='utf-8' ?>
<root>
  <item>
    <name>Apple iPhone 13 PRO 512GB black</name>
    <link>https://www.example.lv/page.php?prod=1234</link>
    <price>1200.59</price>
    <image>https://www.example.lv/bildes/apple_iphone_13_pro.jpg</image>
    <manufacturer>Apple</manufacturer>
    <category>Mobilie telefoni</category>
    <category_full>Sakaru līdzekļi > Mobilie telefoni</category_full>
    <category_link>https://www.example.lv/page.php?cat=12</category_link>
    <in_stock>5</in_stock>
    <delivery_cost_riga>2.25</delivery_cost_riga>
    <used>0</used>
  </item>
</root>
```

## Field Reference

| Tag | Required | Description | Constraints |
|-----|----------|-------------|-------------|
| `<name>` | Yes | Product name | Brand + model + key identifiers |
| `<link>` | Yes | Full product page URL | Complete URL to the product |
| `<price>` | Yes | Price in EUR including VAT | Numeric, dot decimal separator |
| `<image>` | No | Product image URL | White background, no watermarks |
| `<manufacturer>` | No | Product manufacturer/brand | **Note:** Salidzini uses `<brand>` |
| `<category>` | No | Short category name | Single-level category |
| `<category_full>` | No | Full category path with hierarchy | Use `>` as separator (not `>>`) |
| `<category_link>` | No | Category page URL | |
| `<in_stock>` | No | Available stock quantity | Numeric value |
| `<delivery_cost_riga>` | No | Delivery cost to Riga | Numeric, EUR. **Note:** Salidzini uses `<delivery_latvija>` (all Latvia) |
| `<used>` | No | Used/demo product marker | `1` for used items, `0` for new. **Mandatory** value `1` for used/demo products. |

## Key Differences from Salidzini.lv

| Aspect | KurPirkt.lv | Salidzini.lv |
|--------|-------------|-------------|
| Brand tag | `<manufacturer>` | `<brand>` |
| Delivery cost tag | `<delivery_cost_riga>` (Riga only) | `<delivery_latvija>` (all Latvia) |
| Category separator | `>` | `>>` |
| Additional fields | Fewer (no model, color, mpn, ean, adult, medicine) | More detailed product attributes |
| Registration | Email application | Web form |
| Feed validator | Not mentioned | Available on shops_info page |
| Short category | `<category>` (single-level) | Not available |

## Banner Code

Place the KurPirkt.lv banner on your shop's homepage. Two size options:

**88x31px:**
```html
<a href="https://www.kurpirkt.lv" title="Kurpirkt.lv - visi Latvijas interneta veikali un cenas">
  <img style="border:none;" alt="Kurpirkt.lv - visi Latvijas interneta veikali un cenas"
       src="//www.kurpirkt.lv/media/kurpirkt88.gif" width="88" height="31">
</a>
```

**120x40px:**
```html
<a href="https://www.kurpirkt.lv" title="Kurpirkt.lv - visi Latvijas interneta veikali un cenas">
  <img style="border:none;" alt="Kurpirkt.lv - visi Latvijas interneta veikali un cenas"
       src="//www.kurpirkt.lv/media/kurpirkt120.gif" width="120" height="40">
</a>
```
