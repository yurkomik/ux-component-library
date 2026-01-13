# UX Component Library

A production-grade React component library showcasing advanced UI patterns for team management and selection interfaces.

## Live Demo

[View on Chromatic](https://www.chromatic.com/library?appId=your-app-id)

## Featured Components

### TeamMemberSelector

Advanced multi/single select component with:
- Real-time search (name, email, role, title)
- Department & role cascading filters
- Keyboard navigation (arrow keys, spacebar, escape)
- Responsive name display (compact on mobile)
- WCAG 2.1 AA accessibility compliance
- Avatar display with fallback initials
- Loading/error states with retry capability

### CompanySelector

Combobox for company selection with:
- Search and filtering
- Custom styling options
- Keyboard navigation

### BudgetSelector

Multi-step budget configuration with:
- Matrix display for package selection
- Step-by-step wizard flow
- Tier comparison view

## Tech Stack

- **React 19** - Latest React with concurrent features
- **Storybook 10** - Component documentation and testing
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Radix primitives with beautiful defaults
- **TypeScript** - Full type safety
- **Vite** - Fast development and builds

## Getting Started

```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook
```

Storybook will open at `http://localhost:6006`

## Project Structure

```
src/
├── components/
│   ├── showcase/           # Featured demo components
│   │   ├── team-member-selector/
│   │   ├── company-selector/
│   │   └── budget-selector/
│   └── ui/                 # Base UI primitives (20+ components)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── popover.tsx
│       └── ...
└── lib/
    └── utils.ts            # Utility functions (cn, etc.)
```

## Component Stories

Each component includes comprehensive stories demonstrating:
- Basic usage patterns
- Edge cases and stress testing
- Accessibility testing
- Dark mode support
- Interaction tests

## License

MIT
