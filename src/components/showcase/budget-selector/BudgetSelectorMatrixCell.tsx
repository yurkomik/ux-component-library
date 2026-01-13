import * as React from "react"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

const REGION_RATES = {
  EU: 7200,
  MIX: 8500,
  NA: 10500
} as const

interface BudgetSelectorMatrixCellProps {
  teamSizeVal: number;
  monthVal: number;
  region: keyof typeof REGION_RATES;
  isSelected: boolean;
  isHoveredCell: boolean;
  isRowHovered: boolean;
  isColumnHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const BudgetSelectorMatrixCellComponent: React.FC<BudgetSelectorMatrixCellProps> = ({
  teamSizeVal,
  monthVal,
  region,
  isSelected,
  isHoveredCell,
  isRowHovered,
  isColumnHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {

  const budget = React.useMemo(() => {
    return teamSizeVal * monthVal * REGION_RATES[region]
  }, [teamSizeVal, monthVal, region])

  const cellStyleClasses = React.useMemo(() => {
    if (isSelected) {
      return "bg-primary text-primary-foreground relative after:absolute after:inset-0 after:animate-pulse after:bg-primary/20"
    }
    if (isHoveredCell) {
      return "bg-primary/20 hover:bg-primary/25 text-foreground transition-all duration-100 ring-1 ring-primary/50"
    }
    if (isRowHovered || isColumnHovered) {
      return "bg-primary/10 hover:bg-primary/15 transition-all duration-150"
    }
    return "hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-150"
  }, [isSelected, isHoveredCell, isRowHovered, isColumnHovered])

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={cn(
            "p-2 rounded text-center tabular-nums flex items-center justify-center",
            cellStyleClasses
          )}
          aria-label={`Select ${teamSizeVal} ${teamSizeVal === 1 ? "person" : "people"} for ${monthVal} ${monthVal === 1 ? "month" : "months"}`}
        >
          {budget > 0 ? `${(budget / 1000).toFixed(0)}` : '-'}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto text-xs p-2" side="top">
        {teamSizeVal} {teamSizeVal === 1 ? "person" : "people"} for {monthVal} {monthVal === 1 ? "month" : "months"} = ${budget.toLocaleString()}
      </HoverCardContent>
    </HoverCard>
  )
}

export const BudgetSelectorMatrixCell = React.memo(BudgetSelectorMatrixCellComponent)
