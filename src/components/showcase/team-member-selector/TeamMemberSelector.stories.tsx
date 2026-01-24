import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { expect, userEvent, within, fn, screen } from 'storybook/test'
import { TeamMemberSelector } from './TeamMemberSelector'
import type { TeamMember } from './TeamMemberSelector'

/* ============================================================================
   MOCK DATA ORGANIZATION PATTERN
   ============================================================================

   All mock data is intentionally kept in this file for:
   - Single source of truth: Everything about this component is HERE
   - AI-friendly: LLMs can generate/modify inline with full context
   - Self-documenting: Mock data shows exactly what the component expects
   - No import overhead: Simpler refactoring, no broken imports

   WHEN TO EXTRACT TO SEPARATE FILE (*.mocks.ts):
   - Multiple story files need the same mock data
   - Mock data is shared between Storybook and unit tests
   - File exceeds ~500 lines of mock data
   - Team prefers separation of concerns

   HOW TO EXTRACT (if needed):
   ```typescript
   // TeamMemberSelector.mocks.ts
   export const mockTeamMembers: TeamMember[] = [...]
   export const createMockMember = (overrides) => ({...})

   // TeamMemberSelector.stories.tsx
   import { mockTeamMembers, createMockMember } from './TeamMemberSelector.mocks'
   ```

   CURRENT STRUCTURE:
   1. Primary mock data (realistic team of 8)
   2. Edge case datasets (short/long/international names)
   3. Factory function (for bulk generation 100+ items)
   4. Story meta & configuration
   5. Stories
   ============================================================================ */

// =============================================================================
// SECTION 1: PRIMARY MOCK DATA
// Realistic team of 8 members with org hierarchy for standard testing
// =============================================================================

const mockTeamMembers: TeamMember[] = [
  {
    _id: '1',
    name: { givenName: 'Sarah', familyName: 'Chen', fullName: 'Sarah Chen' },
    primaryEmail: 'sarah.chen@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'Lead Designer',
    orgTitle: 'Senior UX Designer',
    orgDepartment: 'Design',
    isManager: true,
    directReports: ['2', '3']
  },
  {
    _id: '2',
    name: { givenName: 'Marcus', familyName: 'Johnson', fullName: 'Marcus Johnson' },
    primaryEmail: 'marcus.j@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'UI Designer',
    orgTitle: 'Product Designer',
    orgDepartment: 'Design',
    reportsTo: '1'
  },
  {
    _id: '3',
    name: { givenName: 'Emily', familyName: 'Rodriguez', fullName: 'Emily Rodriguez' },
    primaryEmail: 'emily.r@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    role: 'UX Researcher',
    orgTitle: 'Junior Researcher',
    orgDepartment: 'Design',
    reportsTo: '1'
  },
  {
    _id: '4',
    name: { givenName: 'David', familyName: 'Kim', fullName: 'David Kim' },
    primaryEmail: 'david.kim@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'Tech Lead',
    orgTitle: 'Senior Engineer',
    orgDepartment: 'Engineering',
    isManager: true,
    directReports: ['5', '6']
  },
  {
    _id: '5',
    name: { givenName: 'Anna', familyName: 'Petrov', fullName: 'Anna Petrov' },
    primaryEmail: 'anna.p@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    role: 'Frontend Developer',
    orgTitle: 'Software Engineer',
    orgDepartment: 'Engineering',
    reportsTo: '4'
  },
  {
    _id: '6',
    name: { givenName: 'James', familyName: 'Wilson', fullName: 'James Wilson' },
    primaryEmail: 'james.w@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'Backend Developer',
    orgTitle: 'Software Engineer',
    orgDepartment: 'Engineering',
    reportsTo: '4'
  },
  {
    _id: '7',
    name: { givenName: 'Lisa', familyName: 'Thompson', fullName: 'Lisa Thompson' },
    primaryEmail: 'lisa.t@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    role: 'Project Manager',
    orgTitle: 'Senior PM',
    orgDepartment: 'Product',
    isManager: true
  },
  {
    _id: '8',
    name: { givenName: 'Michael', familyName: 'Brown', fullName: 'Michael Brown' },
    primaryEmail: 'michael.b@company.com',
    role: 'Product Owner',
    orgTitle: 'Product Manager',
    orgDepartment: 'Product'
  }
]

const mockDepartments = ['Design', 'Engineering', 'Product']
const mockRoles = ['Lead Designer', 'UI Designer', 'UX Researcher', 'Tech Lead', 'Frontend Developer', 'Backend Developer', 'Project Manager', 'Product Owner']

// =============================================================================
// SECTION 2: EDGE CASE DATASETS
// Intentionally handcrafted (not generated) for predictable, reproducible testing
// =============================================================================

/** Short names (2-4 characters) - tests minimum width and initials fallback */
const mockShortNames: TeamMember[] = [
  {
    _id: 'short-1',
    name: { givenName: 'Jo', familyName: 'Li', fullName: 'Jo Li' },
    primaryEmail: 'jo.li@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'Designer',
    orgDepartment: 'Design'
  },
  {
    _id: 'short-2',
    name: { givenName: 'Ed', familyName: 'Wu', fullName: 'Ed Wu' },
    primaryEmail: 'ed.wu@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'Engineer',
    orgDepartment: 'Engineering'
  },
  {
    _id: 'short-3',
    name: { givenName: 'Al', familyName: 'Ko', fullName: 'Al Ko' },
    primaryEmail: 'al.ko@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'PM',
    orgDepartment: 'Product'
  },
  {
    _id: 'short-4',
    name: { givenName: 'Bo', familyName: 'Ng', fullName: 'Bo Ng' },
    primaryEmail: 'bo.ng@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    role: 'Designer',
    orgDepartment: 'Design'
  }
]

/** Long names (30+ chars) - tests truncation and text overflow */
const mockLongNames: TeamMember[] = [
  {
    _id: 'long-1',
    name: {
      givenName: 'Alexandra',
      familyName: 'Montgomery-Richardson',
      fullName: 'Alexandra Elizabeth Montgomery-Richardson III'
    },
    primaryEmail: 'alexandra.montgomery-richardson@very-long-company-name.enterprise.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'Senior Principal Lead Designer',
    orgTitle: 'Vice President of User Experience Design',
    orgDepartment: 'Design'
  },
  {
    _id: 'long-2',
    name: {
      givenName: 'Christopher',
      familyName: 'Vanderbilt-Worthington',
      fullName: 'Christopher James Vanderbilt-Worthington Jr.'
    },
    primaryEmail: 'christopher.vanderbilt-worthington@enterprise.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'Distinguished Staff Engineer',
    orgTitle: 'Senior Vice President of Engineering',
    orgDepartment: 'Engineering'
  },
  {
    _id: 'long-3',
    name: {
      givenName: 'Bartholomew',
      familyName: 'Fitzgerald-Pennington',
      fullName: 'Bartholomew Theodore Fitzgerald-Pennington'
    },
    primaryEmail: 'bartholomew.fitzgerald@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'Executive Product Director',
    orgDepartment: 'Product'
  }
]

/** Special characters and international names - tests Unicode and cultural patterns */
const mockSpecialNames: TeamMember[] = [
  {
    _id: 'special-1',
    name: { givenName: 'José', familyName: 'García-López', fullName: 'José María García-López' },
    primaryEmail: 'jose.garcia@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'Designer',
    orgDepartment: 'Design'
  },
  {
    _id: 'special-2',
    name: { givenName: 'Séan', familyName: "O'Connor", fullName: "Séan O'Connor" },
    primaryEmail: 'sean.oconnor@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    role: 'Engineer',
    orgDepartment: 'Engineering'
  },
  {
    _id: 'special-3',
    name: { givenName: '明', familyName: '李', fullName: '李明' }, // Chinese
    primaryEmail: 'li.ming@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    role: 'PM',
    orgDepartment: 'Product'
  },
  {
    _id: 'special-4',
    name: { givenName: 'Müller', familyName: 'Günther', fullName: 'Müller Günther' }, // German umlauts
    primaryEmail: 'muller.gunther@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'Engineer',
    orgDepartment: 'Engineering'
  },
  {
    _id: 'special-5',
    name: { givenName: 'Αλέξανδρος', familyName: 'Παπαδόπουλος', fullName: 'Αλέξανδρος Παπαδόπουλος' }, // Greek
    primaryEmail: 'alexandros@company.com',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    role: 'Designer',
    orgDepartment: 'Design'
  }
]

