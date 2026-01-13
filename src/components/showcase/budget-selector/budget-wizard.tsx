import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface BudgetWizardProps {
  onSelect: (value: number) => void
  ratePerMonth?: number
}

const PROJECT_TYPES = [
  {
    id: "new",
    name: "New Development",
    description: "Building a new product from scratch",
    multiplier: 1.2
  },
  {
    id: "enhancement",
    name: "System Enhancement",
    description: "Adding features to existing system",
    multiplier: 1.0
  },
  {
    id: "audit",
    name: "Technical Audit",
    description: "Code review and architecture assessment",
    multiplier: 0.8
  },
  {
    id: "maintenance",
    name: "Maintenance & Support",
    description: "Ongoing system maintenance",
    multiplier: 0.9
  }
]

const TEAM_ROLES = [
  {
    id: "frontend",
    label: "Frontend Developer",
    description: "UI/UX implementation"
  },
  {
    id: "backend",
    label: "Backend Developer",
    description: "API and business logic"
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    description: "Infrastructure and deployment"
  },
  {
    id: "designer",
    label: "UI/UX Designer",
    description: "User interface design"
  },
  {
    id: "pm",
    label: "Project Manager",
    description: "Project coordination"
  }
]

const TIMELINES = [
  {
    id: "urgent",
    name: "Urgent",
    duration: { min: 1, max: 2 },
    multiplier: 1.5
  },
  {
    id: "standard",
    name: "Standard",
    duration: { min: 3, max: 6 },
    multiplier: 1.0
  },
  {
    id: "extended",
    name: "Extended",
    duration: { min: 6, max: 12 },
    multiplier: 0.9
  }
]

const COMPLEXITY_FACTORS = [
  {
    id: "stack",
    label: "Complex Technology Stack",
    multiplier: 1.2
  },
  {
    id: "integration",
    label: "Multiple System Integrations",
    multiplier: 1.15
  },
  {
    id: "security",
    label: "High Security Requirements",
    multiplier: 1.25
  },
  {
    id: "performance",
    label: "High Performance Requirements",
    multiplier: 1.2
  }
]

export const BudgetWizard = React.memo(function BudgetWizardComponent({ onSelect, ratePerMonth = 10000 }: BudgetWizardProps) {
  const [step, setStep] = React.useState(1)
  const [projectType, setProjectType] = React.useState<string>("")
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([])
  const [timeline, setTimeline] = React.useState<string>("")
  const [complexityFactors, setComplexityFactors] = React.useState<string[]>([])

  const calculateBudget = () => {
    const projectMultiplier = PROJECT_TYPES.find((t) => t.id === projectType)?.multiplier || 1
    const timelineData = TIMELINES.find((t) => t.id === timeline)
    const timelineMultiplier = timelineData?.multiplier || 1
    const duration = timelineData?.duration.min || 3

    const complexityMultiplier =
      complexityFactors.reduce((acc, factor) => {
        const factorData = COMPLEXITY_FACTORS.find((f) => f.id === factor)
        return acc * (factorData?.multiplier || 1)
      }, 1)

    const teamSize = selectedRoles.length
    return Math.round(teamSize * duration * ratePerMonth * projectMultiplier * timelineMultiplier * complexityMultiplier)
  }

  const calculateTotalMonths = () => {
    const timelineData = TIMELINES.find((t) => t.id === timeline)
    return selectedRoles.length * (timelineData?.duration.min || 3)
  }

  const formatBudgetDisplay = () => {
    const budget = calculateBudget()
    const totalMonths = calculateTotalMonths()

    if (totalMonths < 1) {
      const hours = Math.round(totalMonths * 160)
      const hourlyRate = ratePerMonth / 160
      return `$${budget.toLocaleString()} (${hours} hours, $${hourlyRate.toFixed(0)}/h)`
    }

    return `$${budget.toLocaleString()}`
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else {
      const timelineData = TIMELINES.find((t) => t.id === timeline)
      if (timelineData) {
        onSelect(selectedRoles.length * timelineData.duration.min)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!projectType
      case 2:
        return selectedRoles.length > 0
      case 3:
        return !!timeline
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="space-y-4 h-full">
      <div className="flex justify-between text-sm">
        <span>Step {step} of 4</span>
        {step === 4 && <span className="font-medium">Estimated Budget: {formatBudgetDisplay()}</span>}
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Project Type</CardTitle>
              <CardDescription>Select the type of project you&apos;re planning</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={projectType} onValueChange={setProjectType}>
                <div className="grid gap-4">
                  {PROJECT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="flex flex-col">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-sm text-muted-foreground">{type.description}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
              <CardDescription>Select the roles needed for your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {TEAM_ROLES.map((role) => (
                  <div key={role.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRoles([...selectedRoles, role.id])
                        } else {
                          setSelectedRoles(selectedRoles.filter((id) => id !== role.id))
                        }
                      }}
                    />
                    <Label htmlFor={role.id} className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-sm text-muted-foreground">{role.description}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Select your expected project duration</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={timeline} onValueChange={setTimeline}>
                <div className="grid gap-4">
                  {TIMELINES.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {option.duration.min}-{option.duration.max} months
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Additional Factors</CardTitle>
              <CardDescription>Select any additional complexity factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {COMPLEXITY_FACTORS.map((factor) => (
                  <div key={factor.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={factor.id}
                      checked={complexityFactors.includes(factor.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setComplexityFactors([...complexityFactors, factor.id])
                        } else {
                          setComplexityFactors(complexityFactors.filter((id) => id !== factor.id))
                        }
                      }}
                    />
                    <Label htmlFor={factor.id} className="font-medium">
                      {factor.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isStepValid()}>
          {step === 4 ? "Complete" : "Next"}
          {step < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
})
