# Storybook & Chromatic Design System Guide

> A comprehensive guide for design agencies building production-ready component libraries with visual testing.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Core Concepts](#2-core-concepts)
3. [Project Setup: Greenfield Projects](#3-project-setup-greenfield-projects)
4. [Project Setup: Existing Projects](#4-project-setup-existing-projects)
5. [Writing Stories](#5-writing-stories)
6. [Mock Data Patterns](#6-mock-data-patterns)
7. [Chromatic Visual Testing](#7-chromatic-visual-testing)
8. [CI/CD Integration](#8-cicd-integration)
9. [Designer-Developer Workflow](#9-designer-developer-workflow)
10. [Best Practices](#10-best-practices)
11. [Troubleshooting](#11-troubleshooting)
12. [Quick Reference](#12-quick-reference)

---

## 1. Introduction

### What is Storybook?

Storybook is a **component development environment** that allows you to:
- Build UI components in isolation (outside your app)
- Document component variants, states, and usage
- Test interactions and accessibility
- Share a living component library with your team

### What is Chromatic?

Chromatic is a **visual testing platform** built by the Storybook team that:
- Captures screenshots of every story
- Compares screenshots across builds to detect visual changes
- Provides a review UI for designers to approve/reject changes
- Hosts your published Storybook for team access

### Why Use Them Together?

| Problem | Solution |
|---------|----------|
| "The button looks different than the design" | Chromatic catches visual regressions |
| "I don't know what components exist" | Storybook documents everything |
| "CSS change broke something unexpected" | Visual diff shows exactly what changed |
| "Designers can't review until deployed" | Chromatic provides PR previews |
| "No single source of truth for components" | Storybook IS the source of truth |

### The Value Proposition

```
WITHOUT Storybook/Chromatic:
──────────────────────────────────────────────────────────
Designer → Figma mockup → Developer implements → QA finds visual bugs
                                               → Designer reviews in staging
                                               → Multiple rounds of fixes
                                               → Ship with visual debt

WITH Storybook/Chromatic:
──────────────────────────────────────────────────────────
Designer → Figma mockup → Developer implements in Storybook
                        → Chromatic shows visual diff
                        → Designer approves in Chromatic
                        → Merge with confidence
                        → Zero visual surprises
```

---

## 2. Core Concepts

### Atomic Design Hierarchy

We organize components into levels of complexity:

```
┌─────────────────────────────────────────────────────────────────┐
│                        ATOMIC DESIGN                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ATOMS          │  MOLECULES       │  ORGANISMS      │ TEMPLATES│
│  ─────          │  ─────────       │  ─────────      │ ─────────│
│  • Button       │  • FormField     │  • DataTable    │ • Page   │
│  • Input        │  • SearchBar     │  • Sidebar      │   Layouts│
│  • Badge        │  • Card          │  • FilterPanel  │          │
│  • Avatar       │  • UserCard      │  • Selector     │          │
│  • Icon         │  • Dropdown      │  • Navigation   │          │
│                 │                  │                 │          │
│  Smallest       │  Combinations    │  Complex,       │  Page-   │
│  building       │  of atoms        │  self-contained │  level   │
│  blocks         │                  │  sections       │  layouts │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What is a "Story"?

A **story** captures a specific state of a component:

```typescript
// Button.stories.tsx

// Story 1: Default state
export const Default: Story = {
  args: { children: 'Click me' }
}

// Story 2: Primary variant
export const Primary: Story = {
  args: { variant: 'primary', children: 'Submit' }
}

// Story 3: Disabled state
export const Disabled: Story = {
  args: { disabled: true, children: 'Cannot click' }
}

// Story 4: Loading state
export const Loading: Story = {
  args: { loading: true, children: 'Processing...' }
}
```

Each story = one screenshot in Chromatic = one testable state.

### Component Story Format (CSF)

All stories follow this structure:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

// Meta: Configuration for all stories in this file
const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent',    // Sidebar location
  component: MyComponent,           // The component
  tags: ['autodocs'],               // Auto-generate docs
  argTypes: {                       // Controls configuration
    variant: {
      control: 'select',
      options: ['primary', 'secondary']
    }
  }
}
export default meta

// Type helper
type Story = StoryObj<typeof MyComponent>

// Individual stories
export const Default: Story = {
  args: { /* props */ }
}
```

---

## 3. Project Setup: Greenfield Projects

### Step 1: Create Project with Storybook

```bash
# Option A: Vite + React + Storybook (Recommended for component libraries)
npm create vite@latest my-design-system -- --template react-ts
cd my-design-system
npx storybook@latest init

# Option B: Next.js + Storybook (For app-integrated design systems)
npx create-next-app@latest my-app --typescript --tailwind
cd my-app
npx storybook@latest init
```

### Step 2: Install Dependencies

```bash
# Core dependencies (usually auto-installed by storybook init)
npm install -D @storybook/react @storybook/react-vite

# Recommended addons
npm install -D @storybook/addon-essentials  # Controls, docs, actions, viewport
npm install -D @storybook/addon-a11y        # Accessibility checks
npm install -D @storybook/addon-themes      # Dark mode support
npm install -D chromatic                     # Visual testing

# UI library (we use shadcn/ui)
npx shadcn-ui@latest init
```

### Step 3: Configure Storybook

**.storybook/main.ts**
```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',  // Auto-generate docs for tagged stories
  },
  staticDirs: ['../public'],  // Serve static assets
}

export default config
```

**.storybook/preview.ts**
```typescript
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/index.css'  // Your global styles

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Default viewport
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  // Dark mode support
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
```

### Step 4: Set Up Chromatic

```bash
# 1. Install Chromatic
npm install -D chromatic

# 2. Create Chromatic project at https://www.chromatic.com
#    - Sign in with GitHub
#    - Create new project
#    - Link to your repository
#    - Copy the project token

# 3. Add to package.json
```

**package.json**
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes",
    "chromatic:force": "chromatic --force-rebuild --exit-zero-on-changes"
  }
}
```

```bash
# 4. Run first build (sets baseline)
CHROMATIC_PROJECT_TOKEN=chpt_xxxxx npm run chromatic
```

### Step 5: Create Folder Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── Badge/
│   │       ├── Badge.tsx
│   │       ├── Badge.stories.tsx
│   │       └── index.ts
│   │
│   ├── molecules/
│   │   └── SearchInput/
│   │       ├── SearchInput.tsx
│   │       ├── SearchInput.stories.tsx
│   │       └── index.ts
│   │
│   └── organisms/
│       └── TeamMemberSelector/
│           ├── TeamMemberSelector.tsx
│           ├── TeamMemberSelector.stories.tsx
│           └── index.ts
│
└── index.css  # Global styles with Tailwind
```

---

## 4. Project Setup: Existing Projects

### Option A: Add Storybook to Existing Codebase (Recommended)

This approach keeps stories alongside production components.

```bash
# 1. Navigate to your project root
cd your-existing-project

# 2. Initialize Storybook
npx storybook@latest init

# 3. Storybook will auto-detect your framework (Next.js, Vite, etc.)

# 4. Update story paths in .storybook/main.ts to find your components
```

**.storybook/main.ts**
```typescript
const config: StorybookConfig = {
  stories: [
    // Point to your existing components folder
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  // ... rest of config
}
```

**Pros:**
- Stories live next to components
- Changes to components automatically reflected in Storybook
- Single source of truth

**Cons:**
- Storybook dependencies in production repo
- Build time includes Storybook

### Option B: Separate Storybook Project (Exploration Mode)

This approach is for rapid prototyping before integrating.

```bash
# 1. Create standalone Storybook project
mkdir apps/storybook-demo
cd apps/storybook-demo
npm create vite@latest . -- --template react-ts
npx storybook@latest init

# 2. Copy components you want to work on
cp -r ../../components/ui/team-selector ./src/components/

# 3. Develop and iterate in isolation

# 4. Later: Merge improved components back to main codebase
```

**Pros:**
- Fast iteration without affecting production
- Designers can experiment freely
- No build impact on main app

**Cons:**
- Manual sync required
- Components can drift from production
- Duplicate code

### Migration Path: Isolated → Integrated

```bash
# When ready to integrate:

# 1. Copy improved component back to main repo
cp -r apps/storybook-demo/src/components/TeamMemberSelector \
      components/organisms/

# 2. Copy story file
cp apps/storybook-demo/src/components/TeamMemberSelector/TeamMemberSelector.stories.tsx \
   components/organisms/TeamMemberSelector/

# 3. Update imports in story file to use main repo paths
# Before: import { TeamMemberSelector } from './TeamMemberSelector'
# After:  import { TeamMemberSelector } from '@/components/organisms/TeamMemberSelector'

# 4. Test in main Storybook
npm run storybook
```

---

## 5. Writing Stories

### Story File Template

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

/* ============================================================================
   MOCK DATA
   Keep mock data in the same file for single source of truth.
   Extract to *.mocks.ts only if shared across multiple story files.
   ============================================================================ */

const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
]

/* ============================================================================
   STORYBOOK META CONFIGURATION
   ============================================================================ */

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',  // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: `
# Component Name

Brief description of what this component does.

## Features
- Feature 1
- Feature 2

## Usage
\`\`\`tsx
<ComponentName prop="value" />
\`\`\`
        `
      }
    }
  },
  argTypes: {
    // Configure controls for each prop
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual style variant',
      table: { category: 'Appearance' }
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interactions',
      table: { category: 'State' }
    },
    onClick: {
      action: 'clicked',  // Log clicks in Actions panel
      table: { category: 'Events' }
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentName>

/* ============================================================================
   STORIES
   ============================================================================ */

// Default story - the most common usage
export const Default: Story = {
  args: {
    children: 'Click me',
  },
}

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

// State stories
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

// Complex story with custom render
export const WithCustomRender: Story = {
  render: (args) => (
    <div className="p-4 bg-gray-100 rounded">
      <ComponentName {...args} />
    </div>
  ),
  args: {
    children: 'In container',
  },
}

// Interactive story with play function
export const WithInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  },
}
```

### Stories Per Component Guidelines

| Component Type | Recommended Stories | Examples |
|---------------|---------------------|----------|
| **Atom** | 5-10 | Default, each variant, each size, disabled, loading |
| **Molecule** | 8-15 | Default, variants, states, with/without optional props |
| **Organism** | 15-25 | All of above + edge cases, responsive, loading, error |

### What to Cover in Stories

```typescript
// ✅ DO create stories for:

// 1. Every variant
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }

// 2. Every size
export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const Large: Story = { args: { size: 'lg' } }

// 3. Interactive states
export const Disabled: Story = { args: { disabled: true } }
export const Loading: Story = { args: { loading: true } }
export const Selected: Story = { args: { selected: true } }

// 4. Empty/Error states
export const Empty: Story = { args: { items: [] } }
export const Error: Story = { args: { error: 'Failed to load' } }
export const Loading: Story = { args: { isLoading: true } }

// 5. Edge cases
export const LongText: Story = {
  args: { label: 'This is an extremely long label that might overflow' }
}
export const ManyItems: Story = {
  args: { items: generateManyItems(100) }
}

// 6. Responsive behavior
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } }
}
```

---

## 6. Mock Data Patterns

### Pattern 1: Inline Mock Data (Default)

Keep mock data in the same file for simplicity:

```typescript
// ComponentName.stories.tsx

