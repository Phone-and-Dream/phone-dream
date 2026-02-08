
# Implementation Plan: Further Resize Stats Section for Optimal Mobile/Desktop Display

## Summary
The current stats section is still too large, particularly for mobile devices. The reference image shows a more compact design with smaller text. This plan reduces font sizes and spacing to create a tighter, more balanced layout that displays all content properly on mobile while scaling up appropriately on desktop.

## Current Issue
- Main value text (`text-lg md:text-2xl lg:text-3xl`) is still too prominent on mobile
- "Founding Supporters" text is wrapping or overflowing on mobile
- Icons and spacing take up too much vertical real estate
- Label text (`text-xs md:text-sm`) could be smaller
- Subtitles (`text-[10px] md:text-xs`) are still quite visible

## Reference Design (from user's screenshot)
The uploaded screenshot shows:
- Compact, tight spacing around each stat card
- Smaller main values that fit easily in 2-4 column layouts
- Minimal icon size
- Small, subdued labels and subtitles
- Overall very condensed vertical height

## Solution

### Changes to Stats Rendering (lines 238-250)

**Reduce font sizes across all breakpoints:**

1. **Main Value** (currently `text-lg md:text-2xl lg:text-3xl`):
   - Mobile: `text-base` (reduced from `text-lg`)
   - Tablet/Desktop: `text-lg md:text-xl` (reduced from `md:text-2xl lg:text-3xl`)
   - Add `leading-snug` for tighter line height

2. **Label** (currently `text-xs md:text-sm`):
   - Mobile: `text-[11px]` (reduced from `text-xs`)
   - Desktop: `text-xs` (no change, already small)

3. **Subtitle** (currently `text-[10px] md:text-xs`):
   - Mobile: `text-[9px]` (reduced from `text-[10px]`)
   - Desktop: `text-[10px]` (reduced from `text-xs`)

4. **Spacing Adjustments**:
   - Icon container: Keep `h-10 w-10 md:h-12 md:w-12` but reduce margins to `mb-1 md:mb-2`
   - Label margin: Reduce `mt-1` to stay consistent
   - Subtitle margin: Reduce `mt-1 md:mt-2` to `mt-0.5 md:mt-1`

5. **Grid/Container**:
   - Reduce vertical padding: Change `py-16` to `py-12` on section
   - Keep horizontal padding `px-2` on cards
   - Keep gap `gap-4 md:gap-8`

### Updated Code Structure

```tsx
<section className="py-12 bg-card border-y border-border">
  <div className="container">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center px-2">
          <div className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1 md:mb-2">
            <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <p className="text-base md:text-lg font-display font-bold leading-snug">{stat.value}</p>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{stat.label}</p>
          {stat.subtitle && (
            <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5 md:mt-1 italic">{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  </div>
</section>
```

## Result
- More compact overall layout matching the reference screenshot
- "Founding Supporters" fits comfortably on mobile without wrapping
- Better visual hierarchy with tighter spacing
- Maintains responsive behavior while being more space-efficient
- All content visible and readable on both mobile and desktop

## Testing Checklist
- View on mobile (320px) - verify "Founding Supporters" fits
- View on tablet (768px) - verify proper scaling
- View on desktop (1920px) - verify proportions still look balanced
- Check that text remains readable at smallest breakpoint