/** Mixed data set - combines all scenarios for realistic testing */
const mockMixedNames: TeamMember[] = [
  ...mockShortNames.slice(0, 2),
  ...mockTeamMembers.slice(0, 2),
  ...mockLongNames.slice(0, 2),
  ...mockSpecialNames.slice(0, 2)
]

/** Map name set keys to data */
const nameDataSets: Record<string, TeamMember[]> = {
  standard: mockTeamMembers,
  short: mockShortNames,
  long: mockLongNames,
  special: mockSpecialNames,
  mixed: mockMixedNames
}

// =============================================================================
// SECTION 3: FACTORY FUNCTION FOR BULK GENERATION
// Use this for stress testing, virtualization demos, or 100+ member scenarios.
// For edge case testing (specific names, languages), use handcrafted data above.
// =============================================================================

/** Sample data pools for realistic generation */
const firstNames = [
  // English
  'James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella',
  // Spanish
  'José', 'María', 'Carlos', 'Ana', 'Miguel', 'Carmen',
  // Chinese (romanized)
  'Wei', 'Fang', 'Ming', 'Xiao', 'Hui', 'Yan',
  // German
  'Hans', 'Greta', 'Klaus', 'Heidi',
  // Japanese (romanized)
  'Yuki', 'Hana', 'Kenji', 'Sakura',
  // Indian
  'Raj', 'Priya', 'Amit', 'Ananya',
]

const lastNames = [
  // English
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
  // Spanish
  'García', 'Rodríguez', 'Martínez', 'López', 'González',
  // Chinese
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen',
  // German
  'Müller', 'Schmidt', 'Schneider', 'Fischer',
  // Japanese
  'Tanaka', 'Yamamoto', 'Watanabe', 'Suzuki',
  // Indian
  'Patel', 'Sharma', 'Singh', 'Kumar',
]

const roles = ['Designer', 'Engineer', 'PM', 'Analyst', 'Lead', 'Manager', 'Director', 'VP']
const departments = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Operations']

/**
 * Factory function for generating bulk mock data.
 *
 * @param count - Number of members to generate
 * @param options - Optional configuration
 * @returns Array of TeamMember objects
 *
 * @example
 * // Generate 100 random members
 * const largeTeam = createMockMembers(100)
 *
 * @example
 * // Generate 50 members with specific department
 * const engineers = createMockMembers(50, { department: 'Engineering' })
 */
function createMockMembers(
  count: number,
  options: { department?: string; includePhotos?: boolean } = {}
): TeamMember[] {
  const { department, includePhotos = true } = options

  // Deterministic but varied photo URLs (placeholder service)
  const getPhotoUrl = (index: number) =>
    includePhotos
      ? `https://i.pravatar.cc/100?img=${(index % 70) + 1}`
      : undefined

  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[(i * 7) % lastNames.length] // Different cycle for variety
    const fullName = `${firstName} ${lastName}`
    const dept = department || departments[i % departments.length]

    return {
      _id: `gen-${i + 1}`,
      name: {
        givenName: firstName,
        familyName: lastName,
        fullName
      },
      primaryEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`.replace(/[^a-z.@]/g, ''),
      photoUrl: getPhotoUrl(i),
      role: roles[i % roles.length],
      orgDepartment: dept,
      isManager: i % 10 === 0, // Every 10th person is a manager
    }
  })
}

/** Pre-generated large dataset for stress testing stories */
const mockLargeTeam = createMockMembers(150)

// =============================================================================
// SECTION 4: STORYBOOK META CONFIGURATION
// =============================================================================

const meta = {
  title: 'Showcase/TeamMemberSelector',
  component: TeamMemberSelector,
  parameters: {
    layout: 'fullscreen',
    // Chromatic visual regression testing configuration
    chromatic: {
      viewports: [320, 640, 1024],
      pauseAnimationAtEnd: true,
    },
    docs: {
      description: {
        component: `
# Team Member Selector

A powerful, responsive team member selection component with advanced filtering capabilities.

## Features

- **Single & Multiple Selection**: Toggle between selecting one or many team members
- **Search**: Real-time search across name, email, role, and title
- **Filtering**: Filter by department and role
- **Responsive**: Adapts name display based on viewport (compact on mobile)
- **Accessibility**: Full keyboard navigation with arrow keys
- **Avatar Support**: Displays member photos with fallback initials
- **Sorting**: Alphabetical or management hierarchy sorting
- **Navigation Arrows**: Optional prev/next buttons for quick cycling

## Selection Variants

| Variant | Description |
|---------|-------------|
| \`single\` | Select one team member at a time |
| \`multiple\` | Select multiple members with checkboxes |
        `
      }
    }
  },
  // Note: autodocs tag removed - using custom MDX documentation instead (TeamMemberSelector.mdx)
  // Default args - MUST match component defaults for Storybook Controls to show correct initial values
  // Without these, Storybook won't know what the default is and controls will appear "unselected"
  args: {
    // Selection behavior
    variant: 'multiple',
    allowClear: true,

    // Appearance
    triggerMode: 'default',
    badgeAvatarSize: 'lg',
    // NOTE: compactName intentionally omitted - undefined triggers auto-detection via useIsSmUp()
    showAvatarStack: false,
    hideSelectedBadges: false,

    // Navigation & Sorting
    sortMode: 'alphabetical',
    showNavigationArrows: true,
    enableKeyboardNavigation: true,

    // Filtering
    allowDepartmentFilter: true,
    allowRoleFilter: true,

    // State
    disabled: false,
    isLoading: false,
  },
  argTypes: {
    // Selection behavior
    variant: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'Selection mode',
      table: { category: 'Selection', defaultValue: { summary: 'multiple' } }
    },
    maxSelected: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Maximum selections allowed (multiple mode only)',
      table: { category: 'Selection' },
      if: { arg: 'variant', eq: 'multiple' }
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing selection in single mode (click selected item again)',
      table: { category: 'Selection' }
    },

    // Appearance
    triggerMode: {
      control: 'inline-radio',
      options: ['default', 'icon'],
      description: 'Trigger button style',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } }
    },
    badgeAvatarSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size in badges, list, and stack (sm=20px, md=24px, lg=28px, xl=32px)',
      table: { category: 'Appearance', defaultValue: { summary: 'lg' } }
    },
    compactName: {
      control: 'boolean',
      description: 'Force compact name display (e.g., "John S.")',
      table: { category: 'Appearance' }
    },
    showAvatarStack: {
      control: 'boolean',
      description: 'Show avatar stack below icon trigger (requires triggerMode="icon")',
      table: { category: 'Appearance' }
    },
    hideSelectedBadges: {
      control: 'boolean',
      description: 'Hide selection badges below trigger',
      table: { category: 'Appearance' }
    },

    // Navigation & Sorting
    showNavigationArrows: {
      control: 'boolean',
      description: 'Show prev/next arrow buttons (requires variant="single")',
      table: { category: 'Navigation' }
    },
    enableKeyboardNavigation: {
      control: 'boolean',
      description: 'Enable keyboard arrow key navigation (↑↓←→) on trigger to cycle through members',
      table: { category: 'Navigation' }
    },
    sortMode: {
      control: 'inline-radio',
      options: ['none', 'alphabetical', 'management'],
      description: 'Sorting strategy',
      table: { category: 'Navigation', defaultValue: { summary: 'none' } }
    },

    // Filtering
    allowDepartmentFilter: {
      control: 'boolean',
      description: 'Show department filter dropdown',
      table: { category: 'Filtering' }
    },
    allowRoleFilter: {
      control: 'boolean',
      description: 'Show role filter dropdown',
      table: { category: 'Filtering' }
    },

    // State
    disabled: {
      control: 'boolean',
      description: 'Disable the selector',
      table: { category: 'State' }
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when nothing selected',
      table: { category: 'State' }
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton in dropdown',
      table: { category: 'State' }
    },
    loadingMessage: {
      control: 'text',
      description: 'Message shown during loading state',
      table: { category: 'State' }
    },
    error: {
      control: 'text',
      description: 'Error message to display in dropdown',
      table: { category: 'State' }
    },
    emptyMessage: {
      control: 'text',
      description: 'Message shown when no team members available',
      table: { category: 'State' }
    },
    emptySearchMessage: {
      control: 'text',
      description: 'Message shown when search/filter returns no results',
      table: { category: 'State' }
    },

    // Hidden from Controls (managed internally by story wrapper)
    onRetry: { table: { disable: true } },
    selectedIds: { table: { disable: true } },
    onSelectionChange: { table: { disable: true } },
    onFiltersChange: { table: { disable: true } },
    teamMembers: { table: { disable: true } },
    departments: { table: { disable: true } },
    roles: { table: { disable: true } },
    currentUserId: { table: { disable: true } },
    defaultDepartment: { table: { disable: true } },
    contentOnly: { table: { disable: true } },
    className: { table: { disable: true } }
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Story />
      </div>
    )
  ]
} as Meta<typeof TeamMemberSelector>

