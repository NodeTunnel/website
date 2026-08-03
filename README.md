# nodetunnel-website

The NodeTunnel site to handle signups and appIDs. Built with SvelteKit and deployed to **Cloudflare Workers** via [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare). Data lives in **Cloudflare D1** (a single `nodetunnel` database).

## Bindings

| Binding                | Set via                      | Purpose                              |
| ---------------------- | ---------------------------- | ------------------------------------ |
| `DB`                   | `wrangler.jsonc`             | users, apps, sessions                |
| `RELAY_TOKEN`          | `wrangler secret put`        | auth for the `/app-exists` endpoint  |
| `TURNSTILE_SITE_KEY`   | `vars` block or CF dashboard | shows the signup CAPTCHA             |
| `TURNSTILE_SECRET_KEY` | `wrangler secret put`        | checks the CAPTCHA server-side       |
| `*_LIMITER`, `ASSETS`  | `wrangler.jsonc`             | rate limits, static assets: no setup |

## Self-hosting

Change these before your first deploy:

- `database_id` in `wrangler.jsonc`: use the id from your own `wrangler d1 create nodetunnel`
- `name` in `wrangler.jsonc`: your worker name
- Turnstile keys: make a widget in the Cloudflare dashboard to get both
- `RELAY_TOKEN`: the relay server sends this as `X-Relay-Token`, so set the same value in both places

## Developing

```sh
pnpm install
# one-time: seed a local D1 database from the migrations
pnpm exec wrangler d1 migrations apply nodetunnel --local
# local secrets, including Turnstile test keys that always pass
cp .dev.vars.example .dev.vars
pnpm run dev
```

To block committing `.dev.vars`, run `git config core.hooksPath .githooks` once.

## Deploying

First-time setup:

```sh
# create the D1 database and paste the returned id into wrangler.jsonc
pnpm exec wrangler d1 create nodetunnel
# apply every migration to the remote database
pnpm exec wrangler d1 migrations apply nodetunnel --remote
pnpm exec wrangler secret put RELAY_TOKEN
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

Then run `pnpm run deploy`.

## License

[MIT](./LICENSE)
