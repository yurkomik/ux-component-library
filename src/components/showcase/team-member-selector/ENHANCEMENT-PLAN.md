# TeamMemberSelector Enhancement Plan

> **Status: ✅ COMPLETED** (Phases 1-4 implemented)
>
> Implementation Date: January 2026

## Overview
Enhance the TeamMemberSelector component and Storybook stories to support comprehensive testing scenarios including edge cases, loading states, error states, and empty states.

---

## Phase 1: Name Length Testing Controls

### Goal
Add a story control to test different name lengths and verify the component handles text overflow gracefully.

### Mock Data Sets
Create additional mock data sets in the stories file:

```typescript
const mockShortNames: TeamMember[] = [
  { name: { givenName: 'Jo', familyName: 'Li', fullName: 'Jo Li' }, ... },
  { name: { givenName: 'Ed', familyName: 'Wu', fullName: 'Ed Wu' }, ... },
]

const mockLongNames: TeamMember[] = [
  { name: { givenName: 'Alexandra', familyName: 'Montgomery-Richardson', fullName: 'Alexandra Elizabeth Montgomery-Richardson III' }, ... },
  { name: { givenName: 'Christopher', familyName: 'Vanderbilt-Worthington', fullName: 'Christopher James Vanderbilt-Worthington Jr.' }, ... },
]

const mockSpecialNames: TeamMember[] = [
  { name: { givenName: 'José', familyName: 'García-López', fullName: 'José María García-López' }, ... },
  { name: { givenName: "Séan", familyName: "O'Connor", fullName: "Séan O'Connor" }, ... },
  { name: { givenName: '中文', familyName: '名字', fullName: '中文名字' }, ... }, // Chinese
]
```

### Story: NameLengthTesting
Add a control to switch between name length datasets:

```typescript
export const NameLengthTesting: Story = {
  argTypes: {
    nameSet: {
      control: 'inline-radio',
      options: ['standard', 'short', 'long', 'special', 'mixed'],
    }
  }
}
```

### Component Changes Required
- **None** - component already uses `truncate` class
- Verify badge overflow behavior with long names
- Verify dropdown list text truncation

---

## Phase 2: Loading States

### Current State
**Component does NOT support loading states** - it expects `teamMembers` array to be provided.

### Proposed Props
```typescript
interface TeamMemberSelectorProps {
  // ... existing props
  isLoading?: boolean
  loadingMessage?: string
}
```

### UI Requirements
1. **Trigger in loading state**:
   - Show skeleton/shimmer placeholder OR
   - Show spinner inside the trigger button
   - Disable interaction while loading

2. **Dropdown in loading state**:
   - Show skeleton list items (3-5 placeholders)
   - "Loading team members..." message
   - Disable selection

### Story: LoadingState
```typescript
export const LoadingState: Story = {
  args: {
    isLoading: true,
    loadingMessage: 'Loading team members...'
  }
}
```

### Implementation Approach
```tsx
// In dropdown content
{isLoading ? (
  <div className="p-4 space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
) : (
  // ... existing member list
)}
```

---

## Phase 3: Error States

### Current State
**Component does NOT support error states** - assumes data is always valid.

### Proposed Props
```typescript
interface TeamMemberSelectorProps {
  // ... existing props
  error?: string | null
  onRetry?: () => void
}
```

### UI Requirements
1. **Error in dropdown**:
   - Show error message with icon
   - Optional "Retry" button if `onRetry` provided
   - Keep trigger functional (user can close/reopen)

2. **Error styling**:
   - Red/destructive color scheme
   - Clear error iconography

### Story: ErrorState
```typescript
export const ErrorState: Story = {
  args: {
    error: 'Failed to load team members. Please try again.',
  },
  render: (args) => {
    // Provide mock retry handler
  }
}
```

### Implementation Approach
```tsx
// In dropdown content
{error ? (
  <div className="p-4 text-center">
    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
    <p className="text-sm text-destructive">{error}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
        Try again
      </Button>
    )}
  </div>
) : (
  // ... existing content
)}
```

---

## Phase 4: Empty States

### Current State
**Component shows empty list** when no members match filters, but has no dedicated empty state UI.

### Types of Empty States
1. **No team members at all** - `teamMembers` array is empty
2. **No search results** - search/filter returned nothing
3. **All members selected** - in maxSelected scenarios

