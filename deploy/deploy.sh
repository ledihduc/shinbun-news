#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${SHINBUN_ENV_FILE:-/etc/shinbun-news/deploy.env}"
if [[ -r "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

APP_ROOT="${APP_ROOT:-/srv/shinbun-news}"
REPO_URL="${REPO_URL:-https://github.com/ledihduc/shinbun-news.git}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$APP_ROOT/.npm-cache}"
REPOSITORY="$APP_ROOT/repository.git"
BUILDS="$APP_ROOT/builds"
RELEASES="$APP_ROOT/releases"
LOCK_FILE="$APP_ROOT/deploy.lock"

mkdir -p "$APP_ROOT" "$BUILDS" "$RELEASES"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another deployment is already running; skipping this invocation."
  exit 0
fi

if [[ ! -d "$REPOSITORY" ]]; then
  git clone --bare "$REPO_URL" "$REPOSITORY"
else
  current_origin="$(git --git-dir="$REPOSITORY" remote get-url origin)"
  if [[ "$current_origin" != "$REPO_URL" ]]; then
    git --git-dir="$REPOSITORY" remote set-url origin "$REPO_URL"
  fi
fi

git --git-dir="$REPOSITORY" fetch --prune origin \
  "+refs/heads/$DEPLOY_BRANCH:refs/remotes/origin/$DEPLOY_BRANCH"

commit="$(git --git-dir="$REPOSITORY" rev-parse "refs/remotes/origin/$DEPLOY_BRANCH")"
short_commit="${commit:0:12}"
release_id="$(date -u +%Y%m%dT%H%M%SZ)-$short_commit"
build_dir="$BUILDS/$release_id"
release_dir="$RELEASES/$release_id"

cleanup() {
  status=$?
  if [[ -d "$build_dir" ]]; then
    git --git-dir="$REPOSITORY" worktree remove --force "$build_dir" >/dev/null 2>&1 || true
  fi
  if [[ $status -ne 0 && -d "$release_dir" ]]; then
    rm -rf -- "$release_dir"
  fi
  git --git-dir="$REPOSITORY" worktree prune >/dev/null 2>&1 || true
  exit "$status"
}
trap cleanup EXIT

git --git-dir="$REPOSITORY" worktree add --detach "$build_dir" "$commit"

cd "$build_dir"
if [[ -f package-lock.json ]]; then
  npm ci
fi

SITE_URL="${SITE_URL:-https://shinbun.news}" \
CONTENT_API_URL="${CONTENT_API_URL:-}" \
  npm run build

npm run check

mkdir -p "$release_dir"
mv "$build_dir/dist" "$release_dir/public"
printf '%s\n' "$commit" > "$release_dir/REVISION"
printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$release_dir/DEPLOYED_AT"

next_link="$APP_ROOT/.current-$release_id"
ln -s "$release_dir/public" "$next_link"
mv -Tf "$next_link" "$APP_ROOT/current"

mapfile -t old_releases < <(
  find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr \
    | tail -n "+$((KEEP_RELEASES + 1))" \
    | cut -d' ' -f2-
)

for old_release in "${old_releases[@]}"; do
  [[ -n "$old_release" && "$old_release" == "$RELEASES/"* ]] || continue
  rm -rf -- "$old_release"
done

echo "Deployed $commit to $APP_ROOT/current"
