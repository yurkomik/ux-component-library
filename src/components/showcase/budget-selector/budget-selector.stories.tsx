import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { BudgetSelector } from './budget-selector'

const meta = {
  title: 'Showcase/BudgetSelector',
  component: BudgetSelector,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Budget Selector

An advanced budget calculator component designed for UX agency client presentations.
This component provides multiple ways to configure project budgets:

- **Quick Range Matrix**: Visual grid for selecting team size × duration combinations
- **Package Tiers**: Pre-configured packages for common project types
- **Budget Wizard**: Step-by-step guided budget configuration

## Features

- Region-based pricing (EU, Mixed, North America)
- Direct value editing with automatic formatting
- Hover cards showing detailed breakdowns
- Cross-hair highlighting in the matrix view
- Responsive team size expansion
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    defaultRegion: {
      control: 'select',
      options: ['EU', 'MIX', 'NA'],
      description: 'Default pricing region',
      table: {
        defaultValue: { summary: 'EU' }
      }
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 0.5 },
      description: 'Current budget value in person-months'
    },
    teamSize: {
      control: { type: 'number', min: 0.5, max: 10, step: 0.5 },
      description: 'Team size for display formatting'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-[400px] p-6 border rounded-lg bg-background">
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof BudgetSelector>

export default meta
type Story = StoryObj<typeof meta>

// Interactive story with state
const BudgetSelectorWithState = ({ defaultRegion = 'EU', initialValue = 0 }: { defaultRegion?: 'EU' | 'MIX' | 'NA', initialValue?: number }) => {
  const [value, setValue] = useState<number | null>(initialValue)
  const [teamSize, setTeamSize] = useState<number | undefined>(undefined)

  const handleChange = (newValue: number, newTeamSize?: number) => {
    setValue(newValue)
    if (newTeamSize) setTeamSize(newTeamSize)
  }

  return (
    <div className="space-y-4">
      <BudgetSelector
        value={value}
        teamSize={teamSize}
        onChange={handleChange}
        defaultRegion={defaultRegion}
      />
      <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
        <p><strong>Debug Info:</strong></p>
        <p>Value: {value?.toFixed(2) ?? 'null'} person-months</p>
        <p>Team Size: {teamSize ?? 'auto'}</p>
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    value: 10,
    teamSize: 2,
    className: "test",
    defaultRegion: "MIX"
  },

  render: () => <BudgetSelectorWithState />,

  parameters: {
    docs: {
      description: {
        story: 'The default state with no value set. Click the input or calculator icon to set a budget.'
      }
    }
  }
}

export const WithValue: Story = {
  render: () => <BudgetSelectorWithState initialValue={6} />,
  parameters: {
    docs: {
      description: {
        story: 'Pre-populated with 6 person-months of work.'
      }
    }
  }
}

export const EuropeanRegion: Story = {
  render: () => <BudgetSelectorWithState defaultRegion="EU" initialValue={12} />,
  parameters: {
    docs: {
      description: {
        story: 'European region pricing at $7,200/month per person.'
      }
    }
  }
}

export const NorthAmericanRegion: Story = {
  render: () => <BudgetSelectorWithState defaultRegion="NA" initialValue={12} />,
  parameters: {
    docs: {
      description: {
        story: 'North American region pricing at $10,500/month per person.'
      }
    }
  }
}

export const MixedRegion: Story = {
  render: () => <BudgetSelectorWithState defaultRegion="MIX" initialValue={12} />,
  parameters: {
    docs: {
      description: {
        story: 'Mixed team region pricing at $8,500/month per person.'
      }
    }
  }
}

export const SmallProject: Story = {
  render: () => <BudgetSelectorWithState initialValue={1} />,
  parameters: {
    docs: {
      description: {
        story: 'A small project of 1 person-month.'
      }
    }
  }
}

export const LargeProject: Story = {
  render: () => <BudgetSelectorWithState initialValue={36} />,
  parameters: {
    docs: {
      description: {
        story: 'A large project of 36 person-months (3 people for 12 months).'
      }
    }
  }
}

// Controlled story for direct args manipulation
export const Controlled: Story = {
  args: {
    value: 6,
    teamSize: 2,
    defaultRegion: 'EU',
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled version - use the controls panel to adjust props directly. Note: onChange won\'t persist values in this mode.'
      }
    }
  }
}