### Proposed Props
```typescript
interface TeamMemberSelectorProps {
  // ... existing props
  emptyMessage?: string
  emptySearchMessage?: string
}
```

### UI Requirements
1. **Empty data**:
   - Friendly illustration/icon
   - "No team members found" message
   - Optional action (e.g., "Add team member" link)

2. **Empty search results**:
   - "No members match your search"
   - Suggestion to try different keywords

### Story: EmptyStates
```typescript
export const EmptyData: Story = {
  args: {
    teamMembers: [],
    emptyMessage: 'No team members in the system yet.'
  }
}

export const EmptySearchResults: Story = {
  // Component auto-handles this, but add story for documentation
}
```

### Implementation Approach
```tsx
// When teamMembers is empty
{teamMembers.length === 0 ? (
  <div className="p-6 text-center">
    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
    <p className="text-sm text-muted-foreground">{emptyMessage || 'No team members available'}</p>
  </div>
) : filteredMembers.length === 0 ? (
  <div className="p-4 text-center">
    <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
    <p className="text-sm text-muted-foreground">{emptySearchMessage || 'No results found'}</p>
  </div>
) : (
  // ... existing list
)}
```

---

## Phase 5: Additional Edge Case Stories

### Story: MissingAvatars
Test fallback initials when `photoUrl` is missing or broken.

```typescript
const mockMissingAvatars: TeamMember[] = [
  { photoUrl: '', ... },  // Empty
  { photoUrl: 'https://broken-url.com/404.jpg', ... },  // Broken
  { photoUrl: undefined, ... },  // Undefined
]
```

### Story: LargeDataset
Test performance with 100+ team members.

```typescript
const mockLargeDataset = Array.from({ length: 150 }, (_, i) => ({
  _id: `member-${i}`,
  name: { fullName: `Team Member ${i + 1}`, ... },
  ...
}))
```

### Story: ManySelections
Test UI when many members are selected (badge overflow).

```typescript
export const ManySelections: Story = {
  // Pre-select 10+ members to test badge wrapping
}
```

### Story: LongEmails
Test truncation with very long email addresses.

```typescript
const mockLongEmails: TeamMember[] = [
  { primaryEmail: 'alexandra.montgomery-richardson@very-long-company-name.enterprise.com', ... },
]
```

### Story: MissingMetadata
Test when role, department, or title are missing.

```typescript
const mockMissingMetadata: TeamMember[] = [
  { role: undefined, orgDepartment: undefined, orgTitle: undefined, ... },
]
```

---

## Phase 6: Accessibility Stories

### Story: KeyboardNavigation
Document keyboard interaction patterns:
- `Tab` - Focus trigger
- `Enter/Space` - Open dropdown
- `Arrow Up/Down/Left/Right` - Navigate list
- `Enter` - Select focused item
- `Escape` - Close dropdown

### Story: ScreenReaderDemo
Verify ARIA labels and announcements:
- Trigger button has descriptive label
- Selection count announced
- List items have proper roles

---

## Implementation Priority

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Phase 1: Name Lengths | High | Low | Medium |
| Phase 2: Loading States | High | Medium | High |
| Phase 3: Error States | Medium | Medium | High |
| Phase 4: Empty States | Medium | Low | Medium |
| Phase 5: Edge Cases | Low | Low | Medium |
| Phase 6: Accessibility | Medium | Low | High |

---

## Summary of Component Changes

### New Props to Add
```typescript
interface TeamMemberSelectorProps {
  // ... existing props

  // Loading
  isLoading?: boolean
  loadingMessage?: string

  // Error
  error?: string | null
  onRetry?: () => void

  // Empty
  emptyMessage?: string
  emptySearchMessage?: string
}
```

### New Dependencies (if not already present)
- Skeleton component from shadcn/ui (for loading states)
- Alert icons from lucide-react

### Estimated Total Effort
- **Component changes**: 2-3 hours
- **New stories**: 2-3 hours
- **Testing & polish**: 1-2 hours
- **Total**: ~6-8 hours

---

## Notes

1. **Loading/Error states are optional** - If the parent always provides data synchronously (e.g., from Convex reactive queries), these states may be unnecessary. However, they're valuable for:
   - Storybook documentation
   - Future use cases
   - Better UX in slow network conditions

2. **Consider skeleton vs spinner** - Skeleton loading is more modern and less jarring, but takes more implementation effort.

3. **Test in real viewport sizes** - Many edge cases only appear on mobile or in narrow containers.
