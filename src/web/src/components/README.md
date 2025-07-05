# Schedule Visualization Components

This directory contains improved visualization components for displaying child schedule information in the KDVManager application.

## Components

### ScheduleRulesDisplay
A compact list-based visualization component that displays schedule rules in a DataGrid-friendly format.

**Features:**
- Displays day of week, time slots, and group information
- Color-coded group chips for easy identification
- Compact layout optimized for DataGrid cells
- Responsive design with text overflow handling

### WeeklyScheduleGrid
A calendar-style grid visualization that shows the weekly schedule layout.

**Features:**
- 7-day grid layout (Sunday to Saturday)
- Color-coded time slots by group
- Visual representation of schedule density
- Compact design for embedded use

### ScheduleVisualization
A wrapper component that provides both list and grid views with toggle functionality.

**Features:**
- Toggle between list and grid views
- Consistent styling across both views
- Tooltip-enabled view switching

## Usage

### In DataGrid (Recommended)
```tsx
import { ScheduleRulesDisplay } from "../../components/ScheduleRulesDisplay";

const columns: GridColDef[] = [
  {
    field: "scheduleRules",
    headerName: "WeekSchedule",
    flex: 1,
    minWidth: 400,
    renderCell: (params) => {
      return params.value ? (
        <ScheduleRulesDisplay scheduleRules={params.value} />
      ) : null;
    },
  },
];
```

### Standalone Usage
```tsx
import { ScheduleVisualization } from "../../components/ScheduleVisualization";

<ScheduleVisualization scheduleRules={scheduleRules} />
```

## Data Structure

The components expect an array of `ChildScheduleListVMScheduleRule` objects with the following structure:

```typescript
type ChildScheduleListVMScheduleRule = {
  day?: DayOfWeek;              // 0-6 (Sunday-Saturday)
  timeSlotId?: string;
  timeSlotName?: string | null;
  startTime?: string;           // Format: "HH:MM:SS"
  endTime?: string;             // Format: "HH:MM:SS"
  groupId?: string;
  groupName?: string | null;
};
```

## Styling

The components use Material-UI's theming system and are designed to work well with both light and dark themes. Group colors are automatically assigned using a consistent hash-based algorithm to ensure the same group always gets the same color.

## Improvements Made

1. **Visual Clarity**: Replaced plain text with color-coded chips and structured layouts
2. **Space Efficiency**: Optimized for DataGrid usage with compact but readable design
3. **Information Density**: Better organization of schedule information with visual hierarchy
4. **Accessibility**: Proper contrast ratios and tooltip support
5. **Consistency**: Standardized color scheme for groups across all views
