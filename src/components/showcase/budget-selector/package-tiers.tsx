import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CheckCircle2 } from "lucide-react"

interface PackageTiersProps {
  onSelect: (value: number) => void
  ratePerMonth?: number
}

const PACKAGES = [
  {
    id: "audit",
    name: "Technical Audit",
    description: "Comprehensive code review and architecture assessment",
    teamSize: 1,
    duration: 1,
    features: [
      "Code quality assessment",
      "Architecture review",
      "Recommendations report"
    ]
  },
  {
    id: "mvp",
    name: "MVP Development",
    description: "Rapid development of minimum viable product",
    teamSize: 2,
    duration: 3,
    features: [
      "Core feature development",
      "Basic UI/UX design",
      "Essential integrations"
    ]
  }
]

export const PackageTiers = React.memo(function PackageTiersComponent({ onSelect, ratePerMonth = 10000 }: PackageTiersProps) {
  const calculateBudget = (teamSize: number, duration: number) => {
    return teamSize * duration * ratePerMonth
  }

  const formatBudget = (teamSize: number, duration: number) => {
    const monthValue = teamSize * duration
    const budget = calculateBudget(teamSize, duration)

    if (monthValue < 1) {
      const hours = Math.round(monthValue * 160)
      const hourlyRate = ratePerMonth / 160
      return (
        <>
          ${budget.toLocaleString()}
          <div className="text-sm text-muted-foreground">
            {hours} hours (${hourlyRate.toFixed(0)}/h)
          </div>
        </>
      )
    }

    return `$${budget.toLocaleString()}`
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {PACKAGES.map((pkg) => {
        return (
          <Card key={pkg.id} className="relative">
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.teamSize} team members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{pkg.duration} months</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Deliverables</h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Budget</h4>
                <p className="text-xl font-bold">
                  {formatBudget(pkg.teamSize, pkg.duration)}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => onSelect(pkg.teamSize * pkg.duration)}
              >
                Select Package
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})