/* ============================================================================
   MOCK DATA - Kept inline for single source of truth
   ============================================================================ */

// Primary dataset (realistic, covers common cases)
const mockUsers = [
  { id: '1', name: 'Sarah Chen', role: 'Designer' },
  { id: '2', name: 'Marcus Johnson', role: 'Developer' },
]

// Edge case datasets (handcrafted for specific tests)
const mockLongNames = [
  { id: '1', name: 'Alexandra Elizabeth Montgomery-Richardson III', role: 'VP' },
]

const mockInternationalNames = [
  { id: '1', name: 'José García', role: 'Designer' },
  { id: '2', name: '田中太郎', role: 'Developer' },  // Japanese
]
```

### Pattern 2: Factory Function (For Bulk Data)

Use factories when you need 50+ items:

```typescript
// Factory for generating bulk data
function createMockUsers(count: number): User[] {
  const firstNames = ['James', 'Emma', 'Wei', 'María', 'Yuki']
  const lastNames = ['Smith', 'García', 'Wang', 'Müller', 'Tanaka']
  const roles = ['Designer', 'Developer', 'PM', 'Lead']

  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    role: roles[i % roles.length],
  }))
}

// Pre-generate for stories
const mockLargeTeam = createMockUsers(150)

// Use in story
export const StressTest: Story = {
  args: {
    users: mockLargeTeam,
  },
}
```

### Pattern 3: Extract to Separate File (When Shared)

Only extract when multiple story files need the same data:

```typescript
// ComponentName.mocks.ts
export const mockUsers: User[] = [/* ... */]
export function createMockUser(overrides?: Partial<User>): User { /* ... */ }

