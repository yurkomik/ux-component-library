#!/bin/bash
# Storybook Design System Toolkit - Main Entry Point
# Usage: storybook <command> [args]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_usage() {
    echo -e "${BLUE}Storybook Design System Toolkit${NC}"
    echo ""
    echo "Usage: storybook <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  create <name> [type]     Create new component (atom|molecule|organism|showcase)"
    echo "  chromatic <sub>          Visual testing (run|force|status|accept)"
    echo "  review <path>            Review component quality"
    echo "  help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  storybook create UserCard molecule"
    echo "  storybook chromatic run"
    echo "  storybook review src/components/showcase/TeamMemberSelector"
    echo ""
}

if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

COMMAND=$1
shift

case $COMMAND in
    create)
        bash "$SCRIPT_DIR/create-component.sh" "$@"
        ;;
    chromatic)
        bash "$SCRIPT_DIR/chromatic.sh" "$@"
        ;;
    review)
        bash "$SCRIPT_DIR/review.sh" "$@"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
