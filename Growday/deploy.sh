#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE=growday
ACTION="${1:-deploy}"

case "$ACTION" in
  deploy)
    git -C "$REPO_DIR" pull --ff-only
    sudo systemctl stop "$SERVICE"
    sudo systemctl start "$SERVICE"
    ;;
  start|stop|restart) sudo systemctl "$ACTION" "$SERVICE" ;;
  status) sudo systemctl status "$SERVICE" --no-pager; exit ;;
  logs) sudo journalctl -u "$SERVICE" -n 80 --no-pager; exit ;;
  *) echo "Usage: $0 {deploy|start|stop|restart|status|logs}" >&2; exit 2 ;;
esac

if [[ "$ACTION" != stop ]]; then
  for attempt in {1..15}; do
    if curl --fail --silent --output /dev/null http://127.0.0.1:4174/; then
      echo "Growday is running. Commit: $(git -C "$REPO_DIR" rev-parse --short HEAD)"
      exit 0
    fi
    sleep 1
  done
  sudo journalctl -u "$SERVICE" -n 30 --no-pager
  exit 1
fi
