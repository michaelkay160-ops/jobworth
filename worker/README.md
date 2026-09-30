# JobWorth Cloudflare API

This is the Cloudflare Workers + D1 version of the JobWorth backend.

## Dashboard setup

1. Create a Worker named `jobworth-api`.
2. Create a D1 database named `jobworth`.
3. Run `schema.sql` in the D1 console.
4. Copy the D1 database ID into `wrangler.toml`.
5. Connect the Worker to the GitHub repository and set the root directory to `worker`.
6. Set the Worker entrypoint to `src/index.js`.

The frontend can then call the Worker URL from the GitHub Pages site. The current seed prices are illustrative and must be validated with electricians before production use.
