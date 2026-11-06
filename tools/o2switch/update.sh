#!/bin/bash
# Flore & Chenilles : mise à jour automatique sur o2switch.
#
# À lancer par une tâche cron de cPanel (par exemple toutes les 15 minutes) :
#   /bin/bash $HOME/repositories/app/tools/o2switch/update.sh
# Il récupère les nouveautés publiées sur GitHub et, s'il y en a, remet le site
# à jour avec deploy.sh. S'il n'y a rien de nouveau, il ne fait rien.
set -euo pipefail

main() {
  local repo dest branch before
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  dest="${1:-${HOME:-/home/$(whoami)}/public_html}"
  cd "$repo"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  before="$(git rev-parse HEAD)"
  git fetch -q origin "$branch"
  git merge -q --ff-only FETCH_HEAD
  if [ "$(git rev-parse HEAD)" = "$before" ] && [ -f "$dest/.fc-deployed" ]; then
    exit 0
  fi
  /bin/bash tools/o2switch/deploy.sh "$dest"
}

main "$@"
