---
name: Storybook Design System
description: |
  Design system toolkit for Storybook + Chromatic. Commands: create <name> [type] | chromatic [run|force|status] | review <component>
  Scaffolds components, runs visual tests, reviews quality.
---

# Storybook Design System Toolkit

Comprehensive CLI for design system development with Storybook and Chromatic.

## When to Use This Skill

Invoke when users mention:
- Creating new components or stories
- Running Chromatic or visual tests
- Reviewing component quality
- Setting up new Storybook components

## Quick Reference

```bash
# Component scaffolding
storybook create UserCard molecule

# Visual testing (uses npm script with dotenv)
storybook chromatic run
storybook chromatic force

# Quality review
storybook review src/components/showcase/TeamMemberSelector
```

## Command Reference

### 1. Create Component (`create`)

Scaffolds a new component with story file following project conventions.

```bash
storybook create <ComponentName> [type]
```

**Arguments:**
- `ComponentName`: PascalCase name (e.g., `UserCard`, `TeamMemberSelector`)
- `type`: `atom` | `molecule` | `organism` | `showcase` (default: `atom`)

**Examples:**
```bash
storybook create Button atom           # Basic button component
storybook create SearchInput molecule  # Search with input + icon
storybook create DataTable organism    # Complex data table
storybook create BudgetWizard showcase # Demo-quality showcase
```

**Creates:**
```
src/components/{type}s/{ComponentName}/
├── {ComponentName}.tsx           # Component with TypeScript interface
├── {ComponentName}.stories.tsx   # Stories with Default + variants
└── index.ts                      # Export barrel
```

**Script:** `scripts/create-component.sh`

---

### 2. Chromatic Visual Testing (`chromatic`)

Wrapper for Chromatic CLI with smart defaults.

```bash
storybook chromatic <subcommand>
```

**Subcommands:**

| Command | Description |
|---------|-------------|
| `run` | Standard run (uses dotenv for token) |
| `force` | Force rebuild all stories (bypasses TurboSnap) |
| `status` | Open Chromatic builds page |
| `accept` | Auto-accept all current changes |

**Examples:**
```bash
storybook chromatic run              # Regular visual test
storybook chromatic force            # After global style changes
```

**When to use `force`:**
- After changing `tailwind.config.ts`
- After modifying global CSS
- After updating shared utilities
- When TurboSnap reports "no changes" but you know there are

**Script:** `scripts/chromatic.sh`

---

### 3. Component Review (`review`)

Reviews a component against quality checklist.

```bash
storybook review <component-path> [--type component|story|both]
```

**Arguments:**
- `component-path`: Path to component or story file
- `--type`: What to review (default: `both`)

**Examples:**
```bash
storybook review src/components/showcase/TeamMemberSelector
storybook review src/components/ui/button --type component
storybook review Button.stories.tsx --type story
```

**Output:**
```
COMPONENT REVIEW: TeamMemberSelector
════════════════════════════════════

ARCHITECTURE
✓ Props interface with JSDoc
✓ Named export (not default)
✗ Missing error boundary consideration
...

RECOMMENDATIONS:
1. [HIGH] Add aria-label to filter dropdowns
2. [MEDIUM] Extract formatDisplayName outside component
```

**Script:** `scripts/review.sh`

---

## Configuration

### First-Time Setup (Already Done)

```bash
# Token is stored in .env.local (gitignored)
# File: apps/storybook-demo/.env.local
CHROMATIC_PROJECT_TOKEN=chpt_xxxxx

# The npm script uses dotenv-cli to load it automatically
npm run chromatic
```

### Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| `CHROMATIC_PROJECT_TOKEN` | Chromatic project token | `.env.local` |

---

## Story Conventions (Current Implementation)

### Default Args Pattern

**CRITICAL:** Storybook doesn't auto-detect component defaults. You MUST mirror them in `args`:

```typescript
const meta = {
  // ...
  args: {
    // MUST match component prop defaults
    variant: 'multiple',      // Component has: variant = 'multiple'
    badgeAvatarSize: 'lg',    // Component has: badgeAvatarSize = 'lg'
    triggerMode: 'default',   // Component has: triggerMode = 'default'
    sortMode: 'none',         // Component has: sortMode = 'none'
    // Booleans
    disabled: false,
    isLoading: false,
  },
  argTypes: {
    badgeAvatarSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'lg' }  // Shows in docs table
      }
    },
  }
}
```

### Mock Data Pattern

Keep mock data inline in story files for single source of truth:

```typescript
/* ============================================================================
   MOCK DATA - Single source of truth
   ============================================================================ */

const mockTeamMembers: TeamMember[] = [
  { _id: '1', name: { fullName: 'Sarah Chen' }, ... },
  // ...
]

// Factory for bulk generation
function createMockMembers(count: number): TeamMember[] {
  return Array.from({ length: count }, (_, i) => ({ ... }))
}
```

### Chromatic Configuration

```typescript
parameters: {
  chromatic: {
    viewports: [320, 640, 1024],  // Mobile, tablet, desktop
    pauseAnimationAtEnd: true,
  }
}
```

---

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| `codex-peer-review` | Run after `storybook review` for code-level analysis |
| `linear` | Create issues for review findings with `linear addBug` |

**Example workflow:**
```bash
# 1. Create component
storybook create UserCard molecule

# 2. Develop in Storybook
npm run storybook

# 3. Review quality
storybook review src/components/molecules/UserCard

# 4. Run visual tests
storybook chromatic run

# 5. Create issue for any findings
linear addBug "UserCard: Missing hover state story"
```

---

## Troubleshooting

### "Command not found: storybook"

Run with full path:
```bash
bash .claude/skills/storybook/scripts/main.sh create UserCard molecule
```

### Chromatic "Missing project token"

Token should be in `.env.local`:
```bash
# Check if exists
cat .env.local | grep CHROMATIC

# If missing, add it:
echo "CHROMATIC_PROJECT_TOKEN=chpt_xxxxx" >> .env.local
```

### Storybook controls not showing defaults

Add defaults to `args` in story meta - see "Default Args Pattern" above.

---

## Files Reference

```
apps/storybook-demo/.claude/skills/storybook/
├── skill.md                          # This file
└── scripts/
    ├── main.sh                       # Entry point router
    ├── chromatic.sh                  # Chromatic wrapper
    ├── create-component.sh           # Component scaffolding
    └── review.sh                     # Quality review
```

---

## Project Info

- **Storybook URL (local):** http://localhost:6006
- **Chromatic Project:** https://www.chromatic.com/builds?appId=6960ac1ac0bf168806f5afea
- **Latest Build:** https://6960ac1ac0bf168806f5afea-ziesfcjmtq.chromatic.com/
