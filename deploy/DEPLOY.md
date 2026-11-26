# Deploying Momentum (todo.flyziyara.com)

Temporary domain: `todo.flyziyara.com` (will change later).

Runs on the shared EC2 host `3.108.74.113` (also ziyar.flyziyara.com and
aos.flyziyara.com). Momentum is a static build, so there is **no Node process
or pm2 entry** on the server: Caddy serves the files in `/var/www/momentum`
directly and handles HTTPS.

## Redeploy (after any change)

```bash
bash deploy/deploy.sh
```

Builds locally, then rsyncs `dist/` to `/var/www/momentum`. No Caddy reload
needed. Installed PWAs pick up the new version on their next launch.

## One-time setup (already done)

1. Site block from `deploy/Caddyfile.momentum-snippet` appended to
   `/etc/caddy/Caddyfile`, then `caddy validate` and `systemctl reload caddy`.
   Backups of the previous Caddyfile sit next to it as `Caddyfile.bak.<timestamp>`.
2. DNS at GoDaddy (`flyziyara.com`): **A record** `todo` → `3.108.74.113`.
   Caddy issues the certificate automatically once it resolves.

## Moving to the real domain later

1. Add the DNS record for the new domain.
2. Change the site address in `/etc/caddy/Caddyfile` (and this snippet), then
   `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`.
3. Update `deploy/deploy.sh`'s final message.

## Environment

The build reads `VITE_SUPABASE_*` from `.env.local` / `.env.production` at build
time (not needed yet; the app runs on sample data).
