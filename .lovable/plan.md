
# Implementation Plan: Pre-Launch Landing Page with Placeholder Cards & Coming Soon Redirects

## Summary
Transform the landing page into a pre-launch conversion-focused experience by replacing real demo profiles with aspirational placeholder cards, creating a "Coming Soon" page for non-landing functionality, and implementing environment-aware routing that restricts public access while preserving all development capabilities.

---

## Architecture Overview

The implementation uses an environment-detection strategy:
- **Preview URL** (development): All routes accessible, all features functional
- **Published URL** (production): Only landing page and Coming Soon page visible; app features redirected

This is achieved through conditional routing based on deployment environment variables.

---

## Part 1: Replace Success Stories with Aspirational Placeholder Cards

### Current State (Landing.tsx lines 239-295)
- Uses `mockRecipients.slice(0, 3)` showing real fake names (Amara, David, Fatima)
- Cards are clickable links to `/recipient/profile/:id`
- Shows avatar images

### New Design
Replace with 3 static, non-clickable placeholder cards using icons instead of photos:

**Card 1 – Recipient**
- Name: "Your Name"
- Tagline: "Building a future with the right device"
- Location: "Your City, Your Country"
- Status: "Could receive a phone, laptop, or work device"
- Icon: Target icon (aspirational goal)
- Gradient: accent color theme

**Card 2 – Donor**
- Name: "You, the Donor"
- Tagline: "Helping someone's dream move forward"
- Location: "Anywhere in the world"
- Status: "Your donated device can change a life"
- Icon: Gift icon (giving/support)
- Gradient: primary color theme

**Card 3 – Organization**
- Name: "Your Organization"
- Tagline: "Empowering talent through shared devices"
- Location: "Global Initiative"
- Status: "Supporting dreams at scale"
- Icon: Building2 icon (organizational scale)
- Gradient: blue color theme

### CTA Below Cards
Add "This could be your story." text with a clickable "Join the Waitlist" link that opens the waitlist modal.

### Design Notes
- Remove Link wrapper from cards (no hover:shadow-warm, remove href)
- Use Lucide icons in circular containers instead of avatar images
- Keep existing card styling (glass-card, rounded-2xl, p-6)
- Remove rank badge
- Use neutral gradients for each role

---

## Part 2: Create "Coming Soon" Page

### New File: `src/pages/ComingSoon.tsx`

**Structure:**
```
Hero Section
├── Icon/Emoji (🚀)
├── Heading: "Coming Soon"
├── Subheading: "We're building something amazing"
│
Body Section
├── Description paragraph about launch
├── [Join the Waitlist] CTA button
│   └── Opens WaitlistModal
│
Social Links Section
├── Text: "Follow us on X for updates"
├── X icon link → https://x.com/aphoneandadream
│
Back Link
└── Link to home (with back arrow)
```

**Features:**
- Consistent styling with existing pages (use Navbar + Footer)
- Prominent waitlist CTA
- Clear social media call-to-action
- Mobile responsive
- Warm gradient background to match landing page aesthetic

---

## Part 3: Implement Environment-Aware Route Protection

### Strategy
Use environment variable to detect production deployment:
- `VITE_IS_PRODUCTION` or similar flag to identify published site
- Development (preview) has no restrictions
- Production redirects non-landing routes to `/coming-soon`

### Routes to Redirect in Production

| Route | Type | Redirect To |
|-------|------|-------------|
| `/login` | Auth | `/coming-soon` |
| `/signup` | Auth | `/coming-soon` |
| `/donor/register` | Functional | `/coming-soon` |
| `/recipient/apply` | Functional | `/coming-soon` |
| `/dream-board` | Functional | `/coming-soon` |
| `/leaderboard` | Functional | `/coming-soon` |
| `/donor/donate` | Functional | `/coming-soon` |
| `/donor/dashboard` | Protected | `/coming-soon` |
| `/recipient/dashboard` | Protected | `/coming-soon` |
| `/recipient/tasks` | Protected | `/coming-soon` |
| `/admin` | Protected | `/coming-soon` |
| All other protected routes | Protected | `/coming-soon` |

### Implementation Approach

**Option A: ProtectedRoute Wrapper Enhancement**
- Modify `src/components/ProtectedRoute.tsx` to check environment and redirect
- Simple, minimal changes
- Only affects protected routes (good if unprotected routes should still work in preview)

**Option B: Global Route Middleware (Recommended)**
- Create a new component `src/components/PrelaunchRoute.tsx`
- Wraps ALL routes except `/` and `/coming-soon`
- Checks environment variable and redirects if production
- Applied in `App.tsx` to all routes

**Option C: useEffect Hook in Navbar/App**
- On mount, check location and environment
- Redirect if accessing non-allowed routes in production

**Recommended: Option B** - Provides cleanest separation of concerns and easiest to manage.

---

## Part 4: Update Navigation Links

### Navbar Changes (src/components/layout/Navbar.tsx)
- "Sign In" button (line 131) → Link to `/coming-soon` instead of `/login`
- "Get Started" button (line 134) → Link to `/coming-soon` instead of `/signup`
- For logged-in users: Dashboard and Settings remain unchanged (they can access via preview)

