# JobWorth V1 Acceptance Criteria and Implementation Backlog

## Release acceptance criteria

### Quote creation

- A contractor can create and save a draft quote in under five minutes using keyboard and mouse.
- Required customer and address fields are clearly marked and validated inline.
- Drafts survive refresh and can be reopened from the quote list.

### Price-book workflow

- A contractor can search, browse, and add a task from the electrician starter catalog.
- Required task options block completion until answered.
- The builder recalculates immediately when quantity or an option changes.
- The contractor can inspect the calculation basis without exposing it to the customer.

### Pricing integrity

- The same inputs always produce the same rounded price.
- A negative adjustment or price below floor requires a reason.
- Presented quotes retain their original price-book version and totals after later catalog edits.
- The UI distinguishes calculated price, contractor adjustment, tax, and total.

### Customer output

- Customer view includes company identity, customer/job details, scope, inclusions, exclusions, total, validity, and next step.
- Customer view contains no labor hours, costs, margins, internal notes, or hidden calculation data.
- Print/PDF output is readable on one or more pages without clipped totals or missing scope.

### Administration

- An owner can edit pricing defaults, create a task, deactivate a task, and publish a new price-book version.
- Publishing shows a preview of changed tasks and requires confirmation.
- Audit history records who changed what and when.

### Quality and safety

- No quote data is lost on normal navigation, refresh, or a failed save retry.
- Permissions prevent non-admin users from publishing price-book changes.
- Automated tests cover pricing formulas, rounding, required options, immutable snapshots, and customer-view redaction.

## Prioritized backlog

### P0 — foundation

1. Create application shell preserving existing JobWorth brand tokens and site navigation.
2. Define persistence for company profile, price-book versions, tasks, materials, options, quotes, and snapshots.
3. Implement deterministic pricing service and unit tests.
4. Seed electrician categories, materials, and representative tasks.
5. Implement quote draft lifecycle and autosave.

### P0 — contractor quoting flow

6. Quote list and new-quote setup.
7. Task search/category browse.
8. Task scope drawer with required options.
9. Quote builder with quantity/edit/remove.
10. Calculation details panel with contractor-only data.
11. Adjustment controls and reason validation.
12. Review, customer preview, and present action.

### P1 — operational confidence

13. Printable/shareable customer quote output.
14. Price-book admin screens and version publishing.
15. Audit log and basic role checks.
16. Error recovery, retry, empty states, loading states, and accessibility pass.
17. Pilot analytics: time-to-quote, task usage, adjustment frequency, and abandoned drafts.

### P2 — after pilot evidence

18. Email delivery and customer acceptance.
19. Company-specific price-book import/export.
20. Multi-location or regional adjustments.
21. CRM/accounting integrations.
22. Additional trades and mobile optimization.

## Recommended implementation sequence

Build the pricing service and data fixtures first, then the quote builder against fixtures, then persistence, then the customer presentation and admin workflows. This keeps pricing behavior testable before UI complexity grows.

## Pilot definition of done

Three electricians can independently create five representative quotes each from a short job brief. At least 80% of quotes require no manual price override, median time to a presentable quote is under five minutes, and every pilot participant can explain why the calculated price changed when scope options changed.
