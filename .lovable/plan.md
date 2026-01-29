
# Remove Leaderboard from Landing Page

## Summary
The Leaderboard will be moved from the public landing page navigation to the recipient dashboard menu, making it accessible only to logged-in recipients.

---

## Changes Required

### 1. Remove Leaderboard from Public Navbar
**File:** `src/components/layout/Navbar.tsx`

Remove the Leaderboard link from the `navLinks` array:
```typescript
// Before
const navLinks = [
  { name: 'Dream Board', href: '/dream-board', icon: Heart },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'About', href: '/#about', icon: Users },
];

// After
const navLinks = [
  { name: 'Dream Board', href: '/dream-board', icon: Heart },
  { name: 'About', href: '/#about', icon: Users },
];
```

Also remove the unused `Trophy` import from lucide-react.

---

### 2. Add Leaderboard to Recipient Dashboard Menu
**File:** `src/components/layout/DashboardLayout.tsx`

Add the Leaderboard link to the `dynamicRecipientLinks` array:
```typescript
const dynamicRecipientLinks = [
  { name: 'My Portfolio', href: '/recipient/dashboard', icon: LayoutDashboard },
  { name: 'Earn XP', href: '/recipient/tasks', icon: Trophy },
  { name: 'Leaderboard', href: '/leaderboard', icon: Crown }, // NEW
  { name: 'Public Profile', href: user?.id ? `/recipient/profile/${user.id}` : '/recipient/dashboard', icon: User },
  { name: 'Dream Board', href: '/dream-board', icon: Heart },
  { name: 'Settings', href: '/recipient/settings', icon: Settings },
];
```

Add `Crown` to the lucide-react imports.

---

### 3. Update Leaderboard Page Layout
**File:** `src/pages/Leaderboard.tsx`

Change from public layout (Navbar/Footer) to dashboard layout:
- Import `DashboardLayout` instead of `Navbar` and `Footer`
- Wrap content with `<DashboardLayout role="recipient">` 
- Remove the `<Navbar />` and `<Footer />` components
- Adjust the page structure to fit within the dashboard layout

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/layout/Navbar.tsx` | Remove Leaderboard from navLinks, remove Trophy import |
| `src/components/layout/DashboardLayout.tsx` | Add Leaderboard to recipient menu |
| `src/pages/Leaderboard.tsx` | Use DashboardLayout instead of Navbar/Footer |

---

## Access Flow After Changes

```text
Before:
  Landing Page → Navbar → [Leaderboard] ✓ (public)
  
After:
  Recipient Dashboard → Sidebar Menu → [Leaderboard] ✓ (recipient only)
  Landing Page → Navbar → [No Leaderboard] ✗
```

---

## Note on Route Protection
The `/leaderboard` route currently doesn't have `ProtectedRoute` wrapper in `App.tsx`. After this change, you may want to consider adding route protection so only authenticated recipients can access it. Let me know if you'd like that included.
