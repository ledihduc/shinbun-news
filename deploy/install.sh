#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this installer with sudo."
  exit 1
fi

for command in git node npm flock runuser systemctl openssl; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "Missing required command: $command"
    exit 1
  }
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_USER="shinbun-news"
INSTALL_DIR="/opt/shinbun-news"
CONFIG_DIR="/etc/shinbun-news"
APP_ROOT="/srv/shinbun-news"
ENV_FILE="$CONFIG_DIR/deploy.env"

if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /var/lib/shinbun-news --shell /usr/sbin/nologin "$SERVICE_USER"
fi

install -d -m 0755 "$INSTALL_DIR" "$CONFIG_DIR" "$APP_ROOT"
install -m 0644 "$SCRIPT_DIR/webhook-server.mjs" "$INSTALL_DIR/webhook-server.mjs"
install -m 0755 "$SCRIPT_DIR/deploy.sh" "$INSTALL_DIR/deploy.sh"
install -m 0644 "$SCRIPT_DIR/shinbun-news-webhook.service" /etc/systemd/system/shinbun-news-webhook.service

if [[ ! -f "$ENV_FILE" ]]; then
  secret="$(openssl rand -hex 32)"
  cat > "$ENV_FILE" <<EOF
WEBHOOK_SECRET=$secret
WEBHOOK_HOST=127.0.0.1
WEBHOOK_PORT=9010
WEBHOOK_PATH=/_deploy/github
DEPLOY_SCRIPT=/opt/shinbun-news/deploy.sh
DEPLOY_BRANCH=main
REPO_URL=https://github.com/ledihduc/shinbun-news.git
APP_ROOT=/srv/shinbun-news
SITE_URL=https://shinbun.news
KEEP_RELEASES=5
# CONTENT_API_URL=https://api.example.com/articles
EOF
  chmod 0640 "$ENV_FILE"
  chown root:"$SERVICE_USER" "$ENV_FILE"
  echo "Created $ENV_FILE. Save WEBHOOK_SECRET in GitHub before leaving this shell."
else
  echo "Keeping existing $ENV_FILE."
fi

chown -R "$SERVICE_USER":"$SERVICE_USER" "$APP_ROOT"

runuser -u "$SERVICE_USER" -- "$INSTALL_DIR/deploy.sh"
systemctl daemon-reload
systemctl enable --now shinbun-news-webhook.service

echo
echo "Installation complete."
echo "1. Add the Nginx server block from: $SCRIPT_DIR/nginx-shinbun-news.conf"
echo "2. Create a GitHub webhook for https://shinbun.news/_deploy/github"
echo "3. Copy WEBHOOK_SECRET from $ENV_FILE into the webhook Secret field"
echo "4. Select application/json and the push event only"
