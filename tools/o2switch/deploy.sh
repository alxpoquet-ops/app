#!/bin/bash
# Flore & Chenilles : copie le site dans le dossier web de l'hébergement o2switch.
#
# Lancé par cPanel (bouton « Deploy HEAD Commit », grâce au fichier .cpanel.yml)
# et par update.sh (mise à jour automatique). Il copie uniquement les fichiers
# du site : ni les outils, ni le README, ni l'historique Git.
#
# Dossier de destination : public_html par défaut, ou celui donné en argument
# (par exemple pour un domaine supplémentaire) :
#   bash tools/o2switch/deploy.sh /home/identifiant/floreetchenilles.fr
set -euo pipefail

main() {
  local repo dest list
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  dest="${1:-${HOME:-/home/$(whoami)}/public_html}"
  cd "$repo"
  mkdir -p "$dest"
  list="$(mktemp)"
  git -c core.quotepath=off ls-files \
    | grep -Ev '^(tools/|wordpress/|README\.md$|\.cpanel\.yml$|\.nojekyll$|\.gitignore$|\.github/)' > "$list"

  # Retire du serveur les fichiers supprimés du site depuis la dernière mise en ligne
  # (uniquement des fichiers que ce script avait copiés lui-même).
  if [ -f "$dest/.fc-deployed" ]; then
    grep -Fvxf "$list" "$dest/.fc-deployed" | while IFS= read -r f; do
      rm -f -- "$dest/$f"
    done || true
  fi

  while IFS= read -r f; do
    mkdir -p "$dest/$(dirname "$f")"
    cp -p -- "$f" "$dest/$f"
  done < "$list"

  cp "$list" "$dest/.fc-deployed"
  rm -f "$list"
  echo "Site copié dans $dest ($(wc -l < "$dest/.fc-deployed") fichiers, version $(git rev-parse --short HEAD))"
}

main "$@"
