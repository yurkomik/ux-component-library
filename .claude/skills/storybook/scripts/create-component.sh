#!/bin/bash
# Create Component Script
# Usage: create-component.sh <ComponentName> [atom|molecule|organism|showcase]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_usage() {
    echo "Usage: create-component.sh <ComponentName> [type]"
    echo ""
    echo "Arguments:"
    echo "  ComponentName   PascalCase component name (e.g., UserCard)"
    echo "  type            atom | molecule | organism | showcase (default: atom)"
    echo ""
    echo "Examples:"
    echo "  create-component.sh Button atom"
    echo "  create-component.sh SearchInput molecule"
    echo "  create-component.sh DataTable organism"
    echo "  create-component.sh BudgetWizard showcase"
}

if [ -z "$1" ]; then
    echo -e "${RED}Error: Component name required${NC}"
    show_usage
    exit 1
fi

COMPONENT_NAME=$1
COMPONENT_TYPE=${2:-atom}

# Validate component type
case $COMPONENT_TYPE in
    atom|molecule|organism|showcase)
        ;;
    *)
        echo -e "${RED}Error: Invalid type '$COMPONENT_TYPE'. Must be: atom, molecule, organism, or showcase${NC}"
        exit 1
        ;;
esac

# Determine folder
case $COMPONENT_TYPE in
    atom)
        FOLDER="ui"
        ;;
    molecule)
        FOLDER="molecules"
        ;;
    organism)
        FOLDER="organisms"
        ;;
    showcase)
        FOLDER="showcase"
        ;;
esac

COMPONENT_DIR="$PROJECT_ROOT/src/components/$FOLDER/$COMPONENT_NAME"

# Check if already exists
if [ -d "$COMPONENT_DIR" ]; then
    echo -e "${YELLOW}Warning: Component directory already exists: $COMPONENT_DIR${NC}"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Create directory
mkdir -p "$COMPONENT_DIR"

# Get capitalized type for titles
COMPONENT_TYPE_TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${COMPONENT_TYPE:0:1})${COMPONENT_TYPE:1}"

echo -e "${BLUE}Creating $COMPONENT_TYPE_TITLE: $COMPONENT_NAME${NC}"

# Create component file
cat > "$COMPONENT_DIR/$COMPONENT_NAME.tsx" << EOF
import { cn } from '@/lib/utils'

/* ============================================================================
   $COMPONENT_NAME - $COMPONENT_TYPE_TITLE
   ============================================================================ */

export interface ${COMPONENT_NAME}Props {
  /** Additional CSS classes */
  className?: string
  /** Content to render */
  children?: React.ReactNode
}

/**
 * $COMPONENT_NAME component.
 *
 * @example
 * \`\`\`tsx
 * <$COMPONENT_NAME>Content</$COMPONENT_NAME>
 * \`\`\`
 */
export function $COMPONENT_NAME({
  className,
  children,
}: ${COMPONENT_NAME}Props) {
  return (
    <div
      className={cn(
        // Base styles
        'relative',
        className
      )}
    >
      {children || '$COMPONENT_NAME'}
    </div>
  )
}
EOF

echo -e "${GREEN}  ✓ Created $COMPONENT_NAME.tsx${NC}"

# Determine story title based on type
case $COMPONENT_TYPE in
    atom)
        STORY_TITLE="UI/$COMPONENT_NAME"
        ;;
    molecule)
        STORY_TITLE="Molecules/$COMPONENT_NAME"
        ;;
    organism)
        STORY_TITLE="Organisms/$COMPONENT_NAME"
        ;;
    showcase)
        STORY_TITLE="Showcase/$COMPONENT_NAME"
        ;;
esac

# Create story file
cat > "$COMPONENT_DIR/$COMPONENT_NAME.stories.tsx" << EOF
import type { Meta, StoryObj } from '@storybook/react'
import { $COMPONENT_NAME } from './$COMPONENT_NAME'

/* ============================================================================
   MOCK DATA
   Keep mock data in the same file for single source of truth.
   ============================================================================ */

// Add mock data here as needed

/* ============================================================================
   STORYBOOK META CONFIGURATION
   ============================================================================ */

const meta: Meta<typeof $COMPONENT_NAME> = {
  title: '$STORY_TITLE',
  component: $COMPONENT_NAME,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: {
      viewports: [320, 768, 1024],
    },
    docs: {
      description: {
        component: \`
# $COMPONENT_NAME

Brief description of what this component does.

## Usage

\\\`\\\`\\\`tsx
<$COMPONENT_NAME>Content</$COMPONENT_NAME>
\\\`\\\`\\\`
        \`,
      },
    },
  },
  // IMPORTANT: Default args MUST match component prop defaults
  // Storybook doesn't auto-detect defaults from component code
  args: {
    // Add your default args here to match component defaults
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: { category: 'Styling' },
    },
    children: {
      control: 'text',
      description: 'Content to render',
      table: { category: 'Content' },
    },
  },
}

export default meta
type Story = StoryObj<typeof $COMPONENT_NAME>

/* ============================================================================
   STORIES - Core Functionality
   ============================================================================ */

/** Default state of the component */
export const Default: Story = {
  args: {
    children: '$COMPONENT_NAME content',
  },
}

/** With custom styling */
export const CustomStyled: Story = {
  args: {
    children: 'Custom styled content',
    className: 'bg-primary text-primary-foreground p-4 rounded-lg',
  },
}

/* ============================================================================
   STORIES - Add more variants below
   ============================================================================ */

// TODO: Add variant stories (e.g., Primary, Secondary)
// TODO: Add state stories (e.g., Disabled, Loading)
// TODO: Add edge case stories (e.g., LongContent, Empty)
EOF

echo -e "${GREEN}  ✓ Created $COMPONENT_NAME.stories.tsx${NC}"

# Create index file
cat > "$COMPONENT_DIR/index.ts" << EOF
export { $COMPONENT_NAME } from './$COMPONENT_NAME'
export type { ${COMPONENT_NAME}Props } from './$COMPONENT_NAME'
EOF

echo -e "${GREEN}  ✓ Created index.ts${NC}"

echo ""
echo -e "${GREEN}✅ Component created successfully!${NC}"
echo ""
echo -e "Location: ${BLUE}$COMPONENT_DIR${NC}"
echo ""
echo "Next steps:"
echo "  1. Run Storybook: npm run storybook"
echo "  2. Navigate to: $STORY_TITLE"
echo "  3. Add props, variants, and stories"
echo "  4. Review quality: storybook review $COMPONENT_DIR"
echo ""
