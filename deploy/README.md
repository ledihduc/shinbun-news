# VPS deployment without GitHub Actions

This deployment flow does not build on GitHub. A push to `main` makes GitHub send a signed webhook; the VPS verifies it, pulls the commit, builds and checks the site locally, then atomically switches Nginx to the new release.

## 1. Prepare an Ubuntu/Debian VPS

Install Node.js 20 or newer, Git and Nginx. Clone this repository once, then run:

```bash
sudo bash deploy/install.sh
```

The installer creates:

- `/etc/shinbun-news/deploy.env`: secret and deployment settings;
- `/opt/shinbun-news`: webhook and deployment programs;
- `/srv/shinbun-news/current`: symlink to the active static release;
- `shinbun-news-webhook.service`: a loopback-only webhook service.

The initial build also runs on the VPS. No GitHub Actions workflow is used.

## 2. Configure Nginx and HTTPS

Copy `deploy/nginx-shinbun-news.conf` into the appropriate Nginx site, adjust the domain if needed, enable HTTPS with your existing certificate or Certbot, then validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Only `/_deploy/github` is proxied to the deployment service. Do not expose port `9010` in the firewall.

## 3. Create the GitHub webhook

In the repository, open **Settings → Webhooks → Add webhook** and use:

- Payload URL: `https://shinbun.news/_deploy/github`
- Content type: `application/json`
- Secret: the value of `WEBHOOK_SECRET` in `/etc/shinbun-news/deploy.env`
- Events: **Just the push event**
- Active: enabled

GitHub sends source code metadata and the signed event only. The VPS does the `git fetch`, `npm run build` and `npm run check` work.

## 4. Add an external content API if needed

Edit `/etc/shinbun-news/deploy.env`:

```bash
CONTENT_API_URL=https://api.example.com/articles
SITE_URL=https://shinbun.news
```

Then restart the webhook service:

```bash
sudo systemctl restart shinbun-news-webhook.service
```

Publishing an article in a CMS can call the same signed endpoint only if it implements GitHub's `X-Hub-Signature-256` format. Otherwise, add a separate CMS webhook endpoint and secret rather than disabling signature validation.

## Operations

Check service logs:

```bash
sudo journalctl -u shinbun-news-webhook.service -f
```

Trigger a manual deployment on the VPS:

```bash
sudo -u shinbun-news /opt/shinbun-news/deploy.sh
```

Roll back by pointing `current` to an earlier release and reloading Nginx:

```bash
sudo ln -sfn /srv/shinbun-news/releases/RELEASE_ID/public /srv/shinbun-news/current
sudo systemctl reload nginx
```

The deploy script allows only one build at a time, keeps the last five successful releases, and does not switch `current` when build or validation fails.