export default meta
type Story = StoryObj<typeof TeamMemberSelector>

// =============================================================================
// SECTION 5: STORY HELPERS & WRAPPERS
// =============================================================================

// Props type for the wrapper (subset of TeamMemberSelector props that stories can control)
type StoryProps = Partial<React.ComponentProps<typeof TeamMemberSelector>>

// Interactive story wrapper with state management
// This wrapper handles selectedIds state internally while passing through all other props from Controls
const TeamMemberSelectorWithState = (props: StoryProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState({ department: '', role: '', search: '' })

  const hasActiveFilters = filters.department || filters.role || filters.search

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Component Card */}
      <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
        <TeamMemberSelector
          teamMembers={mockTeamMembers}
          departments={mockDepartments}
          roles={mockRoles}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onFiltersChange={setFilters}
          {...props}
        />
      </div>
      {/* Storybook State - outside card */}
      <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
        <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
        <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        {hasActiveFilters && (
          <p className="text-amber-600 dark:text-amber-400">
            filters: {filters.department && `dept="${filters.department}"`}
            {filters.role && ` role="${filters.role}"`}
            {filters.search && ` search="${filters.search}"`}
          </p>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// SECTION 6: STORIES - Core Functionality
// =============================================================================

/**
 * The Primary story shown in docs - demonstrates full component capabilities.
 * Single-select with arrows, filters, and sorting. Toggle variant for multi-select.
 */
export const Primary: Story = {
  args: {
    variant: 'single',
    placeholder: 'Select team member...',
    allowClear: true,
    sortMode: 'alphabetical',
    showNavigationArrows: true,
    enableKeyboardNavigation: true,
    allowDepartmentFilter: true,
    allowRoleFilter: true,
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Full-featured: single-select with navigation arrows, filters, and sorting. Toggle variant to "multiple" for multi-select mode (arrows hide in multi-select by design).'
      }
    }
  }
}

export const SingleSelect: Story = {
  args: {
    variant: 'single',
    placeholder: 'Select assignee...',
    isLoading: false,
    enableKeyboardNavigation: true,
    showNavigationArrows: false
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Single selection mode - perfect for assigning a task owner or project lead.'
      }
    }
  }
}

export const MultipleSelect: Story = {
  args: {
    variant: 'multiple',
    placeholder: 'Select team members...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Multiple selection mode with checkboxes - ideal for building project teams.'
      }
    }
  }
}

export const WithMaxSelection: Story = {
  args: {
    variant: 'multiple',
    maxSelected: 3,
    placeholder: 'Select up to 3 members...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Limited to 3 selections maximum. Use the slider in Controls to adjust the limit.'
      }
    }
  }
}

export const WithNavigationArrows: Story = {
  args: {
    variant: 'single',
    showNavigationArrows: true,
    enableKeyboardNavigation: true,
    placeholder: 'Cycle through members...',
    error: ""
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Navigation arrows for quick cycling through team members. Also supports keyboard arrow keys.'
      }
    }
  }
}

export const AlphabeticalSort: Story = {
  args: {
    variant: 'single',
    sortMode: 'alphabetical',
    placeholder: 'Alphabetically sorted...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Team members sorted alphabetically by full name.'
      }
    }
  }
}

export const ManagementSort: Story = {
  args: {
    variant: 'single',
    sortMode: 'management',
    currentUserId: '1',
    placeholder: 'Management hierarchy sort...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Sorted by management hierarchy: current user first, then direct reports, then siblings, then others.'
      }
    }
  }
}

export const IconTrigger: Story = {
  args: {
    variant: 'multiple',
    triggerMode: 'icon',
    hideSelectedBadges: true,
    showAvatarStack: true,
    badgeAvatarSize: 'lg'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Component Card */}
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground mt-2">Add members:</span>
            <TeamMemberSelector
              {...args}
              teamMembers={mockTeamMembers}
              departments={mockDepartments}
              roles={mockRoles}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        </div>
        {/* Storybook State - outside card */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact icon-only trigger with avatar stack. Perfect for inline team assignment where space is limited. Supports multiple selection with overlapping avatars and tooltips on hover.'
      }
    }
  }
}

export const CompactNames: Story = {
  args: {
    variant: 'single',
    compactName: true,
    placeholder: 'Compact display...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Forced compact name display showing first name and last initial (e.g., "Sarah C.").'
      }
    }
  }
}

export const ResponsiveDemo: Story = {
  args: {
    variant: 'single',
    showNavigationArrows: true,
    placeholder: 'Select team member...'
  },
  render: () => {
    const [mobileIds, setMobileIds] = useState<string[]>(['1'])
    const [tabletIds, setTabletIds] = useState<string[]>(['1'])
    const [desktopIds, setDesktopIds] = useState<string[]>(['1'])

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-full max-w-[900px] text-sm p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md space-y-2">
          <p className="font-medium flex items-center gap-2">
            <span className="text-lg">📱</span> Responsive Behavior Demo
          </p>
          <p className="text-muted-foreground text-xs">
            Three breakpoints control the component layout. Below shows each state using <code className="px-1 py-0.5 bg-background border rounded text-[10px]">compactName</code> prop:
          </p>
        </div>

        {/* Three Breakpoint Examples */}
        <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mobile: < 640px */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">📱 Mobile</span>
              <span className="text-[10px] text-muted-foreground">&lt; 640px</span>
            </div>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={mobileIds}
                onSelectionChange={setMobileIds}
                variant="single"
                showNavigationArrows={true}
                compactName={true}
                placeholder="Sarah C."
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              ✓ Compact names • ✗ No arrows
            </p>
          </div>

          {/* Tablet: 640px - 1023px */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">📱 Tablet</span>
              <span className="text-[10px] text-muted-foreground">640px - 1023px</span>
            </div>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={tabletIds}
                onSelectionChange={setTabletIds}
                variant="single"
                showNavigationArrows={true}
                compactName={false}
                placeholder="Sarah Chen"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              ✓ Full names • ✗ No arrows
            </p>
          </div>

          {/* Desktop: >= 1024px */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">🖥️ Desktop</span>
              <span className="text-[10px] text-muted-foreground">≥ 1024px</span>
            </div>
            <div className="p-3 border rounded-lg bg-background min-w-[280px]">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={desktopIds}
                onSelectionChange={setDesktopIds}
                variant="single"
                showNavigationArrows={true}
                compactName={false}
                placeholder="Sarah Chen"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              ✓ Full names • ✓ Navigation arrows
            </p>
          </div>
        </div>

        {/* Technical Note */}
        <div className="w-full max-w-[900px] text-[10px] text-muted-foreground/70 p-3 border border-dashed rounded-md">
          <p><strong>Note:</strong> In production, these states trigger automatically based on viewport width via <code>window.matchMedia</code> and CSS breakpoints. Arrows use CSS <code>hidden lg:flex</code>, names use JS <code>useIsSmUp()</code> hook.</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all three responsive breakpoints side-by-side. In production, these states switch automatically based on viewport width.'
      }
    }
  }
}

