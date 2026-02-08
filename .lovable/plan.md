
# Implementation Plan: Update Footer - Remove Demos & Add Social Links

## Summary

Remove the "For Demos" section from the footer and replace it with social media links, specifically an X (Twitter) link.

---

## Changes

### File: `src/components/layout/Footer.tsx`

**1. Add Twitter/X icon import**
- Import the `Twitter` icon from `lucide-react` (this is the X logo)

**2. Remove "For Demos" section (lines 30-36)**
- Delete the entire div containing "For Demos" header and the demo dashboard links

**3. Add "Follow Us" section in its place**
- Create a new section with social media links
- Include X/Twitter link: https://x.com/aphoneandadream
- Style the icon as a clickable link with hover effects

---

## Updated Footer Structure

```
Footer
├── Brand Section (col-span-2)
│   ├── Logo + Name
│   └── Tagline
│
├── Quick Links
│   ├── Dream Board
│   ├── Donate a Device
│   └── Apply for a Device
│
├── Follow Us (NEW - replaces "For Demos")
│   └── X/Twitter icon link
│
└── Bottom Bar
    ├── Copyright
    └── Made with ❤️
```

---

## Code Changes

**Before (lines 30-36):**
```tsx
<div>
  <h4 className="font-display font-semibold mb-4">For Demos</h4>
  <ul className="space-y-2 text-sm text-muted-foreground">
    <li><Link to="/recipient/dashboard">Recipient Dashboard</Link></li>
    <li><Link to="/donor/dashboard">Donor Dashboard</Link></li>
  </ul>
</div>
```

**After:**
```tsx
<div>
  <h4 className="font-display font-semibold mb-4">Follow Us</h4>
  <div className="flex items-center gap-4">
    <a 
      href="https://x.com/aphoneandadream" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      aria-label="Follow us on X"
    >
      <Twitter className="h-5 w-5" />
    </a>
  </div>
</div>
```

---

## Implementation Notes

- Uses `<a>` tag with `target="_blank"` for external link
- Includes `rel="noopener noreferrer"` for security
- Adds `aria-label` for accessibility
- The social links section is designed to easily add more platforms later (Instagram, LinkedIn, etc.)
