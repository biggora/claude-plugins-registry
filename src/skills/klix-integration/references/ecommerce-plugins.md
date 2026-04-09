# Klix eCommerce Platform Plugins

Pre-built plugins for popular platforms. No coding required — just install and configure.

## Common Setup

All plugins require:
1. **Brand ID** — from Klix merchant portal
2. **Secret Key** — from Klix merchant portal

Use test credentials during development (see main SKILL.md).

---

## WooCommerce (3.5+)

**Install options:**
- Automatic: WordPress Admin > Plugins > Add New > search "Klix"
- Manual: download plugin ZIP, upload via FTP to `wp-content/plugins/`

**Configure:**
1. WooCommerce > Settings > Payments
2. Enable Klix
3. Enter Brand ID and Secret Key

---

## Shopify

**Setup:**
1. Go to Shopify Business Portal
2. Find and install Klix app
3. Activate Klix as payment method
4. Configure payment capture method (automatic/manual)

---

## Magento (2.0+)

**Install (terminal required):**
1. Create directories for the module
2. Run CLI setup commands
3. Configure in Admin Panel > Stores > Configuration > Sales > Payment Methods

---

## OpenCart (3.0 – 4+)

**Install:**
1. Upload plugin via Extensions installer
2. Enable in Extensions > Payments
3. Enter Brand ID and Secret Key

**Extra:** Supports localization for custom payment method labels and button text.

---

## PrestaShop (1.7+)

**Install:**
1. Download version-specific plugin
2. Upload via Modules > Module Manager
3. Configure with Brand ID and Secret Key

**Extra:** Includes translation support for checkout text.

---

## Mozello

**Configure:**
1. Store Settings > Catalog > Payment
2. Select Klix from dropdown
3. Enter Brand ID and Secret Key

---

## Note from Klix

Klix recommends **direct API integration** for maximum reliability. Platform plugins are maintained by the community and may lag behind API changes.
