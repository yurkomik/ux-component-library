"use client"

import { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from "react"
import type { KeyboardEvent } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, ChevronDown, ChevronLeft, ChevronRight, Users, Plus, X, Loader2, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// CONSTANTS
// ============================================================================

const SM_BREAKPOINT_PX = 640

/** Delay before closing popover after selection (allows animation to complete) */
const POPOVER_CLOSE_DELAY_MS = 0

/** Delay before restoring focus to trigger after popover closes */
const FOCUS_RESTORATION_DELAY_MS = 10

// ============================================================================
// UTILITY FUNCTIONS (Pure, outside component to avoid recreation)
// ============================================================================

/**
 * Formats a team member's display name, optionally in compact form.
 * @param name - The name object containing givenName, familyName, and fullName
 * @param compact - If true, returns "FirstName L." format
 * @returns Formatted display name string
 */
function formatDisplayName(
  name: { givenName?: string; familyName?: string; fullName: string },
  compact: boolean
): string {
  if (!compact) return name.fullName
  if (!name.givenName) return name.fullName
  return name.familyName
    ? `${name.givenName} ${name.familyName[0]}.`
    : name.givenName
}

// ============================================================================
// HOOKS
// ============================================================================

function useIsSmUp() {
  const query = `(min-width: ${SM_BREAKPOINT_PX}px)`

  // DecisionRationale: Next.js App Router SSR cannot know the client viewport size.
  // `useSyncExternalStore` + `getServerSnapshot` guarantees SSR markup matches the
  // initial client render (avoids hydration mismatch), then updates after hydration.
  const getServerSnapshot = () => true

  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {}
      const mql = window.matchMedia(query)
      const handler = () => onStoreChange()

      // PerformanceConsideration: prefer modern listeners, but keep a fallback for older browsers.
      if ("addEventListener" in mql) {
        mql.addEventListener("change", handler)
        return () => mql.removeEventListener("change", handler)
      }

      // @ts-expect-error - deprecated, but still present in some environments
      mql.addListener(handler)
      // @ts-expect-error - deprecated, but still present in some environments
      return () => mql.removeListener(handler)
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : getServerSnapshot()),
    getServerSnapshot
  )
}

export interface TeamMember {
  _id: string
  name: {
    givenName?: string
    familyName?: string
    fullName: string
  }
  primaryEmail: string
  photoUrl?: string
  role?: string
  orgTitle?: string
  orgDepartment?: string
  isManager?: boolean
  directReports?: string[]
  reportsTo?: string
}

type BadgeAvatarSize = "sm" | "md" | "lg" | "xl"

interface TeamMemberSelectorProps {
  selectedIds?: string[]
  onSelectionChange: (selectedIds: string[]) => void
  placeholder?: string
  maxSelected?: number
  disabled?: boolean
  allowDepartmentFilter?: boolean
  allowRoleFilter?: boolean
  variant?: "single" | "multiple"
  className?: string
  teamMembers: TeamMember[]
  departments?: string[]
  roles?: string[]
  triggerMode?: "default" | "icon"
  hideSelectedBadges?: boolean
  contentOnly?: boolean
  defaultDepartment?: string
  allowClear?: boolean
  enableKeyboardNavigation?: boolean
  sortMode?: "none" | "alphabetical" | "management"
  currentUserId?: string
  showNavigationArrows?: boolean
  compactName?: boolean
  showAvatarStack?: boolean
  onFiltersChange?: (filters: { department: string; role: string; search: string }) => void
  /** Size of avatars in badges and list. Options: sm (20px), md (24px), lg (28px, default), xl (32px) */
  badgeAvatarSize?: BadgeAvatarSize
  /** Shows loading skeleton in dropdown when true */
  isLoading?: boolean
  /** Message shown during loading state */
  loadingMessage?: string
  /** Error message to display in dropdown (takes precedence over loading) */
  error?: string | null
  /** Callback when user clicks retry button (only shown if error and onRetry are both set) */
  onRetry?: () => void
  /** Message shown when teamMembers array is empty */
  emptyMessage?: string
  /** Message shown when search/filter returns no results */
  emptySearchMessage?: string
}

// Avatar styling configurations for different sizes
// Concentric alignment formula: left_padding = vertical_padding_per_side
// Target ratio: badge_height / avatar_height ≈ 1.20-1.30
const avatarSizeStyles: Record<BadgeAvatarSize, {
  // Badge/chip avatar
  badge: string
  badgeContainer: string
  badgeFallback: string
  badgeXMargin: string
  // Dropdown list avatar
  list: string
  listFallback: string
  // Avatar stack (standalone avatars)
  stack: string
  stackMinHeight: string
}> = {
  sm: {
    badge: "h-5 w-5",           // 20px avatar → 24px badge (1.20 ratio)
    badgeContainer: "gap-1.5 py-0.5 pl-0.5 pr-1.5",
    badgeFallback: "text-[10px]",
    badgeXMargin: "ml-0.5",
    list: "h-5 w-5",            // 20px
    listFallback: "text-[10px]",
    stack: "h-5 w-5",           // 20px
    stackMinHeight: "min-h-[28px]"
  },
  md: {
    badge: "h-6 w-6",           // 24px avatar → 28px badge (1.17 ratio)
    badgeContainer: "gap-1.5 py-0.5 pl-0.5 pr-1.5",
    badgeFallback: "text-xs",
    badgeXMargin: "ml-0.5",
    list: "h-6 w-6",            // 24px
    listFallback: "text-xs",
    stack: "h-6 w-6",           // 24px
    stackMinHeight: "min-h-[32px]"
  },
  lg: {
    badge: "h-7 w-7",           // 28px avatar → 36px badge (1.29 ratio)
    badgeContainer: "gap-2 py-1 pl-1 pr-2",
    badgeFallback: "text-xs",
    badgeXMargin: "ml-0.5",
    list: "h-8 w-8",            // 32px
    listFallback: "text-sm",
    stack: "h-7 w-7",           // 28px
    stackMinHeight: "min-h-[36px]"
  },
  xl: {
    badge: "h-8 w-8",           // 32px avatar → 44px badge (1.375 ratio)
    badgeContainer: "gap-2 py-1.5 pl-1.5 pr-2.5",
    badgeFallback: "text-sm",
    badgeXMargin: "ml-1",
    list: "h-10 w-10",          // 40px
    listFallback: "text-base",
    stack: "h-8 w-8",           // 32px
    stackMinHeight: "min-h-[40px]"
  }
}

