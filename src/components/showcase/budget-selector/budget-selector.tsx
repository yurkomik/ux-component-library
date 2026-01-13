import * as React from "react"
import { Calculator, GlobeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PackageTiers } from "./package-tiers"
import { BudgetWizard } from "./budget-wizard"
import { BudgetSelectorMatrix } from "./BudgetSelectorMatrix"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BudgetSelectorProps {
  value?: number | null | undefined
  teamSize?: number
  onChange?: (value: number, teamSize?: number) => void
  className?: string
  defaultRegion?: "EU" | "MIX" | "NA"
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const TEAM_SIZES = [0.5, 1, 1.25, 1.5, 2, 3, 4, 5, 6, 7]
const REGION_RATES = {
  EU: 7200,
  MIX: 8500,
  NA: 10500
} as const

export const BudgetSelector = React.memo(function BudgetSelectorComponent({
  value,
  teamSize,
  onChange,
  className,
  defaultRegion = "EU"
}: BudgetSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("matrix")
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [selectedTeamSize, setSelectedTeamSize] = React.useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null)
  const [hoveredTeamSize, setHoveredTeamSize] = React.useState<number | null>(null)
  const [hoveredMonth, setHoveredMonth] = React.useState<number | null>(null)
  const [region, setRegion] = React.useState<keyof typeof REGION_RATES>(defaultRegion)
  const [inputValue, setInputValue] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)

  // Update selected values when value prop changes or dialog opens
  const updateSelectedValues = React.useCallback(() => {
    if (!selectedTeamSize || !selectedMonth) {
      setSelectedTeamSize(null)
      setSelectedMonth(null)
    }
  }, [selectedTeamSize, selectedMonth])

  // Update on value change
  React.useEffect(() => {
    updateSelectedValues()
    // Update input value when external value changes
    if (value !== undefined && value !== null) {
      const formattedValue = value * REGION_RATES[region]
      setInputValue(formattedValue.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }))
    }
  }, [value, updateSelectedValues, region])

  // Handle dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleValueSelect = (newValue: number) => {
    // Reset selection when selecting from other tabs
    setSelectedTeamSize(null)
    setSelectedMonth(null)
    onChange?.(newValue, teamSize)
    setOpen(false)
  }

  const handleMatrixSelect = (teamSize: number, month: number) => {
    // We're selecting team size and duration separately
    const totalDuration = teamSize * month

    setSelectedTeamSize(teamSize)
    setSelectedMonth(month)

    // Pass both the total duration and the team size
    onChange?.(totalDuration, teamSize)
    setOpen(false)
  }

  // Handle direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, commas, dots, and $ character
    const value = e.target.value.replace(/[^0-9.,\$]/g, '')
    setInputValue(value)
  }

  const handleInputBlur = () => {
    // Convert input to a proper value
    try {
      // Remove $ and commas
      const cleanValue = inputValue.replace(/[$,]/g, '')
      // Parse as number
      const numValue = parseFloat(cleanValue)

      if (!isNaN(numValue)) {
        // Convert from $ amount to m/m (months * teamSize)
        const monthsTeamSize = numValue / REGION_RATES[region]
        onChange?.(monthsTeamSize, teamSize)
      }
    } catch (e) {
      console.error("Failed to parse budget input", e)
    }
    setIsEditing(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // Trigger the blur event to save
    }
  }

  const visibleTeamSizes = isExpanded ? TEAM_SIZES : TEAM_SIZES.slice(0, 5)

  // Format value display - show hours for < 1 month, otherwise show monetary value
  const displayValue = React.useMemo(() => {
    if (!value || value === 0) return 'Set budget'
    const monetaryValue = value * REGION_RATES[region]
    return `$${monetaryValue.toLocaleString()}`
  }, [value, region])

  // Format value label to show value with one decimal point
  const labelValue = React.useMemo(() => {
    if (!value || value === 0) return ''

    if (value < 1) {
      const hours = Math.round(value * 160)
      return `${hours} hours`
    }

    if (teamSize && teamSize > 0) {
      const actualDuration = value / teamSize
      const formattedDuration = actualDuration % 1 === 0
        ? Math.floor(actualDuration).toString()
        : actualDuration.toFixed(1)
      return `${teamSize} ${teamSize === 1 ? 'person' : 'people'} | ${formattedDuration} month${actualDuration !== 1 ? 's' : ''}`
    }

    // Fallback if no teamSize prop provided but value >= 1 person-month
    // Interpret total person-months as 1 person for X months, or X people for Y months.
    // Prioritize simpler representation (e.g., 1 person for N months if N <= 12)
    let months = value
    let people = 1

    if (months > 12) {
        people = Math.ceil(months / 12)
        months = value / people
    }

    const formattedMonths = months % 1 === 0
      ? Math.floor(months).toString()
      : months.toFixed(1)

    if (people === 1) {
      return `${people} person | ${formattedMonths} month${months !== 1 ? 's' : ''}`
    } else {
      return `${people} people | ${formattedMonths} month${months !== 1 ? 's' : ''}`
    }
  }, [value, teamSize])

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {value && value > 0 && (
        <div className="text-sm font-medium mb-0.5">
          <span>Value ({labelValue})</span>
        </div>
      )}

      {isEditing ? (
        <div className="flex items-center">
          <span className="text-sm mr-1">$</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="text-lg font-semibold tracking-tight bg-transparent border-none p-0 outline-none focus:ring-0 w-full"
            autoFocus
          />
        </div>
      ) : (
        <div className={cn(
          "flex items-center gap-2 group",
          !value && "hover:bg-accent/50 hover:border-input border border-transparent rounded-md px-2 py-1 -mx-2 -my-1 transition-all duration-200"
        )}>
          <div
            className={cn(
              "text-lg font-semibold tracking-tight cursor-pointer",
              !value && "text-muted-foreground group-hover:text-foreground transition-colors duration-200"
            )}
            onClick={() => setIsEditing(true)}
          >
            {displayValue}
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 shrink-0 hover:bg-primary/10 hover:text-foreground active:bg-primary/20 transition-all duration-200",
                  !value && "opacity-0 group-hover:opacity-100"
                )}
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[900px] w-[900px] z-[11000] max-h-[90vh] overflow-auto"
            >
              <DialogTitle className="sr-only">Budget Calculator</DialogTitle>
              <div className="flex gap-6 h-full">
                <div className="shrink-0">
                  <RadioGroup
                    value={region}
                    onValueChange={(value) => setRegion(value as keyof typeof REGION_RATES)}
                    className="flex flex-col gap-3 min-w-[120px] p-4 rounded-lg border bg-muted/50"
                  >
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium">Region</h4>
                      <p className="text-xs text-muted-foreground">Select team location</p>
                    </div>
                    <RadioGroupItem
                      value="EU"
                      id="eu"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="eu"
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4",
                        "hover:bg-accent hover:text-accent-foreground",
                        "transition-all duration-200",
                        region === "EU" && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Europe</span>
                          <span className="text-xs text-muted-foreground">${REGION_RATES.EU.toLocaleString()}/m</span>
                        </div>
                      </div>
                    </label>
                    <RadioGroupItem
                      value="MIX"
                      id="mix"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="mix"
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4",
                        "hover:bg-accent hover:text-accent-foreground",
                        "transition-all duration-200",
                        region === "MIX" && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Mixed</span>
                          <span className="text-xs text-muted-foreground">${REGION_RATES.MIX.toLocaleString()}/m</span>
                        </div>
                      </div>
                    </label>
                    <RadioGroupItem
                      value="NA"
                      id="na"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="na"
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4",
                        "hover:bg-accent hover:text-accent-foreground",
                        "transition-all duration-200",
                        region === "NA" && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">North America</span>
                          <span className="text-xs text-muted-foreground">${REGION_RATES.NA.toLocaleString()}/m</span>
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <div className="flex-1 flex flex-col">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger value="matrix" className="text-sm">Quick Range Matrix</TabsTrigger>
                      <TabsTrigger value="packages" className="text-sm">Package Tiers</TabsTrigger>
                      <TabsTrigger value="wizard" className="text-sm">Budget Wizard</TabsTrigger>
                    </TabsList>

                    <div className="h-[30rem] overflow-y-auto mt-4">
                      <TabsContent value="matrix" className="">
                        <BudgetSelectorMatrix
                          visibleTeamSizes={visibleTeamSizes}
                          allTeamSizes={TEAM_SIZES}
                          MONTHS={MONTHS}
                          region={region}
                          selectedTeamSize={selectedTeamSize}
                          selectedMonth={selectedMonth}
                          hoveredTeamSize={hoveredTeamSize}
                          hoveredMonth={hoveredMonth}
                          onCellClick={handleMatrixSelect}
                          onCellMouseEnter={(ts, m) => { setHoveredTeamSize(ts); setHoveredMonth(m) }}
                          onCellMouseLeave={() => { setHoveredTeamSize(null); setHoveredMonth(null) }}
                          isExpanded={isExpanded}
                          setIsExpanded={setIsExpanded}
                        />
                      </TabsContent>

                      <TabsContent value="packages" className="data-[state=active]:h-[calc(100%-0.5rem)]">
                        <PackageTiers onSelect={handleValueSelect} ratePerMonth={REGION_RATES[region]} />
                      </TabsContent>

                      <TabsContent value="wizard" className="data-[state=active]:h-[calc(100%-0.5rem)]">
                        <BudgetWizard onSelect={handleValueSelect} ratePerMonth={REGION_RATES[region]} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
})