// ComponentName.stories.tsx
import { mockUsers, createMockUser } from './ComponentName.mocks'
```

### When to Use Each Pattern

| Scenario | Pattern | Why |
|----------|---------|-----|
| Single component, <50 items | Inline | Simplest, everything visible |
| Stress testing, 100+ items | Factory | Dynamic generation |
| Multiple components share data | Extract | Avoid duplication |
| Specific edge case testing | Inline (handcrafted) | Predictable, reproducible |

---

## 7. Chromatic Visual Testing

### How Chromatic Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHROMATIC WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BASELINE (main branch)                                      │
│     ┌─────────────────────────────────────────────┐             │
│     │ Screenshot of every story = "source of truth"│             │
│     └─────────────────────────────────────────────┘             │
│                                                                  │
│  2. FEATURE BRANCH                                              │
│     ┌─────────────────────────────────────────────┐             │
│     │ Developer makes changes, pushes branch      │             │
│     └─────────────────────────────────────────────┘             │
│                           │                                      │
│                           ▼                                      │
│  3. CHROMATIC BUILD                                             │
│     ┌─────────────────────────────────────────────┐             │
│     │ • Captures new screenshots                  │             │
│     │ • Compares against baseline                 │             │
│     │ • Highlights pixel differences              │             │
│     └─────────────────────────────────────────────┘             │
│                           │                                      │
│                           ▼                                      │
│  4. VISUAL REVIEW                                               │
│     ┌─────────────────────────────────────────────┐             │
│     │ Designer/Developer reviews in Chromatic UI  │             │
│     │ • Accept: Intentional change                │             │
│     │ • Deny: Unintentional regression            │             │
│     └─────────────────────────────────────────────┘             │
│                           │                                      │
│                           ▼                                      │
│  5. MERGE                                                       │
│     ┌─────────────────────────────────────────────┐             │
│     │ Accepted changes become new baseline        │             │
│     └─────────────────────────────────────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Running Chromatic

```bash
# Basic run (uses TurboSnap for speed)
npm run chromatic

# Force rebuild all stories (when TurboSnap misses changes)
npm run chromatic:force

# With explicit token
CHROMATIC_PROJECT_TOKEN=chpt_xxx npm run chromatic
```

### Chromatic Commands Reference

```bash
# Standard run with TurboSnap optimization
npx chromatic --exit-zero-on-changes

# Force rebuild everything
npx chromatic --force-rebuild

# Auto-accept all changes (for main branch in CI)
npx chromatic --auto-accept-changes

# Don't fail CI on visual changes
npx chromatic --exit-zero-on-changes

# Skip snapshots, just publish Storybook
npx chromatic --skip-snap

