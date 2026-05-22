#!/usr/bin/env bash
# Install Claude Code skills from the tools monorepo.
#
# This script clones (or updates) the tools repo to a local store, then symlinks
# the requested skills into your project's .claude/skills/ directory.  Because
# skills are symlinked — not copied — they stay up-to-date with the store.
#
# Usage (from within a clone of this repo):
#   ./scripts/install-skills.sh                          # install all skills into CWD
#   ./scripts/install-skills.sh difference               # install just 'difference'
#   ./scripts/install-skills.sh --global                 # install to ~/.claude/skills/
#   ./scripts/install-skills.sh --target /path/to/proj   # install into a specific project
#
# One-liner (works from any project, no prior clone needed):
#   curl -fsSL https://raw.githubusercontent.com/jonathanhudak/tools/main/scripts/install-skills.sh | bash
#
# Environment variables:
#   TOOLS_STORE   Path where the tools repo is cloned (default: ~/.local/share/tools-monorepo)
set -euo pipefail

REPO_URL="https://github.com/jonathanhudak/tools.git"
STORE_DIR="${TOOLS_STORE:-$HOME/.local/share/tools-monorepo}"
TARGET_DIR=""
GLOBAL=false
SKILLS=()

usage() {
  cat <<EOF
Usage: install-skills.sh [options] [skill ...]

Options:
  --global          Install to ~/.claude/skills/ (available in every project)
  --target <dir>    Install into <dir>/.claude/skills/  (default: current directory)
  --store  <dir>    Where to keep the tools repo clone (default: ~/.local/share/tools-monorepo)
  --help            Show this help

Skills:
  Pass one or more skill names to install only those; omit to install all available skills.
  Currently available: difference
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global)      GLOBAL=true; shift ;;
    --target)      TARGET_DIR="$2"; shift 2 ;;
    --store)       STORE_DIR="$2"; shift 2 ;;
    --help | -h)   usage ;;
    -*)            echo "Unknown option: $1" >&2; exit 1 ;;
    *)             SKILLS+=("$1"); shift ;;
  esac
done

# Resolve install target
if $GLOBAL; then
  TARGET_DIR="$HOME/.claude/skills"
elif [ -z "$TARGET_DIR" ]; then
  TARGET_DIR="${PWD}/.claude/skills"
else
  TARGET_DIR="${TARGET_DIR%/}/.claude/skills"
fi

echo "Tools store : $STORE_DIR"
echo "Install to  : $TARGET_DIR"
echo ""

# Ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required. Install it from https://pnpm.io/installation" >&2
  exit 1
fi

# Clone or update the tools repo
if [ -d "$STORE_DIR/.git" ]; then
  echo "Updating tools repo…"
  git -C "$STORE_DIR" pull --ff-only --quiet || {
    echo "(git pull failed — using cached copy)" >&2
  }
else
  echo "Cloning tools repo to $STORE_DIR…"
  git clone --depth 1 "$REPO_URL" "$STORE_DIR"
fi
echo ""

# Install monorepo dependencies so skills can start dev servers
echo "Installing monorepo dependencies…"
pnpm --dir "$STORE_DIR" install --frozen-lockfile --prefer-offline 2>&1 | tail -3
echo ""

SKILLS_SRC="$STORE_DIR/.claude/skills"

# Discover available skills if none were specified
if [ ${#SKILLS[@]} -eq 0 ]; then
  while IFS= read -r -d '' d; do
    SKILLS+=("$(basename "$d")")
  done < <(find "$SKILLS_SRC" -maxdepth 1 -mindepth 1 -type d -print0 | sort -z)
fi

if [ ${#SKILLS[@]} -eq 0 ]; then
  echo "No skills found in $SKILLS_SRC" >&2
  exit 1
fi

# Symlink each skill into the target directory
mkdir -p "$TARGET_DIR"

for skill in "${SKILLS[@]}"; do
  src="$SKILLS_SRC/$skill"
  dst="$TARGET_DIR/$skill"

  if [ ! -d "$src" ]; then
    echo "  SKIP $skill — not found in $SKILLS_SRC"
    continue
  fi

  if [ -L "$dst" ]; then
    echo "  SKIP $skill — already installed at $dst"
    continue
  fi

  if [ -e "$dst" ]; then
    echo "  SKIP $skill — $dst already exists (not a symlink; remove it to reinstall)"
    continue
  fi

  ln -s "$src" "$dst"
  echo "  OK   $skill → $dst"
done

echo ""
echo "Done."

if ! $GLOBAL && [ "$TARGET_DIR" != "$HOME/.claude/skills" ]; then
  echo "Tip: pass --global to install into ~/.claude/skills/ for use across all projects."
fi