### Landing Page Changes (src/pages/Landing.tsx)
- Hero "Donate a Device" button (line 89) → `/coming-soon`
- Hero "I Need a Device" button (line 95) → `/coming-soon`
- "View All" button in Success Stories (line 248) → `/coming-soon` (but this is replaced with CTA)
- CTA Section "Donate a Device" button (line 308) → `/coming-soon`
- CTA Section "Browse Dream Board" button (line 311) → `/coming-soon`

### Footer Changes (src/components/layout/Footer.tsx)
- "Dream Board" link (line 24) → `/coming-soon`
- "Donate a Device" link (line 25) → `/coming-soon`
- "Apply for a Device" link (line 26) → `/coming-soon`

---

## Part 5: Implementation Sequencing

### Step 1: Create ComingSoon Page
- Create `src/pages/ComingSoon.tsx`
- Include Navbar and Footer
- Waitlist modal integration
- Social link to X

### Step 2: Create PrelaunchRoute Component
- Create `src/components/PrelaunchRoute.tsx`
- Detect production environment
- Redirect non-allowed routes to `/coming-soon`

### Step 3: Update App.tsx Routes
- Import ComingSoon page
- Add `/coming-soon` route
- Wrap routes with PrelaunchRoute component
- Ensure logic handles both preview and production correctly

### Step 4: Update Landing.tsx
- Remove mockRecipients import (if no longer needed elsewhere)
- Replace Success Stories section with 3 placeholder cards
- Update all internal CTA buttons to point to `/coming-soon`
- Add "This could be your story" CTA below cards with waitlist modal trigger

### Step 5: Update Navigation (Navbar)
- Change "Sign In" → `/coming-soon`
- Change "Get Started" → `/coming-soon`

### Step 6: Update Footer Links
- Change all Quick Links to `/coming-soon`

### Step 7: Testing
- Test in preview: All routes accessible, no redirects
- Test in production (once published): Only landing page and coming-soon accessible
- Verify waitlist modal opens from both landing page and coming-soon page
- Test mobile responsive design
- Verify X link opens correctly

---

## Files to Create/Modify

| File | Action | Summary |
|------|--------|---------|
| `src/pages/ComingSoon.tsx` | Create | New Coming Soon page with waitlist CTA |
| `src/components/PrelaunchRoute.tsx` | Create | Environment-aware route wrapper |
| `src/pages/Landing.tsx` | Modify | Replace demo profiles with placeholder cards; update CTAs |
| `src/components/layout/Navbar.tsx` | Modify | Update Sign In/Get Started buttons to `/coming-soon` |
| `src/components/layout/Footer.tsx` | Modify | Update Quick Links to `/coming-soon` |
| `src/App.tsx` | Modify | Add ComingSoon route; wrap routes with PrelaunchRoute |

---

## Technical Implementation Details

### ComingSoon.tsx Structure
```tsx
export default function ComingSoon() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <section className="hero-gradient text-primary-foreground">
          {/* Content */}
        </section>
      </main>
      <Footer />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
```

### PrelaunchRoute.tsx Logic
```tsx
export function PrelaunchRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isProduction = import.meta.env.VITE_IS_PRODUCTION === 'true';
  
  const allowedRoutes = ['/', '/coming-soon'];
  const isAllowed = allowedRoutes.includes(location.pathname);
  
  if (isProduction && !isAllowed) {
    return <Navigate to="/coming-soon" replace />;
  }
  
  return <>{children}</>;
}
```

### Placeholder Card Component
```tsx
const aspirationalCards = [
  {
    name: 'Your Name',
    tagline: 'Building a future with the right device',
    location: 'Your City, Your Country',
    status: 'Could receive a phone, laptop, or work device',
    icon: Target,
    gradient: 'from-accent/20 to-accent/10'
  },
  // ... two more cards
];

{aspirationalCards.map((card) => (
  <div className="glass-card rounded-2xl overflow-hidden p-6">
    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      <card.icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-display font-semibold">{card.name}</h3>
    <p className="text-sm text-muted-foreground">{card.tagline}</p>
    {/* Additional fields */}
  </div>
))}
```

---

## User Experience Flow

### Visitor on Landing Page (Preview)
1. See landing with placeholder cards (not clickable)
2. See all CTAs available but point to `/coming-soon`
3. Can access waitlist from landing or coming-soon page
4. If they click any action CTA, taken to coming-soon

### Visitor on Landing Page (Published)
1. See same landing with placeholder cards
2. See all CTAs
3. Clicking any CTA takes them to coming-soon
4. Can only access landing and coming-soon pages

### Developer in Preview
1. Can access all routes by typing them in address bar
2. Can test all features normally
3. Routes NOT redirected (PrelaunchRoute allows all in preview)
4. All development unaffected

---

## Future Considerations

- When launching public features, simply set `VITE_IS_PRODUCTION = 'false'` or remove environment check
- Placeholder cards can remain as-is or be replaced with real success stories
- Success Stories page can be created separately later
- Rate-limiting or waitlist-only access can be added later
- Analytics can track coming-soon page interactions

