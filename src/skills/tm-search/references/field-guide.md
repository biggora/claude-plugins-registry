# USPTO Trademark Field Guide

## Response Field Descriptions

| Field | Description | Example |
|---|---|---|
| `serialNumber` | 8-digit USPTO application serial number | `"78787878"` |
| `registrationNumber` | 7-digit registration number (if registered) | `"3456789"` |
| `wordMark` | The literal text of the trademark | `"APPLE MUSIC"` |
| `status` | Human-readable status | `"Live/Registered"` |
| `statusCode` | `A` = Active/Live, `D` = Dead/Abandoned | `"A"` |
| `filingDate` | Date application was filed | `"2015-04-01"` |
| `registrationDate` | Date trademark was registered | `"2016-05-17"` |
| `owner` | Name of trademark owner/applicant | `"Apple Inc."` |
| `ownerAddress` | Owner's city, state, country | `"Cupertino, CA, US"` |
| `internationalClassification` | Nice Classification codes (list) | `["009", "041", "042"]` |
| `goodsServices` | Description of goods/services covered | `"Computer software..."` |
| `attorney` | Attorney of record | `"John Smith"` |
| `markDrawingCode` | Type of mark (see below) | `"4"` |
| `colorClaimed` | Color claim if any | `"Red and white"` |
| `disclaimers` | Disclaimed portions of the mark | `"No claim to MUSIC"` |

## Mark Drawing Codes

| Code | Meaning |
|---|---|
| `1` | Typed drawing (word-only, no stylization) |
| `2` | Design without text |
| `3` | Design with text |
| `4` | Standard character mark (modern equivalent of typed) |
| `5` | Stylized/special form mark |
| `6` | Color mark |

## Trademark Status Codes

| Status | Meaning |
|---|---|
| `Live/Registered` | Active registered trademark |
| `Live/Pending` | Application filed, awaiting review |
| `Dead/Abandoned` | Application abandoned, not pursued |
| `Dead/Cancelled` | Registration cancelled |
| `Dead/Expired` | Registration lapsed (not renewed) |

## Nice Classification — Common Codes

| Class | Covers |
|---|---|
| 009 | Computer hardware, software, electronics |
| 025 | Clothing, footwear, headwear |
| 030 | Coffee, tea, flour, bread, pastry |
| 035 | Advertising, business management |
| 041 | Education, entertainment, sports |
| 042 | Software as a service, tech services |
| 043 | Restaurants, hotels, food/drink services |
| 044 | Medical, veterinary, health services |

Full 45-class list: https://www.uspto.gov/trademark/trademark-updates-and-announcements/nice-agreement-eleventh-edition-general-remarks-class

## Search Tips

### Proximity Searching
USPTO searches exact word matches. For broader coverage:
- Search root word AND common variants manually
- `CLOUD` then `CLOUDS`, `CLOUDY`, `CLOUDPEAK` separately

### Common Gotchas
- Dead marks can still block registration if famous
- A search showing "available" doesn't mean no conflicts exist
- Common words like "ULTRA", "PREMIUM" are frequently refused
- Geographic terms are often descriptive and hard to register

### Classes to Check for Tech/SaaS
Always search in classes **009, 035, 042** for software/tech products.

### Classes to Check for Consumer Brands
- Apparel: 025
- Food/Beverages: 030, 032, 033, 043
- Health: 044
- Entertainment: 041