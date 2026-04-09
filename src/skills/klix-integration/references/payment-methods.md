# Klix Payment Methods

Full list of supported payment methods with country availability and validation requirements.

## Card Payments

| Method ID | Description | Countries |
|-----------|-------------|-----------|
| `klix` | Visa / Mastercard card payments | All |
| `klix_apple_pay` | Apple Pay | All |
| `klix_google_pay` | Google Pay | All |

## Pay Later

| Method ID | Description | Countries |
|-----------|-------------|-----------|
| `klix_pay_later` | Installment payments | LV, LT, EE |

## Bank Transfers (PIS) — Latvia

| Method ID | Bank | Personal Code | Full Name |
|-----------|------|:---:|:---:|
| `citadele_lv_digilink` | Citadele | Yes | - |
| `indexo_lv_pis` | INDEXO | Yes | Yes |
| `luminor_lv_pis` | Luminor | Yes | - |
| `seb_lv_pis` | SEB | Yes | - |
| `swedbank_lv_pis` | Swedbank | Yes | - |

## Bank Transfers (PIS) — Lithuania

| Method ID | Bank | Personal Code | Full Name |
|-----------|------|:---:|:---:|
| `citadele_lt_digilink` | Citadele | Yes | - |
| `lku_lt_pis` | LKU | - | - |
| `luminor_lt_pis` | Luminor | Yes | - |
| `seb_lt_pis` | SEB | Yes | - |
| `siauliu_lt_pis` | Artea Bankas | Yes | - |
| `swedbank_lt_pis` | Swedbank | Yes | - |

## Bank Transfers (PIS) — Estonia

| Method ID | Bank | Personal Code | Full Name |
|-----------|------|:---:|:---:|
| `citadele_ee_digilink` | Citadele | Yes | - |
| `coop_pank_ee_pis` | Coop Pank | - | - |
| `lhv_ee_pis` | LHV | - | - |
| `luminor_ee_pis` | Luminor | Yes | - |
| `seb_ee_pis` | SEB | Yes | - |
| `swedbank_ee_pis` | Swedbank | Yes | - |

## Validation Columns

- **Personal Code**: Klix returns the customer's personal identity code after payment
- **Full Name**: Klix returns the customer's full name after payment

## Apple Pay Requirements

Detect device/browser support before showing:
```javascript
if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
  // Show Apple Pay option
}
```

## Google Pay Requirements

Merchants must comply with Google's Acceptable Use Policy and accept the Google Pay API Terms of Service. 3DS authentication is applied automatically for PAN_ONLY transactions.

## Restricting Payment Methods

Use `payment_method_whitelist` in the purchase creation request:
```json
{
  "payment_method_whitelist": ["klix", "swedbank_lv_pis", "seb_lv_pis"]
}
```