# Debug mode (verbose output)
npx chromatic --debug

# Only test specific stories
npx chromatic --only-story-names="Button/*"
```

### Configuring Viewports for Responsive Testing

```typescript
// In your story file
export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    chromatic: {
      viewports: [320, 768, 1024],  // Test at these widths
      pauseAnimationAtEnd: true,     // Wait for animations
    },
  },
}

// Per-story override
export const Responsive: Story = {
  parameters: {
    chromatic: {
      viewports: [320, 640, 1024, 1440],
    },
  },
}

// Disable snapshots for specific story
export const Interactive: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
}
```

### Understanding "No Changes Found"

When Chromatic says "no changes found", it means TurboSnap didn't detect changes that affect stories:

| Cause | Solution |
|-------|----------|
| Changes not committed | `git add . && git commit` |
| TurboSnap missed dependency | `npm run chromatic:force` |
| Global styles changed | `npm run chromatic:force` |
| Story file not imported | Check your story exports |

---

## 8. CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic

on:
  push:
    branches: [main]           # Update baseline after merge
  pull_request:                # Run on all PRs

jobs:
  chromatic:
    name: Visual Testing
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0       # Required for TurboSnap to work

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        # If Storybook is in a subdirectory:
        # working-directory: apps/storybook

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          # Auto-accept on main (changes already reviewed in PR)
          autoAcceptChanges: ${{ github.ref == 'refs/heads/main' }}
          # Don't fail CI on visual changes (reviewer will handle)
          exitZeroOnChanges: true
          # If Storybook is in a subdirectory:
          # workingDir: apps/storybook
```

### Adding Chromatic Token to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: Your Chromatic project token (from chromatic.com)

### What Happens on PR

```
┌─────────────────────────────────────────────────────────────────┐
│  PR: "Update Button styles"                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Build                          │  Passed                     │
│  ✓ Tests                          │  Passed                     │
│  ● UI Review (Chromatic)          │  3 changes detected         │
│                                   │  → Click to review          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

Clicking "UI Review" opens Chromatic where you can:
- See side-by-side comparison
- Accept or reject each change
- Leave comments for the author

---

## 9. Designer-Developer Workflow

### The Collaboration Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                  DESIGNER-DEVELOPER WORKFLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: DESIGN                                                │
│  ────────────────                                               │
│  Designer creates mockup in Figma                               │
│  ↓                                                              │
│  Designer writes component spec:                                │
│  • Props and their types                                        │
│  • States (default, hover, disabled, etc.)                      │
│  • Responsive behavior                                          │
│  • Accessibility requirements                                   │
│                                                                  │
│  PHASE 2: IMPLEMENT                                             │
│  ──────────────────                                             │
│  Developer (or AI) creates:                                     │
│  • Component code (TSX)                                         │
│  • Stories for all states                                       │
│  • Mock data                                                    │
│  ↓                                                              │
│  Developer pushes branch                                        │
│  ↓                                                              │
│  Chromatic automatically builds                                 │
│                                                                  │
│  PHASE 3: REVIEW                                                │
│  ────────────────                                               │
│  Designer opens Chromatic review link                           │
│  ↓                                                              │
│  For each visual change:                                        │
│  • ✓ Accept: Matches design intent                              │
│  • ✗ Request changes: Needs adjustment                          │
│  • 💬 Comment: Clarify or discuss                               │
│                                                                  │
│  PHASE 4: ITERATE                                               │
│  ────────────────                                               │
│  Developer addresses feedback                                   │
│  ↓                                                              │
│  Push updates → Chromatic rebuilds                              │
│  ↓                                                              │
│  Designer re-reviews                                            │
│  ↓                                                              │
│  Repeat until approved                                          │
│                                                                  │
│  PHASE 5: MERGE                                                 │
│  ───────────────                                                │
│  All reviews approved → Merge PR                                │
│  ↓                                                              │
│  New baseline set automatically                                 │
│  ↓                                                              │
│  Published Storybook updated                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Designer Checklist for Chromatic Review

When reviewing in Chromatic, check:

- [ ] **Visual accuracy**: Matches Figma design
- [ ] **All states covered**: Default, hover, focus, disabled, error
- [ ] **Responsive**: Looks correct at all viewports
- [ ] **Dark mode**: Works in both themes (if applicable)
- [ ] **Edge cases**: Long text, empty states, loading states
- [ ] **Spacing**: Consistent with design system
- [ ] **Typography**: Correct fonts, sizes, weights
- [ ] **Colors**: Matches design tokens

### Using Chromatic Review UI

```
┌─────────────────────────────────────────────────────────────────┐
│  CHROMATIC REVIEW INTERFACE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┬─────────────────────┐                  │
│  │     BASELINE        │      NEW            │                  │
│  │   (main branch)     │   (your branch)     │                  │
│  │                     │                     │                  │
│  │   [Screenshot]      │   [Screenshot]      │                  │
│  │                     │                     │                  │
│  └─────────────────────┴─────────────────────┘                  │
│                                                                  │
│  View modes:                                                     │
│  • Side-by-side (shown above)                                   │
│  • Overlay diff (pink highlights changes)                       │
│  • Swipe (slide between versions)                               │
│  • Focus (highlight changes only)                               │
│                                                                  │
│  Actions:                                                        │
│  [✓ Accept]  [✗ Deny]  [💬 Comment]  [→ Next]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Writing Good Component Specs (For AI Implementation)