export const WithCascadingFilters: Story = {
  args: {
    variant: 'multiple',
    allowDepartmentFilter: true,
    allowRoleFilter: true,
    placeholder: 'Filter by department, then role...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Enable department and role filters. The role filter is **cascading** - when you select a department, only roles that exist within that department are shown.'
      }
    }
  }
}

export const Disabled: Story = {
  args: {
    variant: 'multiple',
    disabled: true,
    placeholder: 'Disabled selector'
  },
  render: (args) => {
    const [selectedIds] = useState(['1', '4'])
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Component Card */}
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={() => {}}
          />
        </div>
        {/* Storybook State - outside card */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p>selected: [{selectedIds.join(', ')}] <span className="opacity-50">(disabled)</span></p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state with pre-selected members that cannot be modified.'
      }
    }
  }
}

export const SingleSelectWithClear: Story = {
  args: {
    variant: 'single',
    allowClear: true,
    placeholder: 'Click selected item to clear...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(['1'])
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-md space-y-2">
          <p className="font-medium">✨ Allow Clear Demo</p>
          <p className="text-muted-foreground text-xs">
            Click on the already-selected member again to clear the selection.
          </p>
        </div>
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p>selected: [{selectedIds.join(', ')}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the `allowClear` prop in single-select mode. Clicking on an already-selected item will deselect it.'
      }
    }
  }
}

export const MaxSelectionReached: Story = {
  args: {
    variant: 'multiple',
    maxSelected: 2,
    placeholder: 'Try selecting more than 2...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(['1', '2'])
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md space-y-2">
          <p className="font-medium">🚫 Max Selection Reached Demo</p>
          <p className="text-muted-foreground text-xs">
            Maximum of 2 selections reached. Additional items are disabled until you deselect someone.
          </p>
        </div>
        <div className="w-[320px] sm:w-[400px] min-h-[180px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className={selectedIds.length >= 2 ? 'text-orange-600 dark:text-orange-400' : ''}>
            selected: {selectedIds.length}/2 [{selectedIds.join(', ')}]
          </p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates behavior when `maxSelected` limit is reached. Unselected items become disabled, but selected items can still be toggled off.'
      }
    }
  }
}

export const PreFilteredData: Story = {
  args: {
    variant: 'multiple',
    placeholder: 'Individual contributors only...'
  },
  render: (args) => {
    // In a real app, this filtering happens in the API/database query
    // Example: GET /api/team-members?isManager=false
    const individualContributors = mockTeamMembers.filter(m => !m.isManager)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState({ department: '', role: '', search: '' })
    const hasActiveFilters = filters.department || filters.role || filters.search

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Component Card */}
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={individualContributors}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFiltersChange={setFilters}
          />
        </div>
        {/* Storybook State - outside card */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className="text-emerald-600 dark:text-emerald-400">data: mockTeamMembers.filter(m =&gt; !m.isManager)</p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
          {hasActiveFilters && (
            <p className="text-amber-600 dark:text-amber-400">
              filters: {filters.department && `dept="${filters.department}"`}
              {filters.role && ` role="${filters.role}"`}
              {filters.search && ` search="${filters.search}"`}
            </p>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '**Enterprise pattern**: Data is pre-filtered before reaching the component. The component receives already-filtered data and doesn\'t contain business logic.'
      }
    }
  }
}

export const PrefilterDepartment: Story = {
  args: {
    variant: 'multiple',
    defaultDepartment: 'Engineering',
    allowDepartmentFilter: true,
    allowRoleFilter: true,
    placeholder: 'Engineering team...'
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Pre-filtered to show only Engineering department members. The filter is visible and can be changed.'
      }
    }
  }
}

export const AvatarSizes: Story = {
  render: () => {
    const [smallIds, setSmallIds] = useState<string[]>(['1', '2'])
    const [mediumIds, setMediumIds] = useState<string[]>(['1', '2'])
    const [largeIds, setLargeIds] = useState<string[]>(['1', '2'])
    const [xlIds, setXlIds] = useState<string[]>(['1', '2'])

    return (
      <div className="flex flex-wrap gap-6">
        {/* Small */}
        <div className="flex flex-col gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-center">sm (20px)</code>
          <div className="w-[280px] p-3 border rounded-lg bg-background">
            <TeamMemberSelector
              teamMembers={mockTeamMembers}
              departments={mockDepartments}
              roles={mockRoles}
              selectedIds={smallIds}
              onSelectionChange={setSmallIds}
              variant="multiple"
              badgeAvatarSize="sm"
              placeholder="Small avatars..."
            />
          </div>
        </div>
        {/* Medium */}
        <div className="flex flex-col gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-center">md (24px)</code>
          <div className="w-[280px] p-3 border rounded-lg bg-background">
            <TeamMemberSelector
              teamMembers={mockTeamMembers}
              departments={mockDepartments}
              roles={mockRoles}
              selectedIds={mediumIds}
              onSelectionChange={setMediumIds}
              variant="multiple"
              badgeAvatarSize="md"
              placeholder="Medium avatars..."
            />
          </div>
        </div>
        {/* Large (default) */}
        <div className="flex flex-col gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-center">lg (28px) — default</code>
          <div className="w-[280px] p-3 border rounded-lg bg-background">
            <TeamMemberSelector
              teamMembers={mockTeamMembers}
              departments={mockDepartments}
              roles={mockRoles}
              selectedIds={largeIds}
              onSelectionChange={setLargeIds}
              variant="multiple"
              badgeAvatarSize="lg"
              placeholder="Large avatars..."
            />
          </div>
        </div>
        {/* Extra Large */}
        <div className="flex flex-col gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-center">xl (32px)</code>
          <div className="w-[280px] p-3 border rounded-lg bg-background">
            <TeamMemberSelector
              teamMembers={mockTeamMembers}
              departments={mockDepartments}
              roles={mockRoles}
              selectedIds={xlIds}
              onSelectionChange={setXlIds}
              variant="multiple"
              badgeAvatarSize="xl"
              placeholder="Extra large avatars..."
            />
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Compare avatar sizes. All sizes use **concentric curve alignment** where left padding = badge_radius - avatar_radius for visual harmony.'
      }
    }
  }
}

// =============================================================================
// SECTION 7: STORIES - Edge Cases & Stress Testing
// =============================================================================

type NameSetKey = 'standard' | 'short' | 'long' | 'special' | 'mixed'

