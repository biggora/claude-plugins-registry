# Accounts Sub-API Reference

Base: `https://merchantapi.googleapis.com/accounts/v1`

## Account Management

### Core Account Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/accounts/{account}` | Get account details |
| `PATCH` | `/accounts/{account}` | Update account |
| `DELETE` | `/accounts/{account}` | Delete account |
| `GET` | `/accounts` | List all accounts |
| `GET` | `/accounts/{parent}/subaccounts` | List sub-accounts |
| `POST` | `/accounts:createAndConfigure` | Create and configure new account |
| `POST` | `/accounts/{parent}/accounts:createTestAccount` | Create test account |

### Account Object

```json
{
  "name": "accounts/123456789",
  "accountId": "123456789",
  "accountName": "My Store",
  "languageCode": "en",
  "adultContent": false,
  "timeZone": {
    "id": "America/New_York"
  },
  "accountType": "STANDALONE"
}
```

## Business Info

Manage store business information (address, phone, customer service).

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/businessInfo` |
| `PATCH` | `/accounts/{account}/businessInfo` |

```json
{
  "name": "accounts/123456789/businessInfo",
  "address": {
    "regionCode": "US",
    "postalCode": "10001",
    "locality": "New York",
    "administrativeArea": "NY",
    "streetAddress": "123 Commerce St"
  },
  "phone": {
    "number": "+12125551234"
  },
  "customerService": {
    "uri": "https://example.com/support",
    "email": "support@example.com",
    "phone": {
      "number": "+12125551234"
    }
  }
}
```

## Business Identity

Manage identity attributes (minority-owned, veteran-owned, etc.).

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/businessIdentity` |
| `PATCH` | `/accounts/{account}/businessIdentity` |

## Shipping Settings

Configure account-level shipping rules.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/shippingSettings` |
| `POST` | `/accounts/{account}/shippingSettings` |

```json
{
  "name": "accounts/123456789/shippingSettings",
  "services": [
    {
      "serviceName": "Standard Shipping",
      "active": true,
      "deliveryCountries": ["US"],
      "currencyCode": "USD",
      "deliveryTime": {
        "minTransitDays": 3,
        "maxTransitDays": 7,
        "minHandlingDays": 0,
        "maxHandlingDays": 1
      },
      "rateGroups": [
        {
          "applicableShippingLabels": [],
          "singleValue": {
            "flatRate": {
              "amountMicros": "5990000",
              "currencyCode": "USD"
            }
          }
        }
      ]
    }
  ]
}
```

## Users

Manage who can access the Merchant Center account.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/users/{user}` |
| `GET` | `/accounts/{account}/users` |
| `POST` | `/accounts/{account}/users` |
| `PATCH` | `/accounts/{account}/users/{user}` |
| `DELETE` | `/accounts/{account}/users/{user}` |

```json
{
  "name": "accounts/123456789/users/user@example.com",
  "emailAddress": "user@example.com",
  "accessRights": ["STANDARD", "ADMIN"],
  "state": "ACTIVE"
}
```

**Access Rights:**
- `STANDARD` - View and manage products
- `ADMIN` - Full account control
- `PERFORMANCE_REPORTING` - View reports only

## Programs

Manage enrollment in Google programs (Shopping Ads, Free Listings, etc.).

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/programs/{program}` |
| `GET` | `/accounts/{account}/programs` |
| `POST` | `/accounts/{account}/programs/{program}:enable` |
| `POST` | `/accounts/{account}/programs/{program}:disable` |

Common programs: `FREE_LISTINGS`, `SHOPPING_ADS`, `FREE_LOCAL_LISTINGS`, `LOCAL_INVENTORY_ADS`

## Regions

Define geographic regions for regional pricing and availability.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/regions/{region}` |
| `GET` | `/accounts/{account}/regions` |
| `POST` | `/accounts/{account}/regions` |
| `PATCH` | `/accounts/{account}/regions/{region}` |
| `DELETE` | `/accounts/{account}/regions/{region}` |
| `POST` | `/accounts/{account}/regions:batchCreate` |
| `POST` | `/accounts/{account}/regions:batchUpdate` |
| `POST` | `/accounts/{account}/regions:batchDelete` |

```json
{
  "name": "accounts/123456789/regions/northeast",
  "displayName": "US Northeast",
  "postalCodeArea": {
    "regionCode": "US",
    "postalCodes": [
      { "begin": "10000", "end": "14999" },
      { "begin": "06000", "end": "06999" }
    ]
  }
}
```

## Online Return Policies

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/onlineReturnPolicies/{policy}` |
| `GET` | `/accounts/{account}/onlineReturnPolicies` |
| `POST` | `/accounts/{account}/onlineReturnPolicies` |
| `DELETE` | `/accounts/{account}/onlineReturnPolicies/{policy}` |

## Homepage

Claim and manage your store homepage URL.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/homepage` |
| `PATCH` | `/accounts/{account}/homepage` |
| `POST` | `/accounts/{account}/homepage:claim` |
| `POST` | `/accounts/{account}/homepage:unclaim` |

## Terms of Service

| Method | Endpoint |
|--------|----------|
| `GET` | `/termsOfService/{tos}` |
| `GET` | `/termsOfService:retrieveLatest` |
| `POST` | `/termsOfService/{tos}:accept` |
| `GET` | `/accounts/{account}/termsOfServiceAgreementStates/{state}` |

## Autofeed Settings

Enable Google to auto-crawl your site for product data.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/autofeedSettings` |
| `PATCH` | `/accounts/{account}/autofeedSettings` |

```json
{
  "name": "accounts/123456789/autofeedSettings",
  "enableProducts": true
}
```

## Developer Registration

Link your GCP project to Merchant Center.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/developerRegistration` |
| `POST` | `/accounts/{account}/developerRegistration:registerGcp` |
| `POST` | `/accounts/{account}/developerRegistration:unregisterGcp` |

## Account Issues

List problems affecting your account.

| Method | Endpoint |
|--------|----------|
| `GET` | `/accounts/{account}/issues` |

Returns validation issues, policy violations, and suggested fixes.
