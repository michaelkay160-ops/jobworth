# JobWorth

JobWorth is an electrician-first flat-rate quoting product. V1 helps a contractor select work, answer scope questions, calculate a consistent price from a company price book, and present a customer-ready quote.

## Product documentation

- [V1 product specification](docs/jobworth-v1-product-spec.md)
- [Price-book schema](docs/price-book-schema.md)
- [Acceptance criteria and implementation backlog](docs/v1-acceptance-and-backlog.md)
- [Illustrative electrician price-book seed](data/electrician-price-book.seed.json)

The starter price-book data is intentionally marked illustrative and must be validated against pilot contractors and local costs before production use.


## Prototype

The current dependency-free prototype is available at [index.html](index.html). It implements the first quote flow slice: customer setup, task selection, deterministic pricing, review, and customer presentation.

For a browser preview, enable GitHub Pages for the `main` branch or open `index.html` locally.