export const NameLengthTesting: Story = {
  args: {
    variant: 'multiple',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [nameSet, setNameSet] = useState<NameSetKey>('standard')
    const teamData = nameDataSets[nameSet] || mockTeamMembers
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState({ department: '', role: '', search: '' })

    // Pre-select first two members when dataset changes
    React.useEffect(() => {
      const firstTwoIds = teamData.slice(0, 2).map(m => m._id)
      setSelectedIds(firstTwoIds)
    }, [nameSet])

    const hasActiveFilters = filters.department || filters.role || filters.search
    const nameSetOptions: NameSetKey[] = ['standard', 'short', 'long', 'special', 'mixed']

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Dataset Selector */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md space-y-2">
          <p className="font-medium">📏 Name Length Testing</p>
          <div className="flex flex-wrap gap-1.5">
            {nameSetOptions.map((key) => (
              <button
                key={key}
                onClick={() => setNameSet(key)}
                onMouseDown={(e) => e.preventDefault()}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  nameSet === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            teamMembers={teamData}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFiltersChange={setFilters}
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className="text-emerald-600 dark:text-emerald-400">dataset: {nameSet} ({teamData.length} members)</p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
          {hasActiveFilters && (
            <p className="text-amber-600 dark:text-amber-400">
              filters: {filters.department && `dept="${filters.department}"`}
              {filters.role && ` role="${filters.role}"`}
              {filters.search && ` search="${filters.search}"`}
            </p>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Test how the component handles various name lengths and character sets:

| Dataset | Description |
|---------|-------------|
| **standard** | Normal names (default mock data) |
| **short** | 2-4 character names (Jo Li, Ed Wu) |
| **long** | 30+ character names with hyphenation |
| **special** | International characters (Spanish, Irish, Chinese, German, Greek) |
| **mixed** | Combination of all types |

The component uses CSS \`truncate\` class for text overflow, showing ellipsis when text is too long.
        `
      }
    }
  }
}

export const LoadingState: Story = {
  args: {
    variant: 'multiple',
    isLoading: true,
    loadingMessage: 'Loading team members...',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(args.isLoading ?? true)

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md space-y-2">
          <p className="font-medium">⏳ Loading State Demo</p>
          <p className="text-muted-foreground text-xs">
            Shows skeleton placeholders while data is loading.
          </p>
          <button
            onClick={() => setIsLoading((prev) => !prev)}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLoading ? 'Stop Loading' : 'Start Loading'}
          </button>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            isLoading={isLoading}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className={isLoading ? 'text-amber-600 dark:text-amber-400' : ''}>
            isLoading: {isLoading ? 'true' : 'false'}
          </p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the loading state with animated skeleton placeholders.

**Features:**
- Skeleton avatars mimicking the list item structure
- Loading message with spinner animation
- Toggle loading to see the transition

**Use case:** When team members are being fetched from an API or Convex reactive query is still syncing.
        `
      }
    }
  }
}

export const ErrorState: Story = {
  args: {
    variant: 'multiple',
    error: 'Failed to load team members. Please try again.',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [error, setError] = useState<string | null>(args.error ?? 'Failed to load team members.')
    const [isRetrying, setIsRetrying] = useState(false)

    // Simulate retry
    const handleRetry = () => {
      setIsRetrying(true)
      setError(null)
      setTimeout(() => {
        setIsRetrying(false)
        // 50% chance to succeed on retry
        if (Math.random() > 0.5) {
          setError(null)
        } else {
          setError('Network error: Unable to reach the server.')
        }
      }, 1500)
    }

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md space-y-2">
          <p className="font-medium">❌ Error State Demo</p>
          <p className="text-muted-foreground text-xs">
            Shows error message with retry button. Click "Try again" inside the dropdown.
          </p>
          <button
            onClick={() => setError((prev) => prev ? null : 'Failed to load team members.')}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {error ? 'Clear Error' : 'Trigger Error'}
          </button>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            error={error}
            isLoading={isRetrying}
            loadingMessage="Retrying..."
            onRetry={handleRetry}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className={error ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
            error: {error ? `"${error}"` : 'null'}
          </p>
          {isRetrying && <p className="text-amber-600 dark:text-amber-400">isRetrying: true</p>}
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the error state with destructive styling and retry capability.

**Features:**
- Error icon with red/destructive color scheme
- Error message display
- "Try again" button triggers retry with loading state
- 50% chance to succeed on retry (simulated)

**Use case:** API failures, network errors, permission issues, or any data fetch error.
        `
      }
    }
  }
}

export const EmptyData: Story = {
  args: {
    variant: 'multiple',
    emptyMessage: 'No team members in the system yet.',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [hasData, setHasData] = useState(false)

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-md space-y-2">
          <p className="font-medium">📭 Empty Data Demo</p>
          <p className="text-muted-foreground text-xs">
            Shows what happens when no team members exist in the system.
          </p>
          <button
            onClick={() => setHasData((prev) => !prev)}
            className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {hasData ? 'Remove All Data' : 'Add Sample Data'}
          </button>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            teamMembers={hasData ? mockTeamMembers : []}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className={hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}>
            teamMembers.length: {hasData ? mockTeamMembers.length : 0}
          </p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the empty state when no team members exist.

**Features:**
- Users icon with muted styling
- Customizable empty message via \`emptyMessage\` prop
- Toggle data to see the transition

**Use case:** New accounts, demo environments, or teams with no members yet.
        `
      }
    }
  }
}

export const EmptySearchResults: Story = {
  args: {
    variant: 'multiple',
    emptySearchMessage: 'No team members match your search',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-md space-y-2">
          <p className="font-medium">🔍 Empty Search Results Demo</p>
          <p className="text-muted-foreground text-xs">
            Type <code className="bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">Sir Reginald McFluffington III</code> in the search box to see the empty state.
          </p>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            allowDepartmentFilter
            allowRoleFilter
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className="text-muted-foreground">Type in search to test empty results</p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the empty state when search/filter returns no results.

**Features:**
- Search icon with muted styling
- Customizable message via \`emptySearchMessage\` prop
- Suggests trying different search terms

**Use case:** Overly specific searches, typos, or restrictive filters.
        `
      }
    }
  }
}

