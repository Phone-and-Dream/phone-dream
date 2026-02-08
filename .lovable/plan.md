

# Implementation Plan: Improve Waitlist Section Visibility

## Summary

This plan addresses three improvements to the waitlist section:
1. Remove "Not ready yet?" - keep only "Be the first to know when we launch."
2. Remove "/ Support the mission" - keep only "Donate a device" in the modal
3. Make the waitlist section more prominent with larger text and bolder styling

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Landing.tsx` | Update waitlist CTA section styling and text |
| `src/components/WaitlistModal.tsx` | Remove "/ Support the mission" text |

---

## Change 1: Landing Page Waitlist Section

**File:** `src/pages/Landing.tsx`

**Current (lines 102-113):**
```tsx
{/* Waitlist CTA */}
<div className="mt-8 pt-6 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
  <p className="text-sm text-muted-foreground mb-3">Not ready yet? Be the first to know when we launch.</p>
  <Button 
    variant="ghost" 
    className="text-primary hover:bg-primary/10 font-medium"
    onClick={() => setWaitlistOpen(true)}
  >
    <Clock className="mr-2 h-4 w-4" />
    Join the Waitlist
  </Button>
</div>
```

**Updated:**
```tsx
{/* Waitlist CTA */}
<div className="mt-10 pt-8 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
  <p className="text-lg md:text-xl font-medium text-foreground mb-4">Be the first to know when we launch.</p>
  <Button 
    size="lg"
    className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
    onClick={() => setWaitlistOpen(true)}
  >
    <Clock className="mr-2 h-5 w-5" />
    Join the Waitlist
  </Button>
</div>
```

**Key styling changes:**
- Removed "Not ready yet?" text
- Increased text size from `text-sm` to `text-lg md:text-xl`
- Added `font-medium` and changed color from `text-muted-foreground` to `text-foreground`
- Increased margin/padding (`mt-10 pt-8` instead of `mt-8 pt-6`)
- Changed button from `variant="ghost"` to primary (default) with `size="lg"`
- Added larger padding (`px-8 py-6`) and font-semibold
- Added shadow effects for more visual prominence

---

## Change 2: Modal Donor Option Text

**File:** `src/components/WaitlistModal.tsx`

**Current (line 459):**
```tsx
<p className="font-semibold text-lg">Donate a device / Support the mission</p>
```

**Updated:**
```tsx
<p className="font-semibold text-lg">Donate a device</p>
```

---

## Visual Impact

Before:
- Small, subtle text with ghost button
- Easy to miss on the page

After:
- Larger, bold heading text
- Primary-colored button with shadow
- More prominent visual hierarchy
- Clear call-to-action that stands out

