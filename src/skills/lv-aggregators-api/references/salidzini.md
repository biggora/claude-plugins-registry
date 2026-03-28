# Salidzini.lv XML Feed Specification

Latvia's largest price comparison engine (~47,000 daily visitors, ~1.3 million monthly). Documentation source: `https://www.salidzini.lv/shops_info.php`

## Registration

1. Fill out the application form at `https://www.salidzini.lv/shops_info.php`
2. Provide your shop URL and contact email
3. Indicate whether you need XML feed creation assistance (available from 2 EUR/month)
4. After registration, shop name and domain cannot be changed

## Shop Requirements

- Products must be purchasable online with delivery available in Latvia
- Payment and delivery process must be clearly described
- Salidzini.lv partner banner must be placed on the shop's website
- XML product feed must be created and hosted (specification below)
- Shops may be disconnected upon receiving many complaints or suspicion of unfair practices
- Registering multiple shops with similar product ranges is prohibited
- Listing the same product multiple times is prohibited
- Public contests encouraging review placement are prohibited
- Self-reviews or paid reviews are prohibited

## XML Feed Structure

```xml
<?xml version="1.0" encoding="utf-8" ?>
<root>
  <item>
    <!-- Required fields -->
    <name>Samsung Galaxy S8 G950F Black</name>
    <link>http://www.shop-name.lv/info/SamsungGalaxyS8G950FBlack/</link>
    <price>305.77</price>

    <!-- Optional fields -->
    <image>http://www.shop-name.lv/images/SamsungGalaxyS8G950FBlack.jpg</image>
    <category_full>Mobilie telefoni &gt;&gt; Samsung</category_full>
    <category_link>http://www.shop-name.lv/Samsung</category_link>
    <brand>Samsung</brand>
    <model><![CDATA[Galaxy S8]]></model>
    <color>Black</color>
    <mpn>SM-G950F</mpn>
    <ean>0644391356614</ean>
    <in_stock>7</in_stock>
    <delivery_latvija>1.90</delivery_latvija>
    <delivery_days_latvija>5</delivery_days_latvija>
    <delivery_days_shop>2</delivery_days_shop>
    <service_fee>0.99</service_fee>
    <used></used>
    <adult>no</adult>
    <over_the_counter_medicine></over_the_counter_medicine>
  </item>
</root>
```

## Field Reference

### Required Fields

| Tag | Description | Constraints |
|-----|-------------|-------------|
| `<name>` | Product name. Preferably only manufacturer, model, and code. | Max 200 characters. Must be concise, descriptive, no promo text. |
| `<link>` | Full product page URL on the registered domain. | Max 500 characters. Must be a complete URL. |
| `<price>` | Final price in EUR including VAT. | Numeric value with dot as decimal separator. Must include all additional costs except delivery. |

### Optional Fields

| Tag | Description | Constraints |
|-----|-------------|-------------|
| `<image>` | Product image URL. | Max 500 chars, max 16MB file size. Min 500x500px recommended. White background, no frames, no logos/watermarks/overlays. Leave empty if no proper image. |
| `<category_full>` | Full category path with parent categories. | Max 200 chars. Use `>>` as hierarchy separator. Must describe the product category, no promo words. |
| `<category_link>` | URL to the category page. | Max 500 characters. |
| `<brand>` | Product brand / manufacturer. | |
| `<model>` | Product model name. | CDATA supported. |
| `<color>` | Product color in English or Latvian. | |
| `<mpn>` | Manufacturer Part Number. | |
| `<ean>` | EAN code (also GTIN, UPC, JAN, ISBN). | |
| `<in_stock>` | Available quantity in warehouse for delivery to Riga within 4 business days. | Numeric value. Must match the quantity shown on the shop's product page. |
| `<delivery_latvija>` | Lowest delivery cost in Latvia (to address, parcel locker, or post office). | Numeric value. Leave empty if unavailable. |
| `<delivery_days_latvija>` | Minimum guaranteed delivery days in Latvia. Example: if delivery is 3-5 days, specify `5`. | Numeric value. Leave empty if unavailable. |
| `<delivery_days_shop>` | Maximum business days for free in-store pickup. Use `0` if available today. | Numeric value. Leave empty if unavailable. |
| `<service_fee>` | Purchase service/handling fee, if any. | Numeric value. |
| `<used>` | Mark used, refurbished, demo, or damaged products. | Value `1` is **mandatory** for such products. |
| `<adult>` | Mark sexual, nude, erotic, or intimate products. | Values: `yes`/`no`. **Mandatory** for adult product sellers. |
| `<over_the_counter_medicine>` | Mark over-the-counter medicines (no prescription needed). | Value `1`. For pharmaceutical sellers. |

## Naming Rules

Product names should follow the pattern: **Brand + Model + Key Identifier**

**Good:** `Samsung Galaxy S8 G950F Black`
**Bad:** `Super deal! Samsung Galaxy S8 - Free shipping - Best price - Buy now!`

Prohibited in names:
- "Ir uz vietas" (In stock), "Bezmaksas piegāde" (Free delivery), "Bezmaksas kredīts" (Free credit)
- "Labākā izvēle" (Best choice), "Augstākā kvalitāte" (Highest quality)
- "Iegādājies tagad" (Buy now), "Ideāli dāvanai" (Ideal for gift)
- "Super cena" (Super price), "Jaunums" (New), and similar promotional phrases
- Excessively long, unclear, or machine-translated names

## Image Rules

- Must represent the product's actual appearance
- White background, no frames
- No shop logo, price, or other unrelated imagery
- No overlaid text ("In stock", "Good product", "10 years on market", "Gift", "0% credit")
- If no suitable product image exists, use empty `<image></image>`

## Content Restrictions

- No alcohol or tobacco products
- Only products with delivery within 30 days
- Each product listed only once
- All information must match what's displayed on the shop's product page

## Feed Validation

Salidzini provides an XML feed validator at `https://www.salidzini.lv/shops_info.php` (bottom of page). Enter your feed URL to check for errors.

## Banner Code

The shop must display a Salidzini.lv banner. Three variants are available (blue, dark, light) at 190x60px. The banner images are hosted at `static.salidzini.lv/images/`.