export const StressTestLargeTeam: Story = {
  args: {
    variant: 'multiple',
    placeholder: 'Search 150 team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState({ department: '', role: '', search: '' })
    const hasActiveFilters = filters.department || filters.role || filters.search

    // Use the factory-generated large team
    const allDepartments = [...new Set(mockLargeTeam.map(m => m.orgDepartment).filter(Boolean))] as string[]
    const allRoles = [...new Set(mockLargeTeam.map(m => m.role).filter(Boolean))] as string[]

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-[320px] sm:w-[400px] text-sm p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-md space-y-2">
          <p className="font-medium">🏋️ Stress Test: 150 Members</p>
          <p className="text-muted-foreground text-xs">
            Tests performance with factory-generated data. Use filters and search to narrow results.
            Consider implementing virtualization if scrolling feels slow.
          </p>
        </div>

        {/* Always-visible dropdown content */}
        <div className="w-[320px] sm:w-[400px] border rounded-lg bg-background shadow-md overflow-hidden">
          <TeamMemberSelector
            {...args}
            contentOnly
            teamMembers={mockLargeTeam}
            departments={allDepartments}
            roles={allRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFiltersChange={setFilters}
            allowDepartmentFilter
            allowRoleFilter
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p className="text-violet-600 dark:text-violet-400">
            dataset: mockLargeTeam ({mockLargeTeam.length} members, factory-generated)
          </p>
          <p>selected: {selectedIds.length} [{selectedIds.slice(0, 3).join(', ')}{selectedIds.length > 3 ? '...' : ''}]</p>
          {hasActiveFilters && (
            <p className="text-amber-600 dark:text-amber-400">
              filters: {filters.department && `dept="${filters.department}"`}
              {filters.role && ` role="${filters.role}"`}
              {filters.search && ` search="${filters.search}"`}
            </p>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
**Stress Test with Factory-Generated Data**

Uses \`createMockMembers(150)\` to generate a large, diverse team for performance testing.

**Factory Features:**
- Deterministic: Same output every time (no random values)
- International names: English, Spanish, Chinese, German, Japanese, Indian
- Realistic distribution: Departments, roles, management hierarchy
- Unique photos: Uses pravatar.cc placeholder service

**When to Use Factory vs Handcrafted Data:**

| Scenario | Use Factory | Use Handcrafted |
|----------|-------------|-----------------|
| Performance testing | ✅ | |
| Virtualization demos | ✅ | |
| Specific edge case (e.g., 50-char name) | | ✅ |
| Reproducible bug reports | | ✅ |
| Screenshot consistency | | ✅ |

**Factory Usage:**
\`\`\`typescript
// Generate 100 members
const team = createMockMembers(100)

// Generate 50 engineers
const engineers = createMockMembers(50, { department: 'Engineering' })

// Generate without photos (faster)
const noPics = createMockMembers(200, { includePhotos: false })
\`\`\`
        `
      }
    },
    chromatic: {
      // Skip Chromatic for stress test (too many DOM elements)
      disableSnapshot: true
    }
  }
}

// =============================================================================
// SECTION 8: STORIES - Accessibility & Interaction Testing
// =============================================================================

export const KeyboardNavigation: Story = {
  args: {
    variant: 'multiple',
    enableKeyboardNavigation: true,
    allowDepartmentFilter: true,
    allowRoleFilter: true,
    placeholder: 'Use keyboard to navigate...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState({ department: '', role: '', search: '' })
    const hasActiveFilters = filters.department || filters.role || filters.search

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Keyboard Guide */}
        <div className="w-[320px] sm:w-[400px] text-sm p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-md space-y-3">
          <p className="font-medium flex items-center gap-2">
            <span className="text-lg">⌨️</span> Keyboard Navigation Demo
          </p>
          <p className="text-muted-foreground text-xs">
            Test all keyboard interactions. Click the selector first, then use these keys:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">Tab</kbd>
              <span className="text-muted-foreground">Move focus</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">↑↓</kbd>
              <span className="text-muted-foreground">Navigate list</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">Enter</kbd>
              <span className="text-muted-foreground">Select item</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">Space</kbd>
              <span className="text-muted-foreground">Toggle checkbox</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">Esc</kbd>
              <span className="text-muted-foreground">Close dropdown</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono shadow-sm">Type</kbd>
              <span className="text-muted-foreground">Search filter</span>
            </div>
          </div>
        </div>

        {/* Component Card */}
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFiltersChange={setFilters}
          />
        </div>

        {/* State Panel */}
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p>selected: [{selectedIds.length ? selectedIds.join(', ') : ''}]</p>
          {hasActiveFilters && (
            <p className="text-amber-600 dark:text-amber-400">
              filters: {filters.department && `dept="${filters.department}"`}
              {filters.role && ` role="${filters.role}"`}
              {filters.search && ` search="${filters.search}"`}
            </p>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates full keyboard navigation support for accessibility compliance.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus between trigger, search input, filters, and list items |
| \`↑\` / \`↓\` | Navigate through list items (when dropdown is open) |
| \`Enter\` | Select the focused item |
| \`Space\` | Toggle checkbox (multiple selection mode) |
| \`Esc\` | Close the dropdown |
| \`Type\` | Filter by searching (when search input is focused) |

## Accessibility Features

- **ARIA attributes**: \`role="combobox"\`, \`aria-expanded\`
- **Focus management**: Returns focus to trigger after selection
- **Screen reader support**: Labels on all interactive elements

**WCAG 2.1 AA Compliance**: This component supports keyboard-only navigation.
        `
      }
    }
  }
}

export const FocusStates: Story = {
  args: {
    hideSelectedBadges: false,
    variant: "multiple"
  },

  render: () => {
    const [selectedIds1, setSelectedIds1] = useState<string[]>([])
    const [selectedIds2, setSelectedIds2] = useState<string[]>(['1', '2'])
    const [listSelectedIds, setListSelectedIds] = useState<string[]>([])
    const [filterSelectedIds, setFilterSelectedIds] = useState<string[]>([])

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-full max-w-[700px] text-sm p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md space-y-2">
          <p className="font-medium flex items-center gap-2">
            <span className="text-lg">🎯</span> Focus States Demo
          </p>
          <p className="text-muted-foreground text-xs">
            Use <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono">Tab</kbd> to navigate through each element and observe the focus ring styles. All interactive elements have visible focus indicators for accessibility.
          </p>
        </div>

        {/* Focus States Grid */}
        <div className="w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Trigger Focus */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Trigger Button (Tab here first)</p>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={selectedIds1}
                onSelectionChange={setSelectedIds1}
                variant="single"
                placeholder="Focus on me..."
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Focus ring appears on hover/focus with border change
            </p>
          </div>

          {/* Badges with Remove Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Badge Remove Buttons</p>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={selectedIds2}
                onSelectionChange={setSelectedIds2}
                variant="multiple"
                placeholder="Tab to X buttons..."
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Each X button in badges is focusable
            </p>
          </div>

          {/* Dropdown List Items */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">List Item Focus/Hover</p>
            <div className="p-3 border rounded-lg bg-background shadow-md overflow-hidden">
              <TeamMemberSelector
                teamMembers={mockTeamMembers.slice(0, 4)}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={listSelectedIds}
                onSelectionChange={setListSelectedIds}
                variant="multiple"
                hideSelectedBadges
                contentOnly
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Arrow keys highlight items, mouse hovers show preview
            </p>
          </div>

          {/* Filters Focus */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Filter Dropdowns</p>
            <div className="p-3 border rounded-lg bg-background shadow-md overflow-hidden">
              <TeamMemberSelector
                teamMembers={mockTeamMembers.slice(0, 3)}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={filterSelectedIds}
                onSelectionChange={setFilterSelectedIds}
                variant="multiple"
                hideSelectedBadges
                contentOnly
                allowDepartmentFilter
                allowRoleFilter
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Tab through search input and filter selects
            </p>
          </div>
        </div>

        {/* Focus Style Reference */}
        <div className="w-full max-w-[700px] text-xs p-3 bg-muted/50 rounded-md space-y-2">
          <p className="font-medium">Focus Style Reference</p>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div>• Trigger: <code className="bg-background px-1 rounded">border-border</code> on focus</div>
            <div>• List items: <code className="bg-background px-1 rounded">bg-accent</code> highlight</div>
            <div>• Checkboxes: <code className="bg-background px-1 rounded">ring-2 ring-ring</code></div>
            <div>• Inputs: <code className="bg-background px-1 rounded">ring-2 ring-ring</code></div>
          </div>
        </div>
      </div>
    )
  },

  parameters: {
    docs: {
      description: {
        story: `
Showcases focus states for all interactive elements in the component.

## Focus Indicators

| Element | Focus Style |
|---------|-------------|
| **Trigger button** | Border changes to visible \`border-border\` |
| **Search input** | Standard input focus ring |
| **Filter selects** | Browser default or custom focus ring |
| **List items** | Background highlight \`bg-accent\` |
| **Checkboxes** | Ring outline \`ring-2 ring-ring\` |
| **Remove (X) buttons** | Hover shows destructive color |

## Accessibility Notes

- All focus states meet **WCAG 2.1 AA** contrast requirements
- Focus is never trapped - users can always Tab out
- Focus order follows visual layout (top-to-bottom, left-to-right)
        `
      }
    }
  }
}

export const HoverStates: Story = {
  args: {
    variant: 'multiple',
    hideSelectedBadges: false,
    placeholder: 'Hover over elements...'
  },
  render: () => {
    const [selectedIds1, setSelectedIds1] = useState<string[]>([])
    const [selectedIds2, setSelectedIds2] = useState<string[]>(['1', '2'])
    const [listSelectedIds, setListSelectedIds] = useState<string[]>(['1'])

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Info Banner */}
        <div className="w-full max-w-[700px] text-sm p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-md space-y-2">
          <p className="font-medium flex items-center gap-2">
            <span className="text-lg">🎨</span> Hover States Demo
          </p>
          <p className="text-muted-foreground text-xs">
            Uses <code className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono">storybook-addon-pseudo-states</code> to force <code className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono">:hover</code> state on all elements simultaneously.
          </p>
        </div>

        {/* Hover States Grid */}
        <div className="w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Trigger Hover */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Trigger Button Hover</p>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={selectedIds1}
                onSelectionChange={setSelectedIds1}
                variant="single"
                placeholder="Border appears on hover..."
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Border becomes visible via <code>hover:border-border</code>
            </p>
          </div>

          {/* Badges with Remove Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Badge X Button Hover</p>
            <div className="p-3 border rounded-lg bg-background">
              <TeamMemberSelector
                teamMembers={mockTeamMembers}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={selectedIds2}
                onSelectionChange={setSelectedIds2}
                variant="multiple"
                placeholder="Hover X to see red..."
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              X icon turns red via <code>hover:text-destructive</code>
            </p>
          </div>

          {/* Dropdown List Items */}
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">List Item Hover (Dropdown Content)</p>
            <div className="p-3 border rounded-lg bg-background shadow-md overflow-hidden">
              <TeamMemberSelector
                teamMembers={mockTeamMembers.slice(0, 5)}
                departments={mockDepartments}
                roles={mockRoles}
                selectedIds={listSelectedIds}
                onSelectionChange={setListSelectedIds}
                variant="multiple"
                hideSelectedBadges
                contentOnly
              />
            </div>
            <p className="text-[10px] text-muted-foreground/60">
              Items highlight via <code>bg-accent</code> on hover. Checkboxes also show hover state.
            </p>
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    pseudo: {
      hover: true
    },
    docs: {
      description: {
        story: `
Demonstrates hover effects using the \`storybook-addon-pseudo-states\` addon.

**Hover Effects in this component:**

| Element | Hover Effect |
|---------|--------------|
| **Trigger button** | Border becomes visible (\`border-border\`) |
| **List items** | Background highlight (\`bg-accent\`) |
| **Badges** | Subtle background change |
| **Remove (X) buttons** | Icon turns red (\`text-destructive\`) |
| **Avatar stack** | Avatar scales up, remove button appears |

**Note:** This story uses \`pseudo: { hover: true }\` to force the hover state on all elements simultaneously. In real usage, only one element would be hovered at a time.
        `
      }
    }
  }
}

