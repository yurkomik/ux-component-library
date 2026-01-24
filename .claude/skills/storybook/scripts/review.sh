#!/bin/bash
# Component Review Script
# Usage: review.sh <component-path> [--type component|story|both]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

show_usage() {
    echo "Usage: review.sh <component-path> [--type component|story|both]"
    echo ""
    echo "Arguments:"
    echo "  component-path   Path to component file or directory"
    echo "  --type           What to review: component, story, or both (default: both)"
    echo ""
    echo "Examples:"
    echo "  review.sh src/components/showcase/TeamMemberSelector"
    echo "  review.sh src/components/ui/button/button.tsx --type component"
    echo "  review.sh Button.stories.tsx --type story"
}

if [ -z "$1" ]; then
    echo -e "${RED}Error: Component path required${NC}"
    show_usage
    exit 1
fi

COMPONENT_PATH=$1
REVIEW_TYPE="both"

# Parse arguments
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            REVIEW_TYPE="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Validate review type
case $REVIEW_TYPE in
    component|story|both)
        ;;
    *)
        echo -e "${RED}Error: Invalid type '$REVIEW_TYPE'. Must be: component, story, or both${NC}"
        exit 1
        ;;
esac

# Resolve path
if [[ "$COMPONENT_PATH" != /* ]]; then
    COMPONENT_PATH="$PROJECT_ROOT/$COMPONENT_PATH"
fi

# If directory, find component file
if [ -d "$COMPONENT_PATH" ]; then
    COMPONENT_DIR="$COMPONENT_PATH"
    # Get component name from directory
    COMPONENT_NAME=$(basename "$COMPONENT_DIR")
    COMPONENT_FILE="$COMPONENT_DIR/$COMPONENT_NAME.tsx"
    STORY_FILE="$COMPONENT_DIR/$COMPONENT_NAME.stories.tsx"
else
    # It's a file path
    COMPONENT_DIR=$(dirname "$COMPONENT_PATH")
    if [[ "$COMPONENT_PATH" == *".stories."* ]]; then
        STORY_FILE="$COMPONENT_PATH"
        COMPONENT_FILE="${COMPONENT_PATH/.stories./.}"
    else
        COMPONENT_FILE="$COMPONENT_PATH"
        STORY_FILE="${COMPONENT_PATH/.tsx/.stories.tsx}"
    fi
    COMPONENT_NAME=$(basename "$COMPONENT_FILE" .tsx)
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  STORYBOOK COMPONENT REVIEW: ${CYAN}$COMPONENT_NAME${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check files exist
if [[ "$REVIEW_TYPE" == "component" || "$REVIEW_TYPE" == "both" ]]; then
    if [ ! -f "$COMPONENT_FILE" ]; then
        echo -e "${RED}Component file not found: $COMPONENT_FILE${NC}"
        exit 1
    fi
    echo -e "Component: ${GREEN}$COMPONENT_FILE${NC}"
fi

if [[ "$REVIEW_TYPE" == "story" || "$REVIEW_TYPE" == "both" ]]; then
    if [ ! -f "$STORY_FILE" ]; then
        echo -e "${RED}Story file not found: $STORY_FILE${NC}"
        exit 1
    fi
    echo -e "Stories:   ${GREEN}$STORY_FILE${NC}"
fi

echo ""

# Component Review
if [[ "$REVIEW_TYPE" == "component" || "$REVIEW_TYPE" == "both" ]]; then
    echo -e "${MAGENTA}─────────────────────────────────────────────────────────────────${NC}"
    echo -e "${MAGENTA}  COMPONENT FILE REVIEW${NC}"
    echo -e "${MAGENTA}─────────────────────────────────────────────────────────────────${NC}"
    echo ""

    COMPONENT_CONTENT=$(cat "$COMPONENT_FILE")

    # Architecture checks
    echo -e "${CYAN}ARCHITECTURE${NC}"

    # Check for props interface
    if echo "$COMPONENT_CONTENT" | grep -q "interface.*Props"; then
        echo -e "  ${GREEN}✓${NC} Props interface defined"
    else
        echo -e "  ${RED}✗${NC} Missing Props interface"
    fi

    # Check for JSDoc
    if echo "$COMPONENT_CONTENT" | grep -q "/\*\*"; then
        echo -e "  ${GREEN}✓${NC} JSDoc documentation present"
    else
        echo -e "  ${YELLOW}○${NC} Missing JSDoc documentation"
    fi

    # Check for default export
    if echo "$COMPONENT_CONTENT" | grep -q "export default"; then
        echo -e "  ${YELLOW}○${NC} Uses default export (prefer named export)"
    else
        echo -e "  ${GREEN}✓${NC} Uses named export"
    fi

    # Check for TypeScript types
    if echo "$COMPONENT_CONTENT" | grep -q ": React.FC\|: FC<"; then
        echo -e "  ${YELLOW}○${NC} Uses React.FC (prefer standard function)"
    else
        echo -e "  ${GREEN}✓${NC} Uses standard function component"
    fi

    echo ""
    echo -e "${CYAN}HOOKS & STATE${NC}"

    # Check for useCallback/useMemo
    CALLBACK_COUNT=$(echo "$COMPONENT_CONTENT" | grep -c "useCallback" || true)
    MEMO_COUNT=$(echo "$COMPONENT_CONTENT" | grep -c "useMemo" || true)
    echo -e "  ${BLUE}○${NC} useCallback usage: $CALLBACK_COUNT"
    echo -e "  ${BLUE}○${NC} useMemo usage: $MEMO_COUNT"

    # Check for useEffect
    EFFECT_COUNT=$(echo "$COMPONENT_CONTENT" | grep -c "useEffect" || true)
    if [ "$EFFECT_COUNT" -gt 0 ]; then
        echo -e "  ${BLUE}○${NC} useEffect count: $EFFECT_COUNT (verify dependencies)"
    fi

    echo ""
    echo -e "${CYAN}ACCESSIBILITY${NC}"

    # Check for aria labels
    ARIA_COUNT=$(echo "$COMPONENT_CONTENT" | grep -c "aria-" || true)
    if [ "$ARIA_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} ARIA attributes present ($ARIA_COUNT found)"
    else
        echo -e "  ${YELLOW}○${NC} No ARIA attributes found (may be needed)"
    fi

    # Check for role attributes
    if echo "$COMPONENT_CONTENT" | grep -q 'role="'; then
        echo -e "  ${GREEN}✓${NC} Role attributes present"
    fi

    echo ""
    echo -e "${CYAN}CODE QUALITY${NC}"

    # Count lines
    LINE_COUNT=$(wc -l < "$COMPONENT_FILE" | tr -d ' ')
    if [ "$LINE_COUNT" -gt 300 ]; then
        echo -e "  ${YELLOW}○${NC} File is large ($LINE_COUNT lines) - consider splitting"
    else
        echo -e "  ${GREEN}✓${NC} Reasonable file size ($LINE_COUNT lines)"
    fi

    # Check for inline functions in JSX
    if echo "$COMPONENT_CONTENT" | grep -q "onClick={() =>"; then
        echo -e "  ${YELLOW}○${NC} Inline arrow functions in JSX (consider useCallback)"
    fi

    echo ""
fi

# Story Review
if [[ "$REVIEW_TYPE" == "story" || "$REVIEW_TYPE" == "both" ]]; then
    echo -e "${MAGENTA}─────────────────────────────────────────────────────────────────${NC}"
    echo -e "${MAGENTA}  STORY FILE REVIEW${NC}"
    echo -e "${MAGENTA}─────────────────────────────────────────────────────────────────${NC}"
    echo ""

    STORY_CONTENT=$(cat "$STORY_FILE")

    echo -e "${CYAN}STRUCTURE${NC}"

    # Check for meta export
    if echo "$STORY_CONTENT" | grep -q "const meta.*Meta<"; then
        echo -e "  ${GREEN}✓${NC} Meta configuration present"
    else
        echo -e "  ${RED}✗${NC} Missing meta configuration"
    fi

    # Check for autodocs tag
    if echo "$STORY_CONTENT" | grep -q "tags:.*autodocs"; then
        echo -e "  ${GREEN}✓${NC} Autodocs tag enabled"
    else
        echo -e "  ${YELLOW}○${NC} Autodocs tag not enabled"
    fi

    # Check for Chromatic config
    if echo "$STORY_CONTENT" | grep -q "chromatic:"; then
        echo -e "  ${GREEN}✓${NC} Chromatic configuration present"
    else
        echo -e "  ${YELLOW}○${NC} No Chromatic viewport config"
    fi

    # Check for default args (critical for controls)
    if echo "$STORY_CONTENT" | grep -qE "^\s*args:\s*\{" | head -1; then
        echo -e "  ${GREEN}✓${NC} Default args defined in meta"
    else
        echo -e "  ${YELLOW}○${NC} No default args in meta (controls may not show defaults)"
    fi

    echo ""
    echo -e "${CYAN}STORIES${NC}"

    # Count stories
    STORY_COUNT=$(echo "$STORY_CONTENT" | grep -c "export const.*Story" || true)
    echo -e "  ${BLUE}○${NC} Total stories: $STORY_COUNT"

    # Check for Default story
    if echo "$STORY_CONTENT" | grep -q "export const Default"; then
        echo -e "  ${GREEN}✓${NC} Default story present"
    else
        echo -e "  ${RED}✗${NC} Missing Default story"
    fi

    # Check for interaction tests
    if echo "$STORY_CONTENT" | grep -q "play:"; then
        PLAY_COUNT=$(echo "$STORY_CONTENT" | grep -c "play:" || true)
        echo -e "  ${GREEN}✓${NC} Interaction tests present ($PLAY_COUNT stories)"
    else
        echo -e "  ${YELLOW}○${NC} No interaction tests (play functions)"
    fi

    echo ""
    echo -e "${CYAN}DOCUMENTATION${NC}"

    # Check for story descriptions
    if echo "$STORY_CONTENT" | grep -q "description:"; then
        echo -e "  ${GREEN}✓${NC} Story descriptions present"
    else
        echo -e "  ${YELLOW}○${NC} Missing story descriptions"
    fi

    # Check for argTypes
    if echo "$STORY_CONTENT" | grep -q "argTypes:"; then
        echo -e "  ${GREEN}✓${NC} argTypes configuration present"
    else
        echo -e "  ${YELLOW}○${NC} No argTypes configuration"
    fi

    # Check for defaultValue in argTypes
    if echo "$STORY_CONTENT" | grep -q "defaultValue:"; then
        echo -e "  ${GREEN}✓${NC} Default values documented in argTypes"
    else
        echo -e "  ${YELLOW}○${NC} Consider adding defaultValue to argTypes for documentation"
    fi

    echo ""
    echo -e "${CYAN}COVERAGE GAPS${NC}"

    # Check for common story types
    STORY_NAMES=$(echo "$STORY_CONTENT" | grep "export const" | sed 's/export const \([^:]*\).*/\1/')

    if ! echo "$STORY_NAMES" | grep -qi "disabled"; then
        echo -e "  ${YELLOW}○${NC} Consider adding: Disabled state"
    fi

    if ! echo "$STORY_NAMES" | grep -qi "loading"; then
        echo -e "  ${YELLOW}○${NC} Consider adding: Loading state"
    fi

    if ! echo "$STORY_NAMES" | grep -qi "error\|empty"; then
        echo -e "  ${YELLOW}○${NC} Consider adding: Error/Empty state"
    fi

    echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  REVIEW COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Legend:"
echo -e "  ${GREEN}✓${NC} = Good"
echo -e "  ${YELLOW}○${NC} = Consider improving"
echo -e "  ${RED}✗${NC} = Issue found"
echo -e "  ${BLUE}○${NC} = Informational"
echo ""
