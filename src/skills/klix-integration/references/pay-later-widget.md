# Klix Pay Later Widget

Display monthly payment calculators on product pages, cart, or checkout.

## Setup

Add scripts to `<head>`:

```html
<script type="module" src="https://klix.blob.core.windows.net/public/pay-later-widget/build/klix-pay-later-widget.esm.js"></script>
<script nomodule src="https://klix.blob.core.windows.net/public/pay-later-widget/build/klix-pay-later-widget.js"></script>
```

## Basic Widget

```html
<klix-pay-later
  amount="6790"
  brand_id="YOUR_BRAND_ID"
  language="en"
  theme="light"
  view="product"
></klix-pay-later>
```

## Parameters

| Parameter | Required | Values | Description |
|-----------|----------|--------|-------------|
| `amount` | Yes | Integer | Price in cents (6790 = 67.90 EUR) |
| `brand_id` | Yes | String | Merchant Brand ID |
| `language` | Yes | `en`, `lv`, `ru`, `lt` | Widget language |
| `theme` | No | `light` | Visual theme (only light currently) |
| `view` | No | `product`, `cart`, `checkout` | Context where widget is shown |
| `category` | No | e.g., `ELECTRONICS`, `FURNITURE` | Product category hint |
| `type` | No | `micro` | Compact display variant |

## Calculator Widget (Advanced)

For a more interactive calculator with adjustable parameters, use the calculator script:

```html
<script type="module" src="https://klix.blob.core.windows.net/public/pay-later-calculator-widget/build/klix-widget.esm.js"></script>
```

### Variant 1: Adjustable Down Payment
```html
<div id="klix-pay-later-calculator"
  data-brand-id="YOUR_BRAND_ID"
  data-loan-amount="50000"
  data-language="en"
></div>
```

### Variant 2: Adjustable Principal + Down Payment
Add `data-amount-slider="true"` to enable price range slider.

### Variant 3: Custom View
Set `window.showCustomView = true` and implement:
- `populateData(financingProduct)` — receives calculated data
- `returnWidgetView()` — returns custom HTML string

## Financing Product Data

The widget receives objects with:
- `monthlyPaymentAmount` — monthly installment
- `repaymentCount` — number of months
- `interestRate` — annual rate
- `productType` — `GRACE_PERIOD`, `INSTALLMENT_CREDIT`, or `COMMISSION`

## React Integration

```jsx
import { useEffect } from 'react';

export function KlixPayLater({ amount, brandId, language = 'en' }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://klix.blob.core.windows.net/public/pay-later-widget/build/klix-pay-later-widget.esm.js';
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  return (
    <klix-pay-later
      amount={String(amount)}
      brand_id={brandId}
      language={language}
      theme="light"
      view="product"
    />
  );
}
```