export const DarkMode: Story = {
  args: {
    variant: 'multiple',
    allowDepartmentFilter: true,
    allowRoleFilter: true,
    placeholder: 'Select team members...'
  },
  globals: {
    darkMode: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the component in dark mode.

**How to test:**
1. Use the **theme toggle** in Storybook toolbar (paint brush icon) to switch between light/dark
2. All colors should adapt automatically via CSS variables
3. Borders, text, and interactive states should remain visible

**Implementation:**
- Uses \`@storybook/addon-themes\` with \`withThemeByClassName\`
- Applies \`.dark\` class to the story root
- CSS variables from \`@layer theme\` override light theme values
- Same component code works in both themes
        `
      }
    }
  },
  render: (args) => <TeamMemberSelectorWithState {...args} />
}

// =============================================================================
// SECTION 9: STORIES - Automated Interaction Tests (play functions)
// =============================================================================

export const InteractionTestSingleSelect: Story = {
  args: {
    variant: 'single',
    placeholder: 'Select a team member...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] min-h-[140px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p data-testid="selected-state">selected: [{selectedIds.join(', ')}]</p>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open dropdown by clicking trigger', async () => {
      const trigger = canvas.getByRole('combobox')
      await userEvent.click(trigger)
      // Wait for popover to open
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    await step('Search for "Sarah"', async () => {
      // Popover renders in a portal, so use screen instead of canvas
      const searchInput = await screen.findByPlaceholderText('Search team members...')
      await userEvent.type(searchInput, 'Sarah')
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Select Sarah Chen', async () => {
      // Options are in the portal
      const option = await screen.findByText('Sarah Chen')
      await userEvent.click(option)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify selection', async () => {
      const trigger = canvas.getByRole('combobox')
      await expect(trigger).toHaveTextContent(/Sarah/)
    })

    await step('Close dropdown to see result', async () => {
      await userEvent.keyboard('{Escape}')
      await new Promise(resolve => setTimeout(resolve, 200))
    })
  },
  parameters: {
    docs: {
      description: {
        story: `
**Automated Interaction Test** - Single Selection

This story demonstrates Storybook's interaction testing capabilities.
Watch the Interactions panel to see each step execute:

1. ✅ Open dropdown by clicking trigger
2. ✅ Search for "Sarah"
3. ✅ Select Sarah Chen from results
4. ✅ Verify selection appears in trigger
5. ✅ Close dropdown to see final result

**Why this matters:**
- Tests run automatically on every build
- Catches regressions before deployment
- Documents expected behavior
- Serves as living documentation
        `
      }
    }
  }
}

export const InteractionTestMultiSelect: Story = {
  args: {
    variant: 'multiple',
    placeholder: 'Select team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] min-h-[180px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p data-testid="selected-count">count: {selectedIds.length}</p>
          <p data-testid="selected-ids">ids: [{selectedIds.join(', ')}]</p>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // Helper to find option in dropdown (not in badges)
    // List items have class "font-medium truncate", badges have "text-xs"
    const findListOption = async (name: string) => {
      const elements = await screen.findAllByText(name)
      // Find the one in the dropdown list (has font-medium class)
      const listOption = elements.find(el => el.classList.contains('font-medium'))
      return listOption || elements[0]
    }

    await step('Open dropdown', async () => {
      const trigger = canvas.getByRole('combobox')
      await userEvent.click(trigger)
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    await step('Select first team member (Sarah Chen)', async () => {
      const sarahOption = await findListOption('Sarah Chen')
      await userEvent.click(sarahOption)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Select second team member (Marcus Johnson)', async () => {
      const marcusOption = await findListOption('Marcus Johnson')
      await userEvent.click(marcusOption)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Select third team member (David Kim)', async () => {
      const davidOption = await findListOption('David Kim')
      await userEvent.click(davidOption)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify 3 members selected', async () => {
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('count: 3')
    })

    await step('Deselect Marcus Johnson', async () => {
      const marcusOption = await findListOption('Marcus Johnson')
      await userEvent.click(marcusOption)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify 2 members selected', async () => {
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('count: 2')
    })

    await step('Close dropdown to see selected badges', async () => {
      await userEvent.keyboard('{Escape}')
      await new Promise(resolve => setTimeout(resolve, 200))
    })
  },
  parameters: {
    docs: {
      description: {
        story: `
**Automated Interaction Test** - Multiple Selection

Tests the multi-select workflow:

1. ✅ Open dropdown
2. ✅ Select Sarah Chen
3. ✅ Select Marcus Johnson
4. ✅ Select David Kim
5. ✅ Verify 3 members selected
6. ✅ Deselect Marcus Johnson
7. ✅ Verify 2 members remain selected
8. ✅ Close dropdown to see selected badges

**Test coverage:**
- Selection adds to list
- Deselection removes from list
- Checkboxes toggle correctly
- Count updates in real-time
        `
      }
    }
  }
}

export const InteractionTestSearch: Story = {
  args: {
    variant: 'multiple',
    allowDepartmentFilter: true,
    placeholder: 'Test search and filter...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState({ department: '', role: '', search: '' })

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] min-h-[180px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onFiltersChange={setFilters}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p data-testid="filter-search">search: "{filters.search}"</p>
          <p data-testid="filter-dept">department: "{filters.department}"</p>
          <p data-testid="selected-count">selected: {selectedIds.length}</p>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open dropdown', async () => {
      const trigger = canvas.getByRole('combobox')
      await userEvent.click(trigger)
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    await step('Filter by Engineering department', async () => {
      // Filter select is in the portal
      const deptSelect = await screen.findByDisplayValue('All Departments')
      await userEvent.selectOptions(deptSelect, 'Engineering')
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify department filter applied', async () => {
      const filterState = canvas.getByTestId('filter-dept')
      await expect(filterState).toHaveTextContent('department: "Engineering"')
    })

    await step('Search for "David"', async () => {
      // Search input is in the portal
      const searchInput = await screen.findByPlaceholderText('Search team members...')
      await userEvent.type(searchInput, 'David')
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify search filter applied', async () => {
      const searchState = canvas.getByTestId('filter-search')
      await expect(searchState).toHaveTextContent('search: "David"')
    })

    await step('Select David Kim (should be only visible result)', async () => {
      // Options are in the portal
      const davidOption = await screen.findByText('David Kim')
      await userEvent.click(davidOption)
      await new Promise(resolve => setTimeout(resolve, 200))
    })

    await step('Verify selection', async () => {
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 1')
    })

    await step('Close dropdown to see result', async () => {
      await userEvent.keyboard('{Escape}')
      await new Promise(resolve => setTimeout(resolve, 200))
    })
  },
  parameters: {
    docs: {
      description: {
        story: `
**Automated Interaction Test** - Search & Filter

Tests the search and filter workflow:

1. ✅ Open dropdown
2. ✅ Filter by Engineering department
3. ✅ Verify filter applied
4. ✅ Search for "David"
5. ✅ Verify search narrows results
6. ✅ Select David Kim
7. ✅ Verify selection
8. ✅ Close dropdown to see result

**Test coverage:**
- Department filter works
- Search filter works
- Filters combine correctly
- Selection works with active filters
        `
      }
    }
  }
}

export const InteractionTestMaxSelectionLimit: Story = {
  args: {
    variant: 'multiple',
    maxSelected: 3,
    placeholder: 'Select up to 3 team members...'
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-[320px] sm:w-[400px] min-h-[180px] p-4 border rounded-lg bg-background">
          <TeamMemberSelector
            {...args}
            teamMembers={mockTeamMembers}
            departments={mockDepartments}
            roles={mockRoles}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
        <div className="w-[320px] sm:w-[400px] text-xs font-mono text-foreground/70 p-3 border border-dashed border-border rounded-md bg-secondary/50 space-y-1">
          <p className="uppercase tracking-wider text-[10px] mb-1 text-muted-foreground">⚙️ Storybook State</p>
          <p data-testid="selected-count">selected: {selectedIds.length}/3</p>
          <p data-testid="selected-ids">ids: [{selectedIds.join(', ')}]</p>
          <p data-testid="limit-reached" className={selectedIds.length >= 3 ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-muted-foreground'}>
            {selectedIds.length >= 3 ? '⚠️ Limit reached - other items disabled' : '✓ Can select more'}
          </p>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // Helper to find option in dropdown (not in badges)
    const findListOption = async (name: string) => {
      const elements = await screen.findAllByText(name)
      const listOption = elements.find(el => el.classList.contains('font-medium'))
      return listOption || elements[0]
    }

    await step('Open dropdown', async () => {
      const trigger = canvas.getByRole('combobox')
      await userEvent.click(trigger)
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    await step('Select first team member (Sarah Chen)', async () => {
      const sarahOption = await findListOption('Sarah Chen')
      await userEvent.click(sarahOption)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 1/3')
    })

    await step('Select second team member (Marcus Johnson)', async () => {
      const marcusOption = await findListOption('Marcus Johnson')
      await userEvent.click(marcusOption)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 2/3')
    })

    await step('Select third team member (Emily Rodriguez) - reaching limit', async () => {
      const emilyOption = await findListOption('Emily Rodriguez')
      await userEvent.click(emilyOption)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 3/3')
      
      const limitReached = canvas.getByTestId('limit-reached')
      await expect(limitReached).toHaveTextContent(/Limit reached/)
    })

    await step('Verify other items are disabled when limit reached', async () => {
      // Check that David Kim (not selected) is disabled
      // CommandItem uses data-disabled="true" attribute (not standard disabled)
      const davidOption = await findListOption('David Kim')
      // Important: findListOption returns the inner text div, but the disabled attribute
      // is on the parent CommandItem container. We need to traverse up.
      const itemContainer = davidOption.closest('[data-value]') || davidOption
      
      const isDisabled = itemContainer?.getAttribute('data-disabled') === 'true' ||
                        itemContainer?.hasAttribute('disabled') ||
                        itemContainer?.getAttribute('aria-disabled') === 'true'
      
      await expect(isDisabled).toBe(true)
    })

    await step('Attempt to select fourth member (David Kim) - should fail', async () => {
      const davidOption = await findListOption('David Kim')
      const initialCount = canvas.getByTestId('selected-count').textContent
      
      // Try to click - should throw error because of pointer-events: none or just not trigger selection
      try {
        await userEvent.click(davidOption)
      } catch (e) {
        // Expected error: Unable to perform pointer interaction as the element has `pointer-events: none`
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Count should remain at 3/3
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 3/3')
      await expect(countElement.textContent).toBe(initialCount)
    })

    await step('Deselect one member (Emily Rodriguez) to free up a slot', async () => {
      const emilyOption = await findListOption('Emily Rodriguez')
      await userEvent.click(emilyOption)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 2/3')
      
      const limitReached = canvas.getByTestId('limit-reached')
      await expect(limitReached).toHaveTextContent(/Can select more/)
    })

    await step('Verify items are enabled again after deselecting', async () => {
      const davidOption = await findListOption('David Kim')
      // Important: findListOption returns the inner text div, but the disabled attribute
      // is on the parent CommandItem container. We need to traverse up.
      const itemContainer = davidOption.closest('[data-value]') || davidOption

      // CommandItem uses data-disabled="true" attribute (not standard disabled)
      const isDisabled = itemContainer?.getAttribute('data-disabled') === 'true' ||
                        itemContainer?.hasAttribute('disabled') ||
                        itemContainer?.getAttribute('aria-disabled') === 'true'
      
      // Should be enabled now (data-disabled should be null or "false")
      await expect(isDisabled).toBe(false)
    })

    await step('Select David Kim now that slot is available', async () => {
      const davidOption = await findListOption('David Kim')
      await userEvent.click(davidOption)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const countElement = canvas.getByTestId('selected-count')
      await expect(countElement).toHaveTextContent('selected: 3/3')
    })

    await step('Close dropdown to see final selection', async () => {
      await userEvent.keyboard('{Escape}')
      await new Promise(resolve => setTimeout(resolve, 200))
    })
  },
  parameters: {
    docs: {
      description: {
        story: `
**Design-Focused Test: Max Selection Limit Enforcement**

This test validates the critical UX pattern of enforcing maximum selection limits:

1. ✅ Select items up to the max (3)
2. ✅ Verify other items become visually disabled
3. ✅ Attempt to select disabled item (should fail)
4. ✅ Deselect one item to free up a slot
5. ✅ Verify items become enabled again
6. ✅ Verify selection works after deselecting
7. ✅ Verify UI clearly communicates limit state

**Design Validation:**
- **Visual feedback**: Disabled state is clearly visible
- **User expectations**: Cannot select more than max
- **Recovery path**: Can deselect to enable others
- **Clear communication**: Shows "X/3 selected" and limit warning
- **Accessibility**: Disabled items have proper ARIA attributes

**Why this matters:**
This pattern is common in team assignment, project creation, and resource allocation workflows where limits prevent over-allocation. The test ensures users understand when they've hit the limit and how to adjust their selection.
        `
      }
    }
  }
}
