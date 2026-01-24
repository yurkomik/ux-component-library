#!/bin/bash
# Chromatic Visual Testing Script
# Usage: chromatic.sh <run|force|status|accept>
#
# Uses npm script which loads token from .env.local via dotenv-cli

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

show_usage() {
    echo "Usage: chromatic.sh <subcommand>"
    echo ""
    echo "Subcommands:"
    echo "  run      Standard run (loads token from .env.local)"
    echo "  force    Force rebuild all stories (bypass TurboSnap)"
    echo "  status   Open Chromatic builds page in browser"
    echo "  accept   Auto-accept all current changes"
    echo ""
    echo "Examples:"
    echo "  chromatic.sh run"
    echo "  chromatic.sh force"
}

check_env_file() {
    if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
        echo -e "${RED}Error: .env.local not found${NC}"
        echo ""
        echo "Create it with your Chromatic token:"
        echo "  echo 'CHROMATIC_PROJECT_TOKEN=chpt_xxxxx' > .env.local"
        echo ""
        echo "Get your token at: https://www.chromatic.com/start"
        exit 1
    fi

    if ! grep -q "CHROMATIC_PROJECT_TOKEN" "$PROJECT_ROOT/.env.local" 2>/dev/null; then
        echo -e "${RED}Error: CHROMATIC_PROJECT_TOKEN not found in .env.local${NC}"
        echo ""
        echo "Add your token to .env.local:"
        echo "  echo 'CHROMATIC_PROJECT_TOKEN=chpt_xxxxx' >> .env.local"
        exit 1
    fi
}

run_chromatic() {
    echo -e "${BLUE}Running Chromatic...${NC}"
    echo ""

    cd "$PROJECT_ROOT"

    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo -e "${YELLOW}Note: You have uncommitted changes.${NC}"
        echo -e "${YELLOW}TurboSnap works best with committed changes.${NC}"
        echo ""
    fi

    # Use npm script which has dotenv-cli configured
    npm run chromatic

    echo ""
    echo -e "${GREEN}✅ Chromatic run complete${NC}"
    echo ""
    echo "Review changes at: https://www.chromatic.com/builds?appId=6960ac1ac0bf168806f5afea"
}

run_chromatic_force() {
    echo -e "${BLUE}Running Chromatic with FORCE REBUILD...${NC}"
    echo -e "${YELLOW}This will rebuild ALL stories (bypasses TurboSnap)${NC}"
    echo ""

    cd "$PROJECT_ROOT"

    # Run with force flag via dotenv
    npx dotenv -e .env.local -- npx chromatic --force-rebuild --exit-zero-on-changes

    echo ""
    echo -e "${GREEN}✅ Chromatic force rebuild complete${NC}"
}

run_chromatic_accept() {
    echo -e "${BLUE}Running Chromatic with AUTO-ACCEPT...${NC}"
    echo -e "${YELLOW}All visual changes will be automatically accepted${NC}"
    echo ""

    cd "$PROJECT_ROOT"

    npx dotenv -e .env.local -- npx chromatic --auto-accept-changes

    echo ""
    echo -e "${GREEN}✅ Chromatic auto-accept complete${NC}"
}

show_status() {
    echo -e "${BLUE}Opening Chromatic builds...${NC}"
    echo ""

    # Open in browser (macOS)
    if command -v open &> /dev/null; then
        open "https://www.chromatic.com/builds?appId=6960ac1ac0bf168806f5afea"
    else
        echo "View your builds at:"
        echo "  https://www.chromatic.com/builds?appId=6960ac1ac0bf168806f5afea"
    fi
}

if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

SUBCOMMAND=$1

# Check for env file (except for status/help)
if [[ "$SUBCOMMAND" != "status" && "$SUBCOMMAND" != "help" ]]; then
    check_env_file
fi

case $SUBCOMMAND in
    run)
        run_chromatic
        ;;
    force)
        run_chromatic_force
        ;;
    status)
        show_status
        ;;
    accept)
        run_chromatic_accept
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown subcommand: $SUBCOMMAND${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
