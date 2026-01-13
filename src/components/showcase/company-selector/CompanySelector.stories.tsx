import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CompanySelector } from './CompanySelector'
import type { Company } from './CompanySelector'

// Mock company data for stories
const mockCompanies: Company[] = [
  {
    _id: '1',
    name: 'Acme Corporation',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '1000-5000',
    location: 'San Francisco, CA'
  },
  {
    _id: '2',
    name: 'TechStart Inc',
    website: 'https://techstart.io',
    industry: 'SaaS',
    size: '50-200',
    location: 'Austin, TX'
  },
  {
    _id: '3',
    name: 'Global Innovations Ltd',
    website: 'https://global-innovations.com',
    industry: 'Consulting',
    size: '200-500',
    location: 'New York, NY'
  },
  {
    _id: '4',
    name: 'Design Studio Pro',
    website: 'https://designstudiopro.co',
    industry: 'Design Agency',
    size: '10-50',
    location: 'Los Angeles, CA'
  },
  {
    _id: '5',
    name: 'FinanceForward',
    website: 'https://financeforward.com',
    industry: 'Financial Services',
    size: '500-1000',
    location: 'Chicago, IL'
  },
  {
    _id: '6',
    name: 'HealthTech Solutions',
    website: 'https://healthtech.io',
    industry: 'Healthcare',
    size: '100-200',
    location: 'Boston, MA'
  },
  {
    _id: '7',
    name: 'EcoSmart Industries',
    website: 'https://ecosmart.com',
    industry: 'Green Technology',
    size: '50-100',
    location: 'Portland, OR'
  },
  {
    _id: '8',
    name: 'MediaMax Group',
    website: 'https://mediamax.com',
    industry: 'Media & Entertainment',
    size: '200-500',
    location: 'Miami, FL'
  }
]

const meta = {
  title: 'Showcase/CompanySelector',
  component: CompanySelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Company Selector

A searchable dropdown component for selecting companies from a list.

## Features

- **Search Filtering**: Real-time search across company name, industry, and location
- **Clear Selection**: Option to clear the current selection
- **Create New**: Optional "Create new company" action
- **Loading State**: Visual feedback during data loading
- **Disabled State**: Prevents interaction when needed
- **Industry Display**: Shows company industry as secondary text

## Use Cases

- Associating contacts with companies
- Setting company for opportunities/deals
- Filtering reports by company
- Quick company lookup in forms
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the selector'
    },
    showCreateOption: {
      control: 'boolean',
      description: 'Show "Create new company" option'
    },
    startOpen: {
      control: 'boolean',
      description: 'Start with dropdown open'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no selection'
    }
  },
  decorators: [
    (Story) => (
      <div className="w-[350px] p-6 border rounded-lg bg-background">
        <Story />
      </div>
    )
  ]
} as Meta<typeof CompanySelector>

export default meta
type Story = StoryObj<typeof CompanySelector>

// Interactive story with state
const CompanySelectorWithState = (props: Record<string, unknown> & { initialValue?: string | null }) => {
  const [selectedId, setSelectedId] = useState<string | null>(props.initialValue ?? null)

  const handleChange = (company: Company | null) => {
    setSelectedId(company?._id ?? null)
  }

  return (
    <div className="space-y-4">
      <CompanySelector
        companies={mockCompanies}
        value={selectedId}
        onChange={handleChange}
        {...props}
      />
      <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
        <p><strong>Debug Info:</strong></p>
        <p>Selected ID: {selectedId ?? 'none'}</p>
        <p>Selected Name: {selectedId ? mockCompanies.find(c => c._id === selectedId)?.name : 'none'}</p>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <CompanySelectorWithState />,
  parameters: {
    docs: {
      description: {
        story: 'Default state with no selection. Click to open the dropdown and search for companies.'
      }
    }
  }
}

export const WithSelection: Story = {
  render: () => <CompanySelectorWithState initialValue="1" />,
  parameters: {
    docs: {
      description: {
        story: 'Pre-selected company (Acme Corporation).'
      }
    }
  }
}

export const WithCreateOption: Story = {
  render: () => (
    <CompanySelectorWithState
      showCreateOption={true}
      onCreateNew={() => alert('Create new company clicked!')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows a "Create new company" option at the bottom of the list.'
      }
    }
  }
}

export const Loading: Story = {
  render: () => (
    <CompanySelector
      companies={[]}
      value={null}
      onChange={() => {}}
      isLoading={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state - button is disabled and shows loading indicator in dropdown.'
      }
    }
  }
}

export const Disabled: Story = {
  render: () => (
    <CompanySelector
      companies={mockCompanies}
      value="2"
      onChange={() => {}}
      disabled={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled state with a pre-selected company that cannot be changed.'
      }
    }
  }
}

export const StartOpen: Story = {
  render: () => <CompanySelectorWithState startOpen={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Starts with the dropdown already open - useful for focus on mount.'
      }
    }
  }
}

export const CustomPlaceholder: Story = {
  render: () => (
    <CompanySelectorWithState
      placeholder="Choose a client company..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom placeholder text for different contexts.'
      }
    }
  }
}

export const SmallList: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const smallCompanyList = mockCompanies.slice(0, 3)

    return (
      <CompanySelector
        companies={smallCompanyList}
        value={selectedId}
        onChange={(company) => setSelectedId(company?._id ?? null)}
        placeholder="Select from 3 companies..."
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Works well with small company lists too.'
      }
    }
  }
}

export const WithVisibilityCallback: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="space-y-4">
        <CompanySelector
          companies={mockCompanies}
          value={selectedId}
          onChange={(company) => setSelectedId(company?._id ?? null)}
          onVisibilityChange={setIsOpen}
        />
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>Dropdown is: <strong>{isOpen ? 'Open' : 'Closed'}</strong></p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the onVisibilityChange callback for tracking dropdown state.'
      }
    }
  }
}
