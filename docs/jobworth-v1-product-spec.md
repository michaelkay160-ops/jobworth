# JobWorth V1 Product Specification

Status: implementation baseline
Audience: product, design, engineering, electrician pilot users
Scope: electrician-first flat-rate quoting for residential service work

## 1. Product outcome

JobWorth lets an electrician turn a customer request into a defensible, customer-ready flat-rate quote in minutes. The product calculates a price from a controlled price book, makes the assumptions visible to the contractor, and keeps the customer-facing output simple.

V1 is a quoting product, not a full field-service-management system. It does not include dispatch, invoicing, payments, inventory purchasing, accounting, payroll, CRM integrations, or a native mobile app.

## 2. Approved V1 workflow

```text
Start quote
  -> identify customer and job address
  -> choose service category
  -> search or browse price-book tasks
  -> add one or more tasks
  -> answer task-specific scope questions
  -> review included work, exclusions, and assumptions
  -> JobWorth calculates flat-rate price
  -> optionally adjust quantity, options, discount, or internal notes
  -> review quote totals and customer presentation
  -> generate customer-facing quote
  -> save quote as draft or mark presented
```

### 2.1 Workflow rules

1. A quote must have a customer, a service location, and at least one task before it can be presented.
2. A task cannot be priced until all required scope questions have an answer.
3. The contractor sees the pricing breakdown; the customer sees a clean line-item price and included work.
4. The calculated price is a recommendation that the contractor may override only with an explicit reason.
5. Every presented quote stores a pricing snapshot. Later price-book edits must not change historical quotes.
6. Taxes are excluded from V1 unless the company explicitly enables a tax rate. The quote must label whether tax is included, excluded, or not configured.
7. Unpriced or custom work is allowed only through a clearly labeled custom line item and requires a manual price.
8. No quote may be silently overwritten. Recalculation creates a new version or records a new pricing snapshot.

## 3. Personas and jobs to be done

### Contractor / estimator

Needs to price common residential electrical work consistently while standing with a customer. Wants speed, confidence, and control over unusual conditions.

### Customer

Needs a concise quote that explains what is included, the total price, important assumptions, and how to accept or ask a question.

### Owner / price-book administrator

Needs to set company pricing defaults, manage task templates, and review whether the price book is being used consistently.

## 4. V1 functional requirements

### Quote setup

- Create a quote with customer name, phone/email, service address, project title, and optional notes.
- Reuse a customer record when one exists; do not require a separate CRM.
- Save drafts automatically.
- Show quote status: Draft, Presented, Accepted, Declined, Expired, Archived.

### Task selection

- Browse by category and search by task name or synonym.
- Add multiple quantities of a task.
- Support task-specific options such as access difficulty, panel amperage, fixture type, or permit requirement.
- Show a short description before adding.
- Prevent inactive tasks from being added to new quotes.

### Pricing

- Calculate labor, materials, equipment, permits/fees, overhead allocation, and profit using company settings and task overrides.
- Show contractor-only calculation details and the final customer price.
- Support an explicit contractor adjustment as a dollar amount or percentage.
- Require a reason for a negative adjustment or a price below the configured floor.
- Round customer prices according to company settings.

### Customer presentation

- Generate a printable/shareable quote view.
- Include company branding, customer/job details, scope, included work, exclusions, total, validity period, and acceptance instructions.
- Exclude internal cost, margin, labor hours, and internal notes.
- Allow download/print; email sending can be a later integration, so V1 may use a shareable view or PDF export.

### Price-book administration

- Edit company defaults.
- Create, edit, duplicate, deactivate, and version task templates.
- Maintain material catalog entries and cost basis.
- Preview the resulting sell price before publishing changes.
- Keep an audit trail of price-book changes.

## 5. Screen and interaction specification

### S1. Quote list

Primary action: New quote. Search by customer, address, or quote number. Filter by status and date. Each row shows customer, job, amount, status, updated time, and open action.

Empty state: explain the workflow and offer New quote.

### S2. Quote setup

Fields: customer name, phone, email, address, project title, optional customer-facing note. Continue is disabled until customer name and address are present. Save draft is always available.

### S3. Add work

Left/main area: search and category navigation. Results show task name, short description, and starting price/range only if configured for contractor visibility. Selecting a task opens its scope drawer.

Scope drawer: required questions first, optional add-ons second, included/excluded work, quantity, and Add to quote. The task is not added until required questions are complete.

### S4. Quote builder

Shows a task list with quantity, selected options, customer-facing description, and line price. Each line can be edited, duplicated, or removed. A summary panel shows subtotal, adjustment, tax state, and total. Contractor-only link opens calculation details.

Primary actions: Add work, Review quote. Secondary: Save draft, Preview customer view.

### S5. Calculation details

Read-only by default. Shows each line's labor basis, material basis, equipment/permit cost, overhead allocation, target margin/profit, sell price, and floor/ceiling checks. Manual adjustment is available with a reason.

### S6. Review and present

Two tabs: Contractor review and Customer preview. Contractor review surfaces missing assumptions, warnings, internal notes, and price adjustments. Customer preview hides all internal data.

Present quote validates required fields, freezes the pricing snapshot, assigns a quote number, and changes status to Presented.

### S7. Price-book settings

Sections: company defaults, task catalog, materials, option sets, rounding, tax behavior, quote validity, and audit history. Publishing changes requires confirmation and displays impacted tasks.

## 6. Pricing model

For each line item:

```text
labor_cost       = labor_hours * loaded_labor_rate
material_cost    = sum(material.quantity * material.unit_cost)
equipment_cost   = sum(equipment.quantity * equipment.unit_cost)
permit_cost      = sum(permit/fee amounts)
direct_cost      = labor_cost + material_cost + equipment_cost + permit_cost
overhead_amount  = configured allocation applied to direct cost or labor cost
cost_basis       = direct_cost + overhead_amount
target_price     = cost_basis / (1 - target_gross_margin)
sell_price       = round(target_price + fixed adjustments, configured increment)
```

The schema supports a markup model as an alternative, but a single company must choose one active default to avoid ambiguous pricing. V1 defaults to gross-margin pricing because it makes the target economics explicit.

## 7. Out of scope

Dispatch and scheduling; route optimization; invoices/payments; inventory sync; supplier purchasing; time tracking; payroll; customer portal accounts; native mobile; multi-trade catalogs; automatic code/permit research; AI-generated scope; accounting/CRM integrations; multi-company tenancy beyond the minimum data separation needed by the implementation.

## 8. Decision log / assumptions to validate

- V1 starts with residential electrical service work.
- One company profile and one active price-book version are sufficient for the first pilot.
- A contractor can manually override a calculated price, but the system records the reason.
- The starter catalog is illustrative until validated against contractor jobs, local labor/material costs, and desired margin.
- Quote acceptance can be represented by status in V1; legally binding e-signature is not required for the first pilot.