When requesting component development, provide:

```markdown
## Component: UserMentionInput

### Purpose
Text input that suggests users when typing "@"

### Visual Reference
[Link to Figma frame]

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| users | User[] | required | Available users to mention |
| onMention | (userId: string) => void | required | Called when user selected |
| placeholder | string | "Type @ to mention" | Input placeholder |
| disabled | boolean | false | Disable input |

### States to Implement
1. Empty (no input)
2. Typing (no @ yet)
3. Mention mode (dropdown visible)
4. Searching (filtered results)
5. No results found
6. Disabled

### Accessibility Requirements
- Dropdown announces to screen readers
- Arrow keys navigate options
- Enter selects, Escape closes

### Edge Cases
- User with very long name (truncate with ellipsis)
- More than 50 users (consider virtualization)
- User has no avatar (show initials)
```

---

## 10. Best Practices

### Story Organization

```
✅ DO:
──────
• Group related stories together (variants, then sizes, then states)
• Use consistent naming: Default, Primary, Secondary, Disabled, Loading
• Add documentation to complex stories
• Include mobile/responsive stories for layouts

❌ DON'T:
─────────
• Create stories for unchanged shadcn/ui components
• Name stories vaguely (Story1, Test, MyStory)
• Skip error and loading states
• Forget edge cases (empty, long text, many items)
```

### Mock Data

```
✅ DO:
──────
• Keep mock data in the story file (single source of truth)
• Use handcrafted data for edge cases (predictable)
• Use factories for bulk data (100+ items)
• Include international characters in name tests

❌ DON'T:
─────────
• Use Math.random() in mock data (non-reproducible)
• Create separate mock files unless absolutely necessary
• Use real user data or production data
• Skip testing with edge case data
```

### Chromatic Configuration

```
✅ DO:
──────
• Set up CI to run on PRs automatically
• Configure viewports for responsive testing
• Disable snapshots for purely interactive stories
• Use --force-rebuild when global styles change

❌ DON'T:
─────────
• Commit Chromatic project token to code
• Skip visual review "because it's a small change"
• Auto-accept changes without review
• Forget to set baselines for new branches
```

### Documentation

```
✅ DO:
──────
• Add component description in meta
• Document props with descriptions and examples
• Include usage guidelines in story docs
• Show "when to use" and "when not to use"

❌ DON'T:
─────────
• Leave components undocumented
• Write vague prop descriptions
• Skip accessibility documentation
• Forget to update docs when component changes
```

---

## 11. Troubleshooting

### Common Issues

#### "No stories found"

```bash
# Check your story file naming
ls src/**/*.stories.tsx

# Verify main.ts stories glob pattern
# Should be: '../src/**/*.stories.@(js|jsx|ts|tsx)'

# Make sure story has default export
export default meta  # Required!
```

#### "Chromatic: No changes found" (but there are changes)

```bash
# 1. Ensure changes are committed
git status
git add . && git commit -m "Changes"

# 2. Force rebuild
npm run chromatic:force

# 3. Check if story is excluded from snapshots
# Look for: chromatic: { disableSnapshot: true }
```

#### "Build failed: Cannot find module"

```bash
# Check imports in story file
# Wrong: import { Button } from 'components/Button'
# Right: import { Button } from '../components/Button'

# Or check path aliases in tsconfig.json
```

#### "Storybook shows blank page"

```bash
# Check browser console for errors

# Common causes:
# 1. CSS not imported in preview.ts
# 2. Missing provider in decorators
# 3. Runtime error in story
```

#### "Chromatic build times out"

```bash
# Reduce snapshot count
# 1. Disable snapshots for non-visual stories
parameters: {
  chromatic: { disableSnapshot: true }
}

# 2. Reduce viewports
chromatic: {
  viewports: [375, 1024],  # Instead of [320, 375, 768, 1024, 1440]
}

# 3. Use TurboSnap (default, but ensure fetch-depth: 0 in CI)
```

### Debug Commands

```bash
# Run Storybook in debug mode
npm run storybook -- --debug

# Check Storybook build output
npm run build-storybook
ls storybook-static/

# Chromatic verbose output
npx chromatic --debug

# Check what stories Chromatic sees
npx chromatic --dry-run
```

---

## 12. Quick Reference

### Commands Cheat Sheet

```bash
# ─────────────────────────────────────────────────────────
# LOCAL DEVELOPMENT
# ─────────────────────────────────────────────────────────
npm run storybook              # Start Storybook dev server
npm run build-storybook        # Build static Storybook

# ─────────────────────────────────────────────────────────
# CHROMATIC
# ─────────────────────────────────────────────────────────
npm run chromatic              # Standard run (with TurboSnap)
npm run chromatic:force        # Force rebuild all stories

# With token explicitly:
CHROMATIC_PROJECT_TOKEN=xxx npm run chromatic

# ─────────────────────────────────────────────────────────
# CHROMATIC OPTIONS
# ─────────────────────────────────────────────────────────
--force-rebuild                # Rebuild all stories
--exit-zero-on-changes         # Don't fail on visual changes
--auto-accept-changes          # Auto-accept (use on main branch)
--skip-snap                    # Publish without snapshots
--only-story-names="Button/*"  # Test specific stories
--debug                        # Verbose output

# ─────────────────────────────────────────────────────────
# SHADCN/UI
# ─────────────────────────────────────────────────────────
npx shadcn-ui@latest add button    # Add a component
npx shadcn-ui@latest add -a        # Add all components
npx shadcn-ui@latest diff button   # Check for updates
```

