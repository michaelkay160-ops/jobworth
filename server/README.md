# JobWorth API

This is the V1 backend foundation for the quote flow. It uses Node's built-in HTTP server and filesystem persistence so the pricing and API behavior can be exercised without a framework or hosted database.

## Run locally

```text
cd server
npm test
npm start
```

The API listens on `http://localhost:3000`.

## Endpoints

- `GET /api/health`
- `GET /api/price-book`
- `GET /api/quotes`
- `POST /api/quotes`
- `GET /api/quotes/:id`
- `POST /api/quotes/:id/present`

Quote data is stored in `server/.data/quotes.json` during local development. The runtime data directory is intentionally not committed. Before production use, add authentication, a managed database, request logging, rate limits, and server-side authorization for price-book administration.
