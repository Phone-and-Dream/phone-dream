
# Implementation Plan: Enhanced Waitlist Modal with Improved Input Controls

## Summary

The user wants the waitlist modal to use proper select/dropdown components instead of free-text inputs for:
1. **Country** - Searchable dropdown with all countries
2. **Donor Type** - Select instead of radio buttons
3. **Organization Role** - Select with predefined options + "Other"
4. **Devices Interested** - Multi-select checkboxes instead of free text
5. **Donation Timing** - Select instead of free text
6. Any other fields that should be selects instead of text inputs

This plan revises the previous waitlist implementation to use better UI patterns that exist in the codebase.

---

## Current Patterns in Codebase

### Existing Select Implementation
- **Location**: `src/components/ui/select.tsx` - Standard Radix UI Select component
- **Usage**: Used extensively in `RecipientApply.tsx` and `DonorRegister.tsx`
- **Pattern**: `<Select value={} onValueChange={}>` with `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`

### Existing Checkbox Implementation  
- **Location**: `src/components/ui/checkbox.tsx` - Radix UI Checkbox
- **Usage**: Used in `AddProjectModal.tsx`, `EditProjectModal.tsx` for toggles
- **Pattern**: Checkboxes with labels for multi-select scenarios

### Country Selection Precedent
- **Location**: `RecipientApply.tsx` lines 295-310
- **Current**: Limited list (8 African countries + Other)
- **Issue**: Not searchable and limited options

---

## Database Schema Additions

No changes needed to the previously planned schema. The tables `donor_waitlist` and `recipient_waitlist` store the same data regardless of UI component type.

---

## Updated UI Components

### New File: `src/components/WaitlistModal.tsx`

#### Structure

```
WaitlistModal
├── Role Selection (unchanged)
│   ├── Donor Option
│   └── Recipient Option
│
├── Donor Form (Multi-step with selects)
│   ├── Step 1: Basic Info
│   │   ├── Full Name (Input)
│   │   ├── Email (Input)
│   │   └── Country (Searchable Select with 200+ countries)
│   │
│   ├── Step 2: Donor Type Selection
│   │   ├── Donor Type (Select: Individual, Company, Community)
│   │   └── Organization Name (Input, conditional)
│   │   └── Role in Organization (Select, conditional)
│   │
│   ├── Step 3: Devices (Multi-select with Checkboxes)
│   │   └── Device types (Grid of checkboxes)
│   │
│   ├── Step 4: Timing & Volume
│   │   ├── Donation Timing (Select)
│   │   └── Estimated Devices (Select)
│   │
│   └── Step 5: Support Reason
│       └── Why support (Textarea, optional)
│
└── Recipient Form (Multi-step with selects)
    ├── Step 1: Basic Info
    │   ├── Full Name (Input)
    │   ├── Email (Input)
    │   ├── Country (Searchable Select)
    │   ├── State (Input)
    │   └── Age Range (Select)
    │
    ├── Step 2: Current Status
    │   └── Status (Select: Student, Unemployed, etc.)
    │
    ├── Step 3: Learning Interest
    │   ├── Interest Type (Select)
    │   └── Device Usage Plan (Textarea)
    │
    └── Step 4: Device & Current Status
        ├── Device Needed (Multi-select Checkboxes)
        └── Current Device Status (Select)
```

---

## Detailed Field Mappings

### DONOR WAITLIST

| Field | Component Type | Options/Source |
|-------|----------------|-----------------|
| Full Name | Input | Free text |
| Email | Input | Free text |
| Country | **Searchable Select** | List of 200+ countries |
| Donor Type | **Select (dropdown)** | Individual, Company/Startup, Community/DAO/NGO |
| Organization Name | Input (conditional) | Free text, shown if donor_type != individual |
| Role in Organization | **Select (dropdown)** | Founder, CEO, HR Manager, Community Lead, Operations, Other |
| Devices Interested | **Multi-select (checkboxes)** | Phones, Laptops, Tablets, Desktop PCs, Monitors & Peripherals, External Storage, Creator Tools, Cash, Not sure yet |
| Donation Timing | **Select (dropdown)** | Immediately at launch, Within 1-3 months, Not sure |
| Estimated Devices | **Select (dropdown)** | 1, 2-5, 5+ |
| Support Reason | Textarea | Free text, optional |

### RECIPIENT WAITLIST

| Field | Component Type | Options/Source |
|-------|----------------|-----------------|
| Full Name | Input | Free text |
| Email | Input | Free text |
| Country | **Searchable Select** | List of 200+ countries |
| State | Input | Free text |
| Age Range | **Select (dropdown)** | Under 18, 18-24, 25-35, 35+ |
| Current Status | **Select (dropdown)** | Student, Unemployed, Self-learning/Upskilling, Freelancer, Early-stage founder, Other |
| Learning Interest | **Select (dropdown)** | Tech, Content creation, Education, Business, Other |
| Learning Interest Other | Input (conditional) | Free text, shown if learning_interest = other |
| Device Usage Plan | Textarea | Free text, 20-1000 chars |
| Device Needed | **Multi-select (checkboxes)** | Phones, Laptops, Tablets, Desktop PCs, Monitors & Peripherals, External Storage, Creator Tools |
| Current Device Status | **Select (dropdown)** | None, Broken/unusable, Shared device, Old but slow device |

