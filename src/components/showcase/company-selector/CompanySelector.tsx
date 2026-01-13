import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

export interface Company {
  _id: string
  name: string
  website?: string
  industry?: string
  size?: string
  location?: string
}

interface CompanySelectorProps {
  value?: string | null
  onChange: (company: Company | null) => void
  triggerClassName?: string
  companies: Company[]
  isLoading?: boolean
  startOpen?: boolean
  onVisibilityChange?: (isOpen: boolean) => void
  disabled?: boolean
  onCreateNew?: () => void
  showCreateOption?: boolean
  placeholder?: string
}

export function CompanySelector({
  value,
  onChange,
  triggerClassName,
  companies,
  isLoading = false,
  startOpen = false,
  onVisibilityChange,
  disabled,
  onCreateNew,
  showCreateOption,
  placeholder = "Select company..."
}: CompanySelectorProps) {
  const [open, setOpen] = useState(startOpen)
  const [companySearchText, setCompanySearchText] = useState("")

  const selectedCompany = value ? companies.find(company => company._id === value) : null

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearchText.toLowerCase()) ||
    company.industry?.toLowerCase().includes(companySearchText.toLowerCase()) ||
    company.location?.toLowerCase().includes(companySearchText.toLowerCase())
  )

  const getCompanyDisplayName = (company: Company | null | undefined) => {
    if (!company) return placeholder
    return company.name || 'Unnamed Company'
  }

  useEffect(() => {
    setOpen(startOpen)
  }, [startOpen])

  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState)
    if (onVisibilityChange) {
      onVisibilityChange(newOpenState)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between cursor-pointer w-full', triggerClassName)}
          disabled={isLoading || disabled}
        >
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className={cn("truncate", !selectedCompany && "text-muted-foreground")}>
              {getCompanyDisplayName(selectedCompany)}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search company..."
            value={companySearchText}
            onValueChange={setCompanySearchText}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : (companySearchText ? 'No company found.' : 'Type to search...')}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                  setCompanySearchText("")
                }}
                className="justify-between"
              >
                <span className="text-muted-foreground">No company</span>
                <Check
                  className={cn(
                    'ml-2 h-4 w-4',
                    value === null ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company._id}
                  onSelect={() => {
                    onChange(company)
                    setOpen(false)
                    setCompanySearchText("")
                  }}
                  className="justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{getCompanyDisplayName(company)}</span>
                    {company.industry && (
                      <span className="text-xs text-muted-foreground">{company.industry}</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value === company._id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
              {showCreateOption && onCreateNew && (
                <CommandItem
                  onSelect={() => {
                    onCreateNew()
                    setOpen(false)
                    setCompanySearchText("")
                  }}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new company
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
