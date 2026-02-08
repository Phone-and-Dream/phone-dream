
# Implementation Plan: Update Stats Section with Pre-Launch Placeholders

## Summary
Replace the current numeric stats ("1,247 Devices Donated", "1,156 Dreamers Helped", etc.) with aspirational pre-launch placeholder values and subtexts that align with the Coming Soon messaging.

## Current State
The stats section in `src/pages/Landing.tsx` (lines 49-54) currently contains:
```
Card 1: Devices Donated | 1,247
Card 2: Dreamers Helped | 1,156
Card 3: Countries Reached | 23
Card 4: Active Donors | 342
```

The stats are rendered in lines 231-239 showing icon, value, and label.

## Problem
These specific numeric values don't align with the pre-launch Coming Soon strategy. They suggest the platform is already operational, which contradicts the waitlist-focused landing page messaging.

## Solution
Update the stats data structure to support subtexts and new pre-launch placeholder values:

### Updated Stats Data (lines 49-54)

```tsx
interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

const stats: StatItem[] = [
  { 
    label: 'Devices Donated', 
    value: 'Starting Soon', 
    icon: Smartphone,
    subtitle: 'Every device creates opportunity'
  },
  { 
    label: 'Dreamers Helped', 
    value: 'Your Story', 
    icon: Heart,
    subtitle: 'The first impact could be yours'
  },
  { 
    label: 'Countries Reached', 
    value: 'Global Vision', 
    icon: Globe,
    subtitle: 'Built for anyone, anywhere'
  },
  { 
    label: 'Active Donors', 
    value: 'Founding Supporters', 
    icon: Users,
    subtitle: 'Be among the first'
  },
];
```

### Updated Stats Rendering (lines 231-239)

Add subtitle display below the value:

```tsx
{stats.map((stat) => (
  <div key={stat.label} className="text-center">
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
      <stat.icon className="h-6 w-6" />
    </div>
    <p className="text-3xl md:text-4xl font-display font-bold">{stat.value}</p>
    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
    {stat.subtitle && (
      <p className="text-xs text-muted-foreground mt-2 italic">{stat.subtitle}</p>
    )}
  </div>
))}
```

## Changes Required

### File: `src/pages/Landing.tsx`

1. **Update interface definition** (before stats const, around line 49):
   - Add optional `subtitle` field to support subtext

2. **Update stats array** (lines 49-54):
   - Replace numeric values with placeholder text
   - Add subtitle text for each card

3. **Update rendering logic** (lines 231-239):
   - Add conditional rendering for `stat.subtitle`
   - Apply italic styling and smaller font for subtitle
   - Maintain spacing and alignment

## Design Notes
- Subtitles use existing `text-xs` and `text-muted-foreground` classes for visual hierarchy
- Italic styling emphasizes aspirational/inspirational tone
- Small margin-top keeps subtitle visually associated with value
- No breaking changes to icon or label rendering
- Maintains responsive grid layout (2 cols mobile, 4 cols desktop)

## Result
The stats section transforms from showing past/current metrics to inspirational pre-launch messaging that encourages waitlist signup and positions visitors as "founding supporters" or "first impact stories."