---

## Data Structure for Reference

### Donor Type Select
```typescript
const donorTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company / Startup' },
  { value: 'community', label: 'Community / DAO / NGO' },
];
```

### Organization Roles (conditional)
```typescript
const organizationRoles = [
  { value: 'founder', label: 'Founder' },
  { value: 'ceo', label: 'CEO' },
  { value: 'hr', label: 'HR Manager' },
  { value: 'community_lead', label: 'Community Lead' },
  { value: 'operations', label: 'Operations Manager' },
  { value: 'other', label: 'Other' },
];
```

### Device Types (Multi-select)
```typescript
const deviceTypes = [
  { value: 'phones', label: 'Phones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'desktop_pcs', label: 'Desktop PCs' },
  { value: 'monitors_peripherals', label: 'Monitors & Peripherals' },
  { value: 'external_storage', label: 'External Storage' },
  { value: 'creator_tools', label: 'Creator Tools' },
  { value: 'cash', label: 'Cash (to fund a device)', donorOnly: true },
  { value: 'not_sure', label: 'Not sure yet', donorOnly: true },
];
```

### Countries (Searchable)
```typescript
const countries = [
  // Africa (priority section)
  { value: 'ng', label: 'Nigeria' },
  { value: 'gh', label: 'Ghana' },
  { value: 'ke', label: 'Kenya' },
  // ... 200+ total countries organized by region
];
// Make searchable by name as user types
```

### Age Ranges
```typescript
const ageRanges = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_24', label: '18–24' },
  { value: '25_35', label: '25–35' },
  { value: '35+', label: '35+' },
];
```

### Timing Options
```typescript
const timingOptions = [
  { value: 'immediately', label: 'Immediately at launch' },
  { value: '1_3_months', label: 'Within 1–3 months' },
  { value: 'not_sure', label: 'Not sure' },
];
```

### Device Count Options
```typescript
const deviceCounts = [
  { value: '1', label: '1' },
  { value: '2_5', label: '2–5' },
  { value: '5+', label: '5+' },
];
```

---

## Component Implementation Details

### 1. Searchable Country Select

Create a custom component to wrap the Select with filtering:

```typescript
// In WaitlistModal.tsx

const CountrySelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter(c => 
      c.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        <Input 
          placeholder="Search countries..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        {filteredCountries.map(country => (
          <SelectItem key={country.value} value={country.value}>
            {country.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### 2. Multi-select Devices with Checkboxes

```typescript
const DeviceCheckboxes = ({ selected, onChange, donorOnly = false }) => {
  const handleToggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  
  const visibleDevices = donorOnly 
    ? deviceTypes 
    : deviceTypes.filter(d => !d.donorOnly);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {visibleDevices.map(device => (
        <div key={device.value} className="flex items-center gap-2">
          <Checkbox
            id={device.value}
            checked={selected.includes(device.value)}
            onCheckedChange={() => handleToggle(device.value)}
          />
          <Label htmlFor={device.value} className="font-normal cursor-pointer">
            {device.label}
          </Label>
        </div>
      ))}
    </div>
  );
};
```

### 3. Conditional Organization Fields

When `donorType` is not 'individual':
- Show Organization Name input
- Show Role in Organization select
- Make both required

---

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/WaitlistModal.tsx` | Create | Main modal component (~800 lines) with all form logic |
| `src/hooks/useWaitlist.ts` | Create | Mutation hooks (same as previous plan) |
| `src/pages/Landing.tsx` | Modify | Add state for modal and button trigger |
| `src/lib/data/countries.ts` | Create | Export countries list with 200+ entries |
| `src/lib/data/formOptions.ts` | Create | Export all dropdown/select options |

---

## Validation Updates

Update zod schemas to match new field types:

```typescript
const donorWaitlistSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  country: z.string().min(2, "Please select a country"),
  donor_type: z.enum(['individual', 'company', 'community']),
  organization_name: z.string().optional(),
  organization_role: z.string().optional(),
  devices_interested: z.array(z.string()).min(1, "Select at least one device"),
  donation_timing: z.enum(['immediately', '1_3_months', 'not_sure']).optional(),
  estimated_devices: z.enum(['1', '2_5', '5+']).optional(),
  support_reason: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.donor_type !== 'individual') {
      return data.organization_name && data.organization_role;
    }
    return true;
  },
  { message: "Organization details required" }
);
```

---

## Implementation Order

1. Create `src/lib/data/countries.ts` and `src/lib/data/formOptions.ts`
2. Update `src/components/WaitlistModal.tsx` with all select components
3. Update `src/hooks/useWaitlist.ts` (minimal changes, same logic)
4. Update `src/pages/Landing.tsx` to import and use the modal
5. Test form validation and submission flow

---

## Key Improvements Over Previous Plan

1. **Better UX**: Dropdowns instead of free text reduces typos and invalid entries
2. **Consistency**: Uses existing UI patterns from the codebase (Select, Checkbox)
3. **Searchability**: Country select is searchable for better accessibility
4. **Conditional Fields**: Organization fields only show when relevant
5. **Multi-select**: Checkboxes for device selection feel more natural than free text
6. **Cleaner Data**: Standardized enum values in database instead of free text variations