### Story File Template (Copy-Paste)

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { viewports: [320, 768, 1024] },
  },
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {},
}
```

### Chromatic Viewport Presets

```typescript
parameters: {
  chromatic: {
    viewports: [
      320,   // Mobile S
      375,   // Mobile M (iPhone)
      640,   // Mobile L / Tablet portrait
      768,   // Tablet
      1024,  // Desktop S
      1280,  // Desktop M
      1440,  // Desktop L
    ],
  },
}
```

### GitHub Actions Template

```yaml
name: Chromatic
on:
  push:
    branches: [main]
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          autoAcceptChanges: ${{ github.ref == 'refs/heads/main' }}
          exitZeroOnChanges: true
```

---

## Glossary

| Term | Definition |
|------|------------|
| **Story** | A single state/variant of a component rendered in Storybook |
| **Baseline** | The "source of truth" screenshots that new changes compare against |
| **TurboSnap** | Chromatic's optimization that only snapshots affected stories |
| **Visual regression** | Unintended visual change detected by comparing screenshots |
| **CSF** | Component Story Format - the standard way to write stories |
| **Autodocs** | Automatically generated documentation from component props |
| **Decorator** | Wrapper that adds context to stories (themes, providers, etc.) |
| **Play function** | Automated interactions that run after story renders |
| **Viewport** | Screen size at which Chromatic captures snapshots |

---

## 13. Modern Integrations & Tools

### Figma MCP Server (AI Design-to-Code)

The [Figma MCP Server](https://www.figma.com/blog/introducing-figma-mcp-server/) brings design context directly into AI coding workflows. Released in 2025, it enables LLMs to generate design-informed code.

#### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIGMA MCP WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DESIGNER                          DEVELOPER (with AI)          │
│  ────────                          ────────────────────          │
│  Creates design in Figma           Opens Claude Code / Cursor   │
│         │                                    │                   │
│         ▼                                    │                   │
│  Selects component layer                     │                   │
│         │                                    │                   │
│         └──────────────────────────────────▶ │                   │
│                  MCP Server sends:           │                   │
│                  • Layout rules              ▼                   │
│                  • Text styles        AI receives design         │
│                  • Component props    context and generates      │
│                  • Image refs         matching code              │
│                  • Spacing values                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Setup

1. **Enable in Figma Desktop App**
   - Switch to Dev Mode (Shift+D)
   - In the inspect panel, click "Enable desktop MCP server"
   - Server runs at `http://127.0.0.1:3845/mcp`

2. **Configure Claude Code**
   ```json
   // .claude/settings.json or mcp_servers.json
   {
     "mcpServers": {
       "figma": {
         "url": "http://127.0.0.1:3845/mcp"
       }
     }
   }
   ```

3. **Or Use Remote Server**
   - Connect to `https://mcp.figma.com/mcp`
   - Requires Figma authentication

#### Benefits for Design Systems

