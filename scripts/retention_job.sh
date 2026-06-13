#!/usr/bin/env bash
# Retention job: delete logs older than 30 days
# Assumes logs are stored in ./logs/*.log

set -euo pipefail

LOG_DIR="$(dirname "$(realpath "$0")")/../logs"
if [[ ! -d "$LOG_DIR" ]]; then
  echo "Log directory $LOG_DIR does not exist. Nothing to clean."
  exit 0
fi

find "$LOG_DIR" -type f -name "*.log" -mtime +30 -print -delete

echo "Retention job completed: old logs removed."
