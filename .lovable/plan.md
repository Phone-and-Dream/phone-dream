

# Implementation Plan: UX Improvements

## Summary

This plan addresses three distinct issues:
1. **City → State label change**: Update the field label from "City" to "State" in profile edit modals
2. **Navbar authentication-awareness**: Make the Navbar show different content for logged-in users vs. guests, and improve back button navigation
3. **Recipient selection modal improvements**: Enhance the donation flow's recipient selection with filtering and better UX

---

## Issue 1: Change "City" Label to "State"

### Files to Modify

| File | Change |
|------|--------|
| `src/components/EditDonorProfileModal.tsx` | Line 169: Change label from "City" to "State", update placeholder |
| `src/components/EditRecipientProfileModal.tsx` | Line 158: Change label from "City" to "State", update placeholder |

### Technical Details
- The `RecipientApply.tsx` already uses "State" (line 280) - this is correct
- The database column is `profiles.location` which is fine for storing state
- Only the label/placeholder needs updating in the edit modals

---

## Issue 2: Navbar Authentication Awareness & Navigation

### Problem Analysis
- The current `Navbar` component always shows "Sign In" and "Get Started" buttons
- Logged-in users navigating to public pages (DreamBoard, public profiles) see these buttons even though they're authenticated
- Browser back button behavior causes confusion when leaving dashboard

### Solution
Create an authentication-aware Navbar that:
1. Shows "Sign In / Get Started" for guests
2. Shows "Dashboard" and user avatar/menu for logged-in users
3. Maintains proper navigation context

### Files to Modify

| File | Change |
|------|--------|
| `src/components/layout/Navbar.tsx` | Add auth check, conditionally render navigation based on login state |

### New Navigation Behavior

**For Guests:**
- Dream Board link
- About link  
- "Sign In" button
- "Get Started" button

**For Logged-in Users:**
- Dream Board link
- Dashboard link (based on role: donor/recipient/admin)
- User avatar with dropdown menu:
  - My Dashboard
  - Settings
  - Sign Out

### Technical Implementation
```typescript
// In Navbar.tsx:
import { useAuth } from '@/contexts/AuthContext';

const { user, isDonor, isRecipient, isAdmin, signOut } = useAuth();

// Get dashboard path based on role
const getDashboardPath = () => {
  if (isAdmin) return '/admin';
  if (isDonor) return '/donor/dashboard';
  if (isRecipient) return '/recipient/dashboard';
  return '/';
};
```

---

## Issue 3: Recipient Selection Modal Improvements

### Problem Analysis
- Current modal shows a simple scrollable list without filtering
- With many users, finding specific recipients becomes difficult
- No search or device type filter available

### Recommended Solution: **Add filters to the existing modal**

This approach keeps the donation flow self-contained while adding usability:
- Search by name or purpose
- Filter by device type needed
- Maintains the split-panel design with preview

### Files to Modify

| File | Change |
|------|--------|
| `src/components/RecipientSelectionStep.tsx` | Add search input and device filter dropdown inside the modal |

### UI Design

```text
+--------------------------------------------------+
| Select a Recipient from the Dream Board          |
+--------------------------------------------------+
| [🔍 Search by name or purpose...] [Filter: All ▾]|
+--------------------------------------------------+
| Recipients List        |    Preview Panel        |
|                        |                         |
| ○ Maya Johnson         |  [Selected Profile]     |
|   Needs: Laptop        |                         |
|                        |  Name, Location         |
| ○ Taiwo Adeyemi        |  Device Needed          |
|   Needs: Smartphone    |  Story preview          |
|                        |  Goals/Milestones       |
| ○ Grace Okonkwo        |                         |
|   Needs: Tablet        |  [Donate to this...]    |
|                        |                         |
+--------------------------------------------------+
```

### Technical Implementation

Add state for search and filter:
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [deviceFilter, setDeviceFilter] = useState('all');

// Filter the dreamRequests
const filteredRequests = dreamRequests.filter(req => {
  const matchesSearch = !searchQuery || 
    req.recipient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesDevice = deviceFilter === 'all' || 
    req.device_needed.toLowerCase() === deviceFilter;
  
  return matchesSearch && matchesDevice;
});
```

Add filter UI above the list:
```tsx
<div className="flex gap-2 mb-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input 
      placeholder="Search by name or purpose..." 
      className="pl-10"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  <Select value={deviceFilter} onValueChange={setDeviceFilter}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="All Devices" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Devices</SelectItem>
      <SelectItem value="laptop">Laptop</SelectItem>
      <SelectItem value="smartphone">Smartphone</SelectItem>
      <SelectItem value="tablet">Tablet</SelectItem>
      <SelectItem value="pc">PC</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## Implementation Order

1. **Issue 1** (Simple label change) - 2 files, minimal risk
2. **Issue 2** (Navbar auth awareness) - 1 file, medium complexity
3. **Issue 3** (Recipient selection filters) - 1 file, medium complexity

---

## Files Changed Summary

| File | Type | Changes |
|------|------|---------|
| `src/components/EditDonorProfileModal.tsx` | Edit | Label "City" → "State" |
| `src/components/EditRecipientProfileModal.tsx` | Edit | Label "City" → "State" |
| `src/components/layout/Navbar.tsx` | Edit | Add auth awareness, conditional rendering |
| `src/components/RecipientSelectionStep.tsx` | Edit | Add search + device filter |