> "Paired with MCP servers, design systems become a productivity coefficient for AI-powered workflows, ensuring that AI agents produce output that's relevant and on brand."
> — [Figma Blog](https://www.figma.com/blog/design-systems-ai-mcp/)

---

### Figma ↔ Storybook Sync Tools

| Tool | Direction | Best For |
|------|-----------|----------|
| [**Storybook Connect**](https://www.figma.com/community/plugin/1056265616080331589/storybook-connect) | Code → Figma | Embedding stories in Figma Dev Mode |
| [**story.to.design**](https://story.to.design/) | Code → Figma | Generating Figma components from Storybook |
| [**Anima**](https://www.animaapp.com/) | Both ways | Full sync with design tokens |
| [**@storybook/addon-designs**](https://storybook.js.org/addons/@storybook/addon-designs/) | Figma → Code | Embedding Figma frames in stories |

#### story.to.design Setup

```bash
# 1. Install the Figma plugin from Figma Community
# 2. In Figma, run the plugin and connect to your Storybook URL
# 3. Select components to import
# 4. Plugin generates Figma components from your code
```

**Features:**
- Syncs updates with one click
- Supports design tokens import
- Works with local Storybook (`localhost:6006`)
- Multi-brand/variant support

#### Storybook Connect Setup

```bash
# 1. Publish Storybook to Chromatic (required)
npm run chromatic

# 2. Install Storybook Connect plugin in Figma
# 3. Link your Chromatic project
# 4. Stories appear in Figma Dev Mode inspect panel
```

---

### Visual Testing Alternatives: Lost Pixel

[Lost Pixel](https://www.lost-pixel.com/) is an open-source alternative to Chromatic with different strengths.

#### Comparison

| Feature | Chromatic | Lost Pixel |
|---------|-----------|------------|
| **Pricing** | Paid (free tier limited) | Free OSS / Paid Platform |
| **Storybook Support** | ✅ Native | ✅ First-class |
| **Page Testing** | ❌ Storybook only | ✅ Playwright, Cypress, Next.js |
| **Anti-Flake** | ✅ Advanced | ⚠️ Basic (depends on your tests) |
| **Collaboration UI** | ✅ Built-in | ❌ OSS / ✅ Platform tier |
| **Self-Hosting** | ❌ No | ✅ Yes |
| **Maturity** | Enterprise-grade | Newer, growing |

#### When to Choose Each

**Choose Chromatic if:**
- Storybook is your primary testing target
- You need enterprise reliability and anti-flake
- Team collaboration UI is important
- Budget allows SaaS pricing

**Choose Lost Pixel if:**
- You need to test pages AND Storybook stories
- Budget is limited or you prefer OSS
- You want to self-host
- You're using Playwright/Cypress for E2E

#### Lost Pixel Setup

```bash
# Install
npm install -D lost-pixel

# Create config
# lost-pixel.config.ts
export const config = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  generateOnly: true,
  failOnDifference: true,
}

# Run
npx lost-pixel
```

---

### Documentation Platforms

#### Supernova

[Supernova](https://www.supernova.io/) is a design system documentation platform with deep Storybook integration.

**Features (2025):**
- [Interactive Storybook playground](https://learn.supernova.io/latest/releases/may-2025/new-storybook-integration-and-hosting-IhMWfZsP) in docs
- Design token visualization
- One-click Storybook hosting
- [Supernova Portal](https://learn.supernova.io/latest/releases/september-2025/introducing-supernova-portal-bq2CR2Jk) (free tier)

**Setup:**
```bash
# Connect via URL
# In Supernova: Settings → Design System → Connect Storybook → Paste URL

# Or via CLI (for auth-protected Storybooks)
npx supernova sync-storybook --url https://your-storybook.chromatic.com
```

#### zeroheight

Alternative documentation platform with Storybook support. Good for teams already using zeroheight for design documentation.

---

### Design Tokens Workflow

For true design-code sync, implement a tokens pipeline:

```
┌─────────────────────────────────────────────────────────────────┐
│                 DESIGN TOKENS PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FIGMA                                                          │
│  ─────                                                          │
│  Tokens Studio Plugin                                           │
│  (colors, spacing, typography)                                  │
│         │                                                        │
│         ▼ Push to GitHub                                        │
│                                                                  │
│  GITHUB REPO                                                    │
│  ───────────                                                    │
│  tokens/                                                        │
│  ├── colors.json                                                │
│  ├── spacing.json                                               │
│  └── typography.json                                            │
│         │                                                        │
│         ▼ Style Dictionary transform                            │
│                                                                  │
│  CODE OUTPUT                                                    │
│  ───────────                                                    │
│  • tailwind.config.ts (CSS variables)                           │
│  • tokens.css (CSS custom properties)                           │
│  • tokens.ts (TypeScript constants)                             │
│         │                                                        │
│         ▼ Used by                                                │
│                                                                  │
│  STORYBOOK + PRODUCTION                                         │
│  ──────────────────────                                         │
│  Both use same tokens = guaranteed consistency                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Tools:**
- [Tokens Studio](https://tokens.studio/) - Figma plugin for managing tokens
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Transform tokens to multiple formats
- [Token Transformer](https://www.npmjs.com/package/token-transformer) - Tokens Studio → Style Dictionary

---

## 14. Creating a Reusable Storybook Template

### Why Create a Template?

Instead of setting up Storybook from scratch for each project, create a standardized template:
- Consistent configuration across projects
- Pre-configured addons and settings
- Example stories demonstrating patterns
- Documentation built-in

### Template Structure

```
storybook-template/
├── .storybook/
│   ├── main.ts              # Storybook config
│   ├── preview.ts           # Global decorators, parameters
│   └── manager.ts           # UI customization
│
├── src/
│   ├── components/
│   │   ├── _templates/       # Copy-paste story templates
│   │   │   ├── Atom.stories.template.tsx
│   │   │   ├── Molecule.stories.template.tsx
│   │   │   └── Organism.stories.template.tsx
│   │   │
│   │   ├── atoms/
│   │   │   └── Button/       # Example atom
│   │   │       ├── Button.tsx
│   │   │       └── Button.stories.tsx
│   │   │
│   │   └── organisms/
│   │       └── TeamMemberSelector/  # Example organism
│   │           ├── TeamMemberSelector.tsx
│   │           └── TeamMemberSelector.stories.tsx
│   │
│   ├── styles/
│   │   └── globals.css       # Tailwind + custom tokens
│   │
│   └── lib/
│       └── utils.ts          # cn() and other utilities
│
├── scripts/
│   └── create-component.sh   # Component scaffolding script
│
├── docs/
│   ├── GETTING_STARTED.md
│   └── PATTERNS.md
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### Using the Template

```bash
# Option 1: degit (no git history)
npx degit your-org/storybook-template my-new-project

# Option 2: GitHub template
# Click "Use this template" on GitHub

# Option 3: Clone and reinitialize
git clone https://github.com/your-org/storybook-template my-new-project
cd my-new-project
rm -rf .git && git init
```

### Component Scaffolding Script

```bash
#!/bin/bash
# scripts/create-component.sh

COMPONENT_NAME=$1
CATEGORY=${2:-atoms}  # atoms, molecules, or organisms

if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./scripts/create-component.sh ComponentName [category]"
  exit 1
fi

COMPONENT_DIR="src/components/${CATEGORY}/${COMPONENT_NAME}"

mkdir -p "$COMPONENT_DIR"

# Create component file
cat > "${COMPONENT_DIR}/${COMPONENT_NAME}.tsx" << EOF
import { cn } from '@/lib/utils'

interface ${COMPONENT_NAME}Props {
  className?: string
}

export function ${COMPONENT_NAME}({ className }: ${COMPONENT_NAME}Props) {
  return (
    <div className={cn('', className)}>
      ${COMPONENT_NAME}
    </div>
  )
}
EOF

# Create story file
cat > "${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx" << EOF
import type { Meta, StoryObj } from '@storybook/react'
import { ${COMPONENT_NAME} } from './${COMPONENT_NAME}'

const meta: Meta<typeof ${COMPONENT_NAME}> = {
  title: '${CATEGORY^}/${COMPONENT_NAME}',
  component: ${COMPONENT_NAME},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof ${COMPONENT_NAME}>

export const Default: Story = {
  args: {},
}
EOF

# Create index file
cat > "${COMPONENT_DIR}/index.ts" << EOF
export { ${COMPONENT_NAME} } from './${COMPONENT_NAME}'
EOF

echo "✅ Created ${COMPONENT_NAME} in ${COMPONENT_DIR}"
```

**Usage:**
```bash
./scripts/create-component.sh UserCard molecules
# Creates:
# src/components/molecules/UserCard/
# ├── UserCard.tsx
# ├── UserCard.stories.tsx
# └── index.ts
```

---

## 15. Designer-Friendly UI: Future Vision

### Current State vs Future Vision

| Today | Future Goal |
|-------|-------------|
| CLI commands to run Storybook | One-click launch from app |
| Manual story creation | Visual story builder |
| Terminal for Chromatic | Web dashboard |
| Code editing for props | Visual prop controls |

### Tools Moving Toward This Vision

#### 1. Supernova Portal (Free)
- Web-based design system browser
- No CLI needed for viewing
- Interactive component playground

#### 2. Chromatic Visual Review
- Web UI for reviewing changes
- No CLI needed for approval workflow

#### 3. Storybook 8.x Controls
- In-browser prop editing
- No code changes for testing variants

#### 4. UI Builder for shadcn/ui
```
Visual editing interface for components
├── Drag-and-drop component placement
├── Visual prop editing
├── Real-time preview
└── Export to code
```

### Building a Designer Portal (Future Project)

A custom internal portal could provide:

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGNER PORTAL (Future Vision)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Project: NEOCRM                         [Switch ▼]     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │  📚 Browse  │ │  🎨 Create  │ │  ✓ Review   │                │
│  │  Components │ │  New Story  │ │  Changes    │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                  │
│  BROWSE COMPONENTS                                              │
│  ─────────────────                                              │
│  🔍 Search components...                                        │
│                                                                  │
│  📁 Atoms                                                       │
│     └─ Button (12 stories)                                      │
│     └─ Badge (8 stories)                                        │
│  📁 Molecules                                                   │
│     └─ SearchInput (6 stories)                                  │
│  📁 Organisms                                                   │
│     └─ TeamMemberSelector (22 stories)  ←─ Click to open        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │     [Live Component Preview]                            │    │
│  │                                                          │    │
│  │     Props:                                              │    │
│  │     variant: [single ▼]                                 │    │
│  │     disabled: [ ] checkbox                              │    │
│  │     maxSelected: [3] slider                             │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Open in Storybook] [Open in Figma] [Request Change]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Roadmap

**Phase 1: Template (Now)**
- Create reusable Storybook template ✅
- Document patterns and workflows ✅
- Automate with scaffolding scripts

**Phase 2: Integration (Next)**
- Set up Figma MCP server
- Connect story.to.design or Storybook Connect
- Configure Supernova Portal for browsing

**Phase 3: Automation (Later)**
- GitHub Actions for automatic Chromatic
- Design tokens pipeline (Figma → Code)
- PR templates with Chromatic links

**Phase 4: Portal (Future)**
- Build custom web portal (Next.js + Storybook API)
- One-click project setup
- Visual story creation interface
- Integrated review workflow

---

## Resources

### Official Documentation
- [Storybook Documentation](https://storybook.js.org/docs)
- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Figma MCP Server Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [shadcn/ui Components](https://ui.shadcn.com)

### Integration Tools
- [story.to.design](https://story.to.design/) - Storybook → Figma sync
- [Storybook Connect Plugin](https://www.figma.com/community/plugin/1056265616080331589/storybook-connect) - Stories in Figma
- [Tokens Studio](https://tokens.studio/) - Figma design tokens
- [Supernova](https://www.supernova.io/) - Design system documentation

### Visual Testing
- [Chromatic](https://www.chromatic.com/) - Visual testing (SaaS)
- [Lost Pixel](https://www.lost-pixel.com/) - Visual testing (OSS)
- [Percy](https://percy.io/) - Visual testing (alternative)

### Learning Resources
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com)
- [Storybook Tutorials](https://storybook.js.org/tutorials/)
- [Design Systems Handbook](https://www.designbetter.co/design-systems-handbook)

---

*Last updated: January 2026*
*Guide version: 2.0*
