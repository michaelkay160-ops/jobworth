# JobWorth V1 Price-Book Schema

The canonical model is JSON-friendly and relationally implementable. IDs are stable UUIDs or equivalent opaque identifiers. Money is stored as integer minor units (for example, cents) with an explicit currency. Percentages are decimal fractions: `0.25` means 25%.

## Entities

### CompanyPricingProfile

```json
{
  "id": "company-pricing-1",
  "currency": "USD",
  "pricingModel": "gross_margin",
  "loadedLaborRateMinor": 9500,
  "defaultOverheadPercent": 0.12,
  "defaultTargetGrossMargin": 0.35,
  "defaultMaterialMarkupPercent": 0.20,
  "roundingIncrementMinor": 500,
  "roundingMode": "nearest",
  "taxMode": "excluded",
  "taxRate": null,
  "quoteValidityDays": 30,
  "activePriceBookVersionId": "pbv-1"
}
```

### PriceBookVersion

Fields: `id`, `name`, `status` (`draft|active|retired`), `effectiveAt`, `createdAt`, `publishedBy`, `changeSummary`.

### TaskTemplate

```json
{
  "id": "task-receptacle-standard",
  "versionId": "pbv-1",
  "sku": "ELEC-OUTLET-STD",
  "name": "Replace standard receptacle",
  "categoryId": "outlets-switches",
  "synonyms": ["replace outlet", "receptacle replacement"],
  "description": "Replace one accessible standard receptacle with a like-for-like device.",
  "customerDescription": "Replace one standard receptacle and test operation.",
  "laborHours": 0.5,
  "includedMaterialIds": ["mat-receptacle-standard", "mat-wire-nuts"],
  "equipmentIds": [],
  "permitFeeIds": [],
  "optionSetIds": ["opt-access"],
  "includedText": ["Remove existing device", "Install and test replacement"],
  "excludedText": ["Wall repair", "Circuit troubleshooting beyond the device"],
  "pricingOverrides": {},
  "status": "active"
}
```

### Category

Fields: `id`, `name`, `displayOrder`, `active`.

### Material

Fields: `id`, `sku`, `name`, `unit`, `unitCostMinor`, `defaultMarkupPercent`, `wasteFactor`, `vendorReference`, `active`.

### Equipment / Fee

Fields: `id`, `name`, `unit`, `unitCostMinor`, `customerVisible`, `active`.

### OptionSet and Option

An option set defines required or optional questions. Each option has a stable key, label, description, price delta or cost delta, and whether it changes labor/material assumptions.

```json
{
  "id": "opt-access",
  "name": "Access condition",
  "required": true,
  "options": [
    {"key": "standard", "label": "Accessible", "priceDeltaMinor": 0},
    {"key": "difficult", "label": "Difficult access", "laborHoursDelta": 0.5, "priceDeltaMinor": 0}
  ]
}
```

### QuotePricingSnapshot

Persist the exact inputs used at presentation time: price-book version, company settings, task versions, selected options, labor rate, all costs, margin target, adjustments, rounding, tax state, and final totals. This is immutable after presentation.

## Validation rules

- `targetGrossMargin` must be greater than or equal to 0 and less than 1.
- `laborHours`, quantities, and waste factors cannot be negative.
- A task must contain a customer description, at least one category, and a pricing basis.
- Material and equipment IDs must resolve within the same active price-book version.
- A price delta must declare whether it is a customer price adjustment or a cost adjustment.
- Published versions are immutable; edits create a new draft version.
- All monetary calculations use integer minor units at the final rounding boundary.
