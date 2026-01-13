import * as React from "react"
import { BudgetSelectorMatrixCell } from "./BudgetSelectorMatrixCell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BudgetSelectorMatrixProps {
  visibleTeamSizes: number[];
  allTeamSizes: number[];
  MONTHS: number[];
  region: "EU" | "MIX" | "NA";
  selectedTeamSize: number | null;
  selectedMonth: number | null;
  hoveredTeamSize: number | null;
  hoveredMonth: number | null;
  onCellClick: (teamSize: number, month: number) => void;
  onCellMouseEnter: (teamSize: number, month: number) => void;
  onCellMouseLeave: () => void;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const BudgetSelectorMatrixComponent: React.FC<BudgetSelectorMatrixProps> = ({
  visibleTeamSizes,
  allTeamSizes,
  MONTHS,
  region,
  selectedTeamSize,
  selectedMonth,
  hoveredTeamSize,
  hoveredMonth,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
  isExpanded,
  setIsExpanded
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_repeat(12,_minmax(0,_1fr))] gap-1 text-xs text-center items-center bg-background">
        <div className={cn(
          "sticky top-0 z-10 py-2 px-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b border-r"
        )}>Team</div>
        {MONTHS.map((month) => (
          <div key={`header-${month}`} className={cn(
            "sticky top-0 z-10 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-b",
            hoveredMonth === month && hoveredTeamSize !== null && "bg-primary/20 text-primary-foreground rounded-sm"
          )}>
            {month}m
          </div>
        ))}
        {visibleTeamSizes.map((ts) => (
          <React.Fragment key={`row-${ts}`}>
            <div className={cn(
              "sticky left-0 z-10 py-2 h-full flex items-center justify-end text-right pr-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-r",
              hoveredTeamSize === ts && hoveredMonth !== null && "bg-primary/20 text-primary-foreground rounded-sm pl-1"
            )}>
              {ts}
            </div>
            {MONTHS.map((m) => {
              const isSelected = selectedTeamSize === ts && selectedMonth === m
              const isCellDirectlyHovered = hoveredTeamSize === ts && hoveredMonth === m

              let isInHoveredRowSegment = false
              if (hoveredTeamSize === ts && hoveredMonth !== null && !isCellDirectlyHovered && !isSelected) {
                if (m <= hoveredMonth) {
                  isInHoveredRowSegment = true
                }
              }

              let isInHoveredColumnSegment = false
              if (hoveredMonth === m && hoveredTeamSize !== null && !isCellDirectlyHovered && !isSelected) {
                const currentTsIndex = allTeamSizes.indexOf(ts)
                const hoveredTsIndex = allTeamSizes.indexOf(hoveredTeamSize)
                if (currentTsIndex <= hoveredTsIndex) {
                  isInHoveredColumnSegment = true
                }
              }

              return (
                <BudgetSelectorMatrixCell
                  key={`${ts}-${m}`}
                  teamSizeVal={ts}
                  monthVal={m}
                  region={region}
                  isSelected={isSelected}
                  isHoveredCell={isCellDirectlyHovered}
                  isRowHovered={isInHoveredRowSegment}
                  isColumnHovered={isInHoveredColumnSegment}
                  onClick={() => onCellClick(ts, m)}
                  onMouseEnter={() => onCellMouseEnter(ts, m)}
                  onMouseLeave={onCellMouseLeave}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>
      {allTeamSizes.length > 5 && (
        <Button variant="link" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
          {isExpanded ? "Show Less" : "Show More Team Sizes"}
        </Button>
      )}
    </div>
  )
}

export const BudgetSelectorMatrix = React.memo(BudgetSelectorMatrixComponent)