export function TeamMemberSelector({
  selectedIds = [],
  onSelectionChange,
  placeholder = "Select team members...",
  maxSelected,
  disabled = false,
  allowDepartmentFilter = false,
  allowRoleFilter = false,
  variant = "multiple",
  className,
  teamMembers,
  departments = [],
  roles = [],
  triggerMode = "default",
  hideSelectedBadges = false,
  contentOnly = false,
  defaultDepartment,
  allowClear = true,
  enableKeyboardNavigation = false,
  sortMode = "none",
  currentUserId,
  showNavigationArrows = false,
  compactName,
  showAvatarStack = false,
  onFiltersChange,
  badgeAvatarSize = "lg",
  isLoading = false,
  loadingMessage = "Loading team members...",
  error = null,
  onRetry,
  emptyMessage = "No team members available",
  emptySearchMessage = "No results found"
}: TeamMemberSelectorProps) {
  const sizeStyle = avatarSizeStyles[badgeAvatarSize]
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState(() => defaultDepartment ?? "")
  const [roleFilter, setRoleFilter] = useState("")
  const [userHasClosed, setUserHasClosed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const hasUserSetDepartmentFilterRef = useRef(false)
  const lastAppliedDefaultDepartmentRef = useRef(defaultDepartment)
  const onFiltersChangeRef = useRef(onFiltersChange)
  const lastEmittedFiltersRef = useRef<{
    department: string
    role: string
    search: string
  } | null>(null)
  const isSmUp = useIsSmUp()

  // Keep the latest onFiltersChange without making the reporting effect depend on its identity.
  // This avoids parent re-render loops when an inline callback is passed.
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  // Apply defaultDepartment on mount and when it becomes available later, but never override
  // an explicit user choice (including "clearing" back to All Departments).
  useEffect(() => {
    if (!defaultDepartment) return
    if (hasUserSetDepartmentFilterRef.current) return

    // If the department dropdown is visible and we already know the set of departments,
    // only apply a default that exists in the options to avoid a controlled <select> mismatch.
    if (allowDepartmentFilter && departments.length > 0 && !departments.includes(defaultDepartment)) {
      return
    }

    const lastApplied = lastAppliedDefaultDepartmentRef.current
    const canOverride =
      departmentFilter === "" || (lastApplied !== undefined && departmentFilter === lastApplied)

    if (!canOverride) return
    if (departmentFilter === defaultDepartment) return

    lastAppliedDefaultDepartmentRef.current = defaultDepartment
    setDepartmentFilter(defaultDepartment)
  }, [defaultDepartment, departmentFilter, allowDepartmentFilter, departments])

  // If the user can change department and the option set changes, ensure the current selection stays valid.
  useEffect(() => {
    if (!allowDepartmentFilter) return
    if (!departmentFilter) return
    if (departments.length === 0) return
    if (departments.includes(departmentFilter)) return
    setDepartmentFilter("")
  }, [allowDepartmentFilter, departments, departmentFilter])

  // Report filter changes to parent (stable + StrictMode-resilient)
  useEffect(() => {
    const nextFilters = {
      department: departmentFilter,
      role: roleFilter,
      search: searchTerm
    }

    const prev = lastEmittedFiltersRef.current
    if (
      prev &&
      prev.department === nextFilters.department &&
      prev.role === nextFilters.role &&
      prev.search === nextFilters.search
    ) {
      return
    }

    lastEmittedFiltersRef.current = nextFilters
    onFiltersChangeRef.current?.(nextFilters)
  }, [departmentFilter, roleFilter, searchTerm])

  // Sort team members based on sortMode
  const sortedMembers = useMemo(() => {
    if (!teamMembers) return []

    if (sortMode === "none" || !sortMode) {
      return teamMembers
    }

    if (sortMode === "alphabetical") {
      return [...teamMembers].sort((a, b) =>
        a.name.fullName.localeCompare(b.name.fullName)
      )
    }

    if (sortMode === "management" && currentUserId) {
      const currentUser = teamMembers.find((m) => m._id === currentUserId)
      if (!currentUser) return teamMembers

      const myDirectReportIds = new Set(currentUser.directReports || [])
      const myManager = teamMembers.find((m) => m._id === currentUser.reportsTo)
      const siblingIds = new Set(myManager?.directReports || [])

      return [...teamMembers].sort((a, b) => {
        if (a._id === currentUserId) return -1
        if (b._id === currentUserId) return 1

        const aIsReport = myDirectReportIds.has(a._id)
        const bIsReport = myDirectReportIds.has(b._id)
        if (aIsReport && !bIsReport) return -1
        if (!aIsReport && bIsReport) return 1

        const aIsSibling = siblingIds.has(a._id)
        const bIsSibling = siblingIds.has(b._id)
        if (aIsSibling && !bIsSibling) return -1
        if (!aIsSibling && bIsSibling) return 1

        return a.name.fullName.localeCompare(b.name.fullName)
      })
    }

    return teamMembers
  }, [teamMembers, sortMode, currentUserId])

  // Filter team members based on search and user-interactive filters only
  // Note: Business logic filtering (e.g., "exclude managers") should be done
  // by the parent before passing teamMembers - not in this component
  const filteredMembers = useMemo(() => {
    if (!sortedMembers) return []

    const searchLower = searchTerm.toLowerCase()

    return sortedMembers.filter((member) => {
      const matchesSearch = !searchTerm ||
        member.name.fullName.toLowerCase().includes(searchLower) ||
        member.primaryEmail.toLowerCase().includes(searchLower) ||
        (member.role && member.role.toLowerCase().includes(searchLower)) ||
        (member.orgTitle && member.orgTitle.toLowerCase().includes(searchLower))

      const matchesDepartment = !departmentFilter || member.orgDepartment === departmentFilter
      const matchesRole = !roleFilter || member.role === roleFilter

      return matchesSearch && matchesDepartment && matchesRole
    })
  }, [sortedMembers, searchTerm, departmentFilter, roleFilter])

  // Compute available roles based on selected department (cascading filter)
  const availableRoles = useMemo(() => {
    if (!departmentFilter) {
      return roles // Show all roles if no department selected
    }
    // Get unique roles from members in the selected department
    const rolesInDepartment = new Set(
      teamMembers
        ?.filter((m) => m.orgDepartment === departmentFilter && m.role)
        .map((m) => m.role)
    )
    return roles.filter((role) => rolesInDepartment.has(role))
  }, [departmentFilter, teamMembers, roles])

  // Clear role filter when department changes and role is no longer available
  useEffect(() => {
    if (roleFilter && !availableRoles.includes(roleFilter)) {
      setRoleFilter("")
    }
  }, [availableRoles, roleFilter])

  // Memoize selected members lookup for performance
  const selectedMembers = useMemo(() => {
    if (!teamMembers) return []
    const selectedSet = new Set(selectedIds)
    return teamMembers.filter((member) => selectedSet.has(member._id))
  }, [teamMembers, selectedIds])

  // ============================================================================
  // EVENT HANDLERS (wrapped in useCallback for stable references)
  // ============================================================================

  const handleToggleMember = useCallback((memberId: string) => {
    if (disabled) return
    if (variant === "single") {
      if (selectedIds.includes(memberId)) {
        if (!allowClear) return
        onSelectionChange([])
      } else {
        onSelectionChange([memberId])
      }
      setTimeout(() => setOpen(false), POPOVER_CLOSE_DELAY_MS)
      setUserHasClosed(true)
      setTimeout(() => triggerRef.current?.focus(), FOCUS_RESTORATION_DELAY_MS)
    } else {
      const newSelection = selectedIds.includes(memberId)
        ? selectedIds.filter(id => id !== memberId)
        : [...selectedIds, memberId]

      if (maxSelected && newSelection.length > maxSelected) {
        return
      }

      onSelectionChange(newSelection)
    }
  }, [variant, selectedIds, allowClear, maxSelected, onSelectionChange, disabled])

  const handleRemoveMember = useCallback((memberId: string) => {
    if (disabled) return
    onSelectionChange(selectedIds.filter(id => id !== memberId))
  }, [selectedIds, onSelectionChange, disabled])

  const clearFilters = useCallback(() => {
    hasUserSetDepartmentFilterRef.current = true
    setSearchTerm("")
    setDepartmentFilter("")
    setRoleFilter("")
  }, [])

  const clearAll = useCallback(() => {
    if (disabled) return
    onSelectionChange([])
  }, [onSelectionChange, disabled])

  const handleArrowNavigation = useCallback((direction: "up" | "down") => {
    if (!filteredMembers?.length || variant !== "single") return

    const currentIndex = selectedIds[0]
      ? filteredMembers.findIndex((m) => m._id === selectedIds[0])
      : -1

    let newIndex: number
    if (direction === "down") {
      newIndex = currentIndex >= filteredMembers.length - 1 ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex <= 0 ? filteredMembers.length - 1 : currentIndex - 1
    }

    onSelectionChange([filteredMembers[newIndex]._id])
  }, [filteredMembers, variant, selectedIds, onSelectionChange])

  // Handle spacebar at Command level to toggle the cmdk-selected item (not DOM-focused)
  const handleCommandKeyDown = useCallback((e: KeyboardEvent) => {
    // Fix: Don't hijack spacebar when the user is typing in the search input or
    // interacting with other controls (buttons/selects) inside the popover.
    const target = e.target as HTMLElement | null
    const isInInteractiveControl = !!target?.closest(
      'input, textarea, select, option, button, [contenteditable="true"], [role="textbox"]'
    )

    if (e.key === ' ' && variant === 'multiple' && !isInInteractiveControl) {
      e.preventDefault()
      // Find the currently aria-selected item (cmdk's virtual selection)
      const selectedItem = (e.currentTarget as HTMLElement).querySelector('[aria-selected="true"][data-value]')
      if (selectedItem) {
        const itemId = selectedItem.getAttribute('data-value')
        if (itemId) {
          handleToggleMember(itemId)
        }
      }
    }
  }, [variant, handleToggleMember])

  const selectorContent = (
    <Command shouldFilter={false} onKeyDown={handleCommandKeyDown}>
      <CommandInput
        placeholder="Search team members..."
        value={searchTerm}
        onValueChange={setSearchTerm}
        disabled={disabled}
      />

      {(allowDepartmentFilter || allowRoleFilter) && (
        <div className="px-3 py-2 border-b space-y-1.5">
          {allowDepartmentFilter && departments && departments.length > 0 && (
            <select
              aria-label="Filter by department"
              value={departmentFilter || "all"}
              disabled={disabled}
              onChange={(e) => {
                hasUserSetDepartmentFilterRef.current = true
                const next = e.target.value === "all" ? "" : e.target.value
                setDepartmentFilter(next)
              }}
              className="w-full text-sm border rounded-lg pl-3 pr-8 py-1.5 bg-background appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          {allowRoleFilter && availableRoles && availableRoles.length > 0 && (
            <select
              aria-label="Filter by role"
              value={roleFilter || "all"}
              disabled={disabled}
              onChange={(e) => setRoleFilter(e.target.value === "all" ? "" : e.target.value)}
              className="w-full text-sm border rounded-lg pl-3 pr-8 py-1.5 bg-background appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]"
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          )}

          {(searchTerm || departmentFilter || roleFilter) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={disabled}
              className="w-full h-8"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <CommandList className="max-h-[300px]">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3 opacity-80" />
            <p className="text-sm text-destructive font-medium mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-3">{error}</p>
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8 text-xs"
              >
                Try again
              </Button>
            )}
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground pt-2 flex items-center justify-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {loadingMessage}
            </p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
        <CommandEmpty>
          <div className="p-4 text-center">
            <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{emptySearchMessage}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term or filter</p>
          </div>
        </CommandEmpty>
        <CommandGroup className="p-0">
          {allowClear && variant === "single" && selectedIds.length > 0 && (
            <CommandItem
              onPointerDownCapture={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onSelect={() => {
                if (disabled) return
                onSelectionChange([])
                setTimeout(() => setOpen(false), POPOVER_CLOSE_DELAY_MS)
                setUserHasClosed(true)
                setTimeout(() => triggerRef.current?.focus(), FOCUS_RESTORATION_DELAY_MS)
              }}
              disabled={disabled}
              className="flex items-center gap-2 cursor-pointer text-muted-foreground mb-1 rounded-none px-3"
            >
              <X className="h-4 w-4" />
              <span>Remove selection</span>
            </CommandItem>
          )}

          {filteredMembers.map((member) => {
            const isSelected = selectedIds.includes(member._id)
            const isDisabled = disabled || (maxSelected && !isSelected && selectedIds.length >= maxSelected)

            return (
              <CommandItem
                onPointerDownCapture={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                key={member._id}
                value={member._id}
                data-value={member._id}
                onSelect={() => handleToggleMember(member._id)}
                disabled={!!isDisabled}
                className="cursor-pointer rounded-none px-3"
              >
                {variant === "multiple" && (
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled || false}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                )}

                <Avatar className={sizeStyle.list}>
                  <AvatarImage
                    src={member.photoUrl}
                    alt={member.name.fullName}
                  />
                  <AvatarFallback className={sizeStyle.listFallback}>
                    {member.name.givenName?.[0]}{member.name.familyName?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {member.name.fullName}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {member.role || member.orgTitle || member.orgDepartment || "No role"}
                  </div>
                </div>

                {variant === "single" && isSelected && (
                  <Check className="h-4 w-4" />
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
          </>
        )}
      </CommandList>

      {variant === "multiple" && !isLoading && !error && teamMembers.length > 0 && (
        <div className="h-7 px-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedMembers.length}{maxSelected && `/${maxSelected}`} selected
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={disabled || selectedMembers.length === 0}
            className={cn("h-6 px-2 text-xs", selectedMembers.length === 0 && "opacity-50")}
          >
            Clear
          </Button>
        </div>
      )}
    </Command>
  )

  if (contentOnly) {
    return (
      <div className={cn("space-y-2", className)}>
        {selectorContent}

        {variant === "multiple" && selectedMembers.length > 0 && !hideSelectedBadges && (
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <Badge
                key={member._id}
                variant="secondary"
                className={cn("flex items-center", sizeStyle.badgeContainer)}
              >
                <Avatar className={sizeStyle.badge}>
                  <AvatarImage
                    src={member.photoUrl}
                    alt={member.name.fullName}
                  />
                  <AvatarFallback className={sizeStyle.badgeFallback}>
                    {member.name.givenName?.[0]}{member.name.familyName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{member.name.fullName}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    aria-label={`Remove ${member.name.fullName}`}
                    className={cn("rounded-full hover:bg-muted p-0.5", sizeStyle.badgeXMargin)}
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  const showArrows = showNavigationArrows && variant === "single" && triggerMode !== "icon"
  const isPopoverOpen = open && !userHasClosed

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className={cn("flex-1 min-w-0", className)}>
          <Popover open={isPopoverOpen} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (isOpen) {
              setUserHasClosed(false)
            }
          }}>
            <PopoverTrigger asChild>
              {triggerMode === "icon" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={placeholder}
                  aria-expanded={isPopoverOpen}
                  className="border border-transparent hover:border-border focus:border-border"
                  disabled={disabled}
                  onClick={() => setUserHasClosed(false)}
                  onKeyDown={(e) => {
                    if (disabled || !enableKeyboardNavigation) return
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault()
                      handleArrowNavigation("down")
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault()
                      handleArrowNavigation("up")
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  ref={triggerRef}
                  type="button"
                  variant="ghost"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className={cn(
                    "h-9 justify-between border border-transparent hover:border-border focus:border-border pl-2 w-full",
                    showArrows && "sm:flex-1"
                  )}
                  disabled={disabled}
                  onClick={() => setUserHasClosed(false)}
                  onKeyDown={(e) => {
                    if (disabled || !enableKeyboardNavigation) return
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault()
                      handleArrowNavigation("down")
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault()
                      handleArrowNavigation("up")
                    }
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedMembers.length === 0 ? (
                      <Users className="h-6 w-6 shrink-0" />
                    ) : variant === "single" && selectedMembers.length === 1 ? (
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage
                          src={selectedMembers[0].photoUrl}
                          alt={selectedMembers[0].name.fullName}
                        />
                        <AvatarFallback className="text-xs">
                          {selectedMembers[0].name.givenName?.[0]}
                          {selectedMembers[0].name.familyName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Users className="h-6 w-6 shrink-0" />
                    )}

                    {selectedMembers.length === 0 ? (
                      <span className="text-muted-foreground truncate">{placeholder}</span>
                    ) : variant === "single" && selectedMembers.length === 1 ? (
                      <span className="text-sm font-normal truncate">
                        {formatDisplayName(
                          selectedMembers[0].name,
                          compactName !== undefined ? compactName : !isSmUp
                        )}
                      </span>
                    ) : (
                      <span className="truncate">{selectedMembers.length} selected</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-[min(300px,calc(100vw-2rem))] p-0" align="start">
              {selectorContent}
            </PopoverContent>
          </Popover>
        </div>

        {showArrows && (
          <div className="hidden lg:flex items-center ml-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous team member"
              onClick={() => handleArrowNavigation("up")}
              disabled={disabled || !filteredMembers?.length}
              className="h-9 w-8 shrink-0 rounded-l-md rounded-r-none border border-transparent hover:border-border hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4 opacity-50" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next team member"
              onClick={() => handleArrowNavigation("down")}
              disabled={disabled || !filteredMembers?.length}
              className="h-9 w-8 shrink-0 rounded-l-none rounded-r-md border border-transparent hover:border-border hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        )}
      </div>

      {triggerMode === "icon" && showAvatarStack && (
        <div className={cn(sizeStyle.stackMinHeight, "pt-1")}>
          {selectedMembers.length > 0 && (
            <TooltipProvider delayDuration={200}>
              <div className="flex -space-x-2">
                {selectedMembers.map((member) => (
                  <Tooltip key={member._id}>
                    <TooltipTrigger asChild>
                      <div className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-10">
                        <Avatar className={cn(sizeStyle.stack, "border-2 border-background")}>
                          <AvatarImage
                            src={member.photoUrl || "/placeholder-avatar.png"}
                            alt={member.name.fullName}
                            className="object-cover"
                          />
                          <AvatarFallback className={sizeStyle.badgeFallback}>
                            {member.name.givenName?.[0]}{member.name.familyName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveMember(member._id)
                            }}
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            aria-label={`Remove ${member.name.fullName}`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{member.name.fullName}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          )}
        </div>
      )}

      {variant === "multiple" && selectedMembers.length > 0 && !hideSelectedBadges && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <Badge
              key={member._id}
              variant="secondary"
              className={cn("flex items-center", sizeStyle.badgeContainer)}
            >
              <Avatar className={sizeStyle.badge}>
                <AvatarImage
                  src={member.photoUrl}
                  alt={member.name.fullName}
                />
                <AvatarFallback className={sizeStyle.badgeFallback}>
                  {member.name.givenName?.[0]}{member.name.familyName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name.fullName}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member._id)}
                  aria-label={`Remove ${member.name.fullName}`}
                  className={cn("rounded-full hover:bg-muted p-0.5", sizeStyle.badgeXMargin)}
                >
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
