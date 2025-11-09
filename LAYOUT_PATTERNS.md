# Layout Patterns & Coding Standards

## Overview
This document outlines the consistent layout patterns and coding standards implemented across all screens in the Sports Groups application.

## Shared Components

### 1. SharedLayoutComponent
**Purpose**: Standardizes card-based layouts with headers, loading states, and action menus.

**Usage**:
```html
<app-shared-layout 
  title="Page Title" 
  icon="bi-icon-name"
  [count]="itemCount"
  [loading]="loading" 
  loadingText="Loading message..."
  [showEmptyState]="!loading && items.length === 0"
  emptyText="No items found message"
  emptyIcon="bi-icon-name"
  emptyActionText="Create Item"
  emptyActionIcon="bi-plus"
  [actions]="headerActions"
  (emptyAction)="createItem()">
  
  <!-- Content goes here -->
  
</app-shared-layout>
```

**Properties**:
- `title`: Page/section title
- `icon`: Bootstrap icon class
- `count`: Optional item count badge
- `loading`: Loading state boolean
- `loadingText`: Custom loading message
- `showEmptyState`: Show empty state when no items
- `emptyText`: Empty state message
- `emptyIcon`: Empty state icon
- `emptyActionText`: Empty state action button text
- `emptyActionIcon`: Empty state action button icon
- `actions`: Array of header action menu items
- `bodyStyle`: Custom body styling (optional)

### 2. SharedModalComponent
**Purpose**: Standardizes modal dialogs across the application.

**Usage**:
```html
<app-shared-modal
  [show]="showModal"
  title="Modal Title"
  icon="bi-icon-name"
  modalSize="modal-lg"
  [primaryAction]="saveAction"
  primaryText="Save"
  primaryIcon="bi-check"
  [primaryDisabled]="!isValid"
  [primaryLoading]="saving"
  (closed)="closeModal()">
  
  <!-- Modal content -->
  
</app-shared-modal>
```

## Layout Patterns

### 1. Card-Based Layout
All main content areas use consistent card layouts:
- Header with title, icon, and action menu
- Body with standardized padding and scrolling
- Consistent spacing and shadows

### 2. Action Menus
Three-dot menus in the top-right corner of cards:
- Consistent positioning (`position-absolute top-0 end-0 m-1`)
- Bootstrap popover with list-group items
- Icons with consistent spacing (`me-2`)

### 3. Loading States
Standardized loading indicators:
- Centered spinner with text
- Consistent styling and positioning
- Minimum height for visual stability

### 4. Empty States
Consistent empty state design:
- Large icon with muted colors
- Descriptive text
- Optional action button
- Centered layout

### 5. Modal Patterns
Standardized modal structure:
- Header with title and close button
- Body with consistent padding
- Footer with cancel and primary action buttons
- Backdrop click to close

## Coding Standards

### 1. Component Structure
```typescript
@Component({
  selector: 'component-name',
  imports: [CommonModule, FormsModule, SharedLayoutComponent, ...],
  templateUrl: './component.html',
  styleUrl: './component.scss'
})
export class ComponentName implements OnInit {
  // Properties
  loading = false;
  items: Type[] = [];
  
  // Header actions for SharedLayoutComponent
  headerActions = [
    {
      label: 'Action Name',
      icon: 'bi-icon',
      handler: () => this.actionMethod()
    }
  ];
  
  // Methods
  async ngOnInit() {
    await this.loadData();
  }
  
  async loadData() {
    this.loading = true;
    try {
      // Load data
    } finally {
      this.loading = false;
    }
  }
}
```

### 2. Template Structure
```html
<app-shared-layout 
  [title]="pageTitle"
  [icon]="pageIcon"
  [loading]="loading"
  [showEmptyState]="showEmpty"
  [actions]="headerActions">
  
  <!-- Content grid/list -->
  <div class="row" *ngIf="items.length > 0">
    <div *ngFor="let item of items" class="col-md-6 col-lg-4">
      <!-- Item card content -->
    </div>
  </div>
  
</app-shared-layout>

<!-- Modals -->
<app-shared-modal [show]="showModal" (closed)="closeModal()">
  <!-- Modal content -->
</app-shared-modal>
```

### 3. Styling Conventions
- Use CSS custom properties for theming
- Consistent spacing with Bootstrap utilities
- Responsive design with Bootstrap grid
- Shared CSS classes for common patterns

### 4. Icon Usage
- Bootstrap Icons (`bi-*`) for consistency
- Meaningful icons for actions and states
- Consistent spacing (`me-2`, `ms-2`)

### 5. Button Patterns
- Primary actions: `btn btn-primary`
- Secondary actions: `btn btn-secondary`
- Outline buttons for less emphasis: `btn btn-outline-*`
- Small buttons in tight spaces: `btn-sm`

## Responsive Design

### Breakpoints
- Mobile: `< 576px`
- Tablet: `576px - 768px`
- Desktop: `> 768px`

### Grid System
- Use Bootstrap's responsive grid
- Stack cards on mobile
- Maintain readability at all sizes

### Mobile Optimizations
- Larger touch targets
- Simplified layouts
- Truncated text where needed
- Adjusted spacing

## Color Scheme

### CSS Variables
```scss
:root {
  --theme-primary: #d9a301;
  --theme-primary-dark: #cd9a01;
  --theme-secondary: #554107;
  --theme-light: #fff8e1;
  --theme-lighter: #faf6e6;
  --theme-accent: #f6e6b7;
  --theme-text: #201a1b;
  --theme-shadow: 0 0 0 0.05rem rgb(217 163 1 / 30%);
}
```

### Status Colors
- Pending: Warning (yellow)
- Approved/Completed: Success (green)
- Rejected/Error: Danger (red)
- In Progress: Info (blue)

## Implementation Checklist

### For Each New Screen:
- [ ] Use SharedLayoutComponent for main layout
- [ ] Implement consistent loading states
- [ ] Add appropriate empty states
- [ ] Use SharedModalComponent for dialogs
- [ ] Follow naming conventions
- [ ] Add responsive design considerations
- [ ] Use consistent icons and colors
- [ ] Implement proper error handling
- [ ] Add accessibility attributes
- [ ] Test on mobile devices

### Code Review Points:
- [ ] Consistent component structure
- [ ] Proper use of shared components
- [ ] Responsive design implementation
- [ ] Accessibility compliance
- [ ] Performance considerations
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Icon consistency
- [ ] Color scheme adherence

## Benefits

1. **Consistency**: Uniform look and feel across all screens
2. **Maintainability**: Centralized components for easy updates
3. **Development Speed**: Reusable patterns reduce development time
4. **User Experience**: Predictable interface patterns
5. **Accessibility**: Consistent accessibility implementations
6. **Responsive**: Mobile-first design approach
7. **Theming**: Easy color scheme updates via CSS variables
8. **Testing**: Standardized components are easier to test