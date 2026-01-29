

# Recipient Profile Improvements Plan

## Summary of Changes

This plan addresses five main areas:
1. Change "Creator Type" to "Career" with a new sorted career list
2. Update the device application form to use "Career Path" selection
3. Improve the XP Breakdown section (compact design, proper formatting, 10 XP standardization)
4. Add Work Experience / Employment History section
5. Add Awards section

---

## 1. Change Creator Type to Career

### Current State
The `creator_type` enum currently has: `student`, `artist`, `entrepreneur`, `developer`, `educator`, `other`

### New Career List (A-Z sorted)
Replace with a comprehensive career list:
- Accountant
- Architect
- Artist
- Content Creator
- Data Analyst
- Designer
- Developer
- Doctor
- Educator
- Engineer
- Entrepreneur
- Journalist
- Lawyer
- Marketer
- Musician
- Nurse
- Photographer
- Project Manager
- Researcher
- Scientist
- Student
- Writer
- Other

### Files to Modify
- **Database**: Add migration to update the `creator_type` enum with new values
- **Edit Profile Modal** (`src/components/EditRecipientProfileModal.tsx`): Change label from "Creator Type" to "Career" and update dropdown options
- **Display locations** (`src/pages/RecipientDashboard.tsx`, `src/pages/RecipientPublicProfile.tsx`, `src/pages/Leaderboard.tsx`): Update labels where displayed

---

## 2. Update Device Application Form

### Current State
Step 1 asks "What type of creator are you?" with limited options

### Changes
- Change question to "What is your career path?"
- Use the same career list as the profile (A-Z sorted)
- Keep "Other" option with text input for unlisted careers

### File to Modify
- `src/pages/RecipientApply.tsx`: Update the creator type selection in Step 1

---

## 3. Improve XP Breakdown Section

### Current Issues (from screenshot)
- Takes too much vertical space
- Underscore formatting in action names (e.g., `application_approved`)
- Varying XP values (50, 15, 100, 75, etc.)

### Proposed Changes

**A. Compact Design with Collapsible Dropdown**
- Show only the XP total and rank badge by default
- Add a collapsible "Ways to Earn XP" section that expands/collapses
- Use a more compact grid layout when expanded

**B. Format Action Names**
Create a helper function to convert `snake_case` to readable format:
- `application_approved` → "Application Approved"
- `career_event_added` → "Career Event Added"
- `device_received` → "Device Received"

**C. Standardize XP Values**
Update the XP rules in the database:
- Most actions: **10 XP**
- Device received: **100 XP**

This requires a database update to change XP values in the `xp_rules` table.

### Files to Modify
- `src/pages/RecipientDashboard.tsx`: Redesign XP section with collapsible view
- **Database**: Update XP values in `xp_rules` table

---

## 4. Add Employment History Section

### Database Changes
Create new `employment_history` table:
```sql
CREATE TABLE employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Frontend Changes
- Create `useEmploymentHistory` hooks in `src/hooks/useRecipientData.ts`
- Create `AddEmploymentModal.tsx` and `EditEmploymentModal.tsx` components
- Add Employment History section to `src/pages/RecipientDashboard.tsx`
- Add Employment History section to `src/pages/RecipientPublicProfile.tsx`

---

## 5. Add Awards Section

### Database Changes
Create new `awards` table:
```sql
CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT,
  date_received DATE,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Frontend Changes
- Create `useAwards` hooks in `src/hooks/useRecipientData.ts`
- Create `AddAwardModal.tsx` and `EditAwardModal.tsx` components
- Add Awards section to `src/pages/RecipientDashboard.tsx`
- Add Awards section to `src/pages/RecipientPublicProfile.tsx`

---

## Technical Details

### Database Migration

```sql
-- 1. Update creator_type enum (rename to career)
-- Note: PostgreSQL doesn't allow easy enum renaming, so we add new values
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'architect';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'content_creator';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'data_analyst';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'designer';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'doctor';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'engineer';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'journalist';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'lawyer';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'marketer';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'musician';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'nurse';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'photographer';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'project_manager';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'researcher';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'scientist';
ALTER TYPE creator_type ADD VALUE IF NOT EXISTS 'writer';

-- 2. Create employment_history table
CREATE TABLE public.employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all employment history" 
ON public.employment_history FOR SELECT USING (true);

CREATE POLICY "Users can manage their own employment history" 
ON public.employment_history FOR ALL USING (auth.uid() = recipient_id);

-- 3. Create awards table
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  date_received DATE,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all awards" 
ON public.awards FOR SELECT USING (true);

CREATE POLICY "Users can manage their own awards" 
ON public.awards FOR ALL USING (auth.uid() = recipient_id);

-- 4. Update XP rules (standardize to 10 XP, device_received stays 100)
UPDATE public.xp_rules SET xp_value = 10 WHERE action != 'device_received';
UPDATE public.xp_rules SET xp_value = 100 WHERE action = 'device_received';
```

### Helper Function for Action Name Formatting

```typescript
// Add to src/lib/utils.ts
export function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/AddEmploymentModal.tsx` | Modal for adding employment history |
| `src/components/EditEmploymentModal.tsx` | Modal for editing employment history |
| `src/components/AddAwardModal.tsx` | Modal for adding awards |
| `src/components/EditAwardModal.tsx` | Modal for editing awards |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/EditRecipientProfileModal.tsx` | Change "Creator Type" label to "Career", update options |
| `src/pages/RecipientApply.tsx` | Change question to "Career Path", update options list |
| `src/pages/RecipientDashboard.tsx` | Collapsible XP section, format action names, add Employment & Awards sections |
| `src/pages/RecipientPublicProfile.tsx` | Add Employment & Awards sections |
| `src/hooks/useRecipientData.ts` | Add hooks for employment_history and awards CRUD |
| `src/lib/utils.ts` | Add formatActionName helper |

---

## UI Preview

### XP Section (Compact Design)
```text
+------------------------------------------+
| XP & Ranking                    [Expand] |
| ┌────────────┐                           |
| │    1,250   │  ★ Gold Rank              |
| │   XP       │                           |
| └────────────┘                           |
|                                          |
| [When expanded - collapsible grid]:      |
| ┌─────────────────────────────────────┐  |
| │ Ways to Earn XP                     │  |
| │ ⚡ Application Approved    +10 XP   │  |
| │ ⚡ Career Event Added      +10 XP   │  |
| │ ⚡ Device Received        +100 XP   │  |
| │ ⚡ Skill Added             +10 XP   │  |
| └─────────────────────────────────────┘  |
+------------------------------------------+
```

### Career Selection (A-Z)
```text
Career *
[ Select your career              v ]
  > Accountant
  > Architect
  > Artist
  > Content Creator
  > Data Analyst
  > Designer
  > Developer
  > Doctor
  > Educator
  > Engineer
  > Entrepreneur
  > Journalist
  > Lawyer
  > Marketer
  > Musician
  > Nurse
  > Photographer
  > Project Manager
  > Researcher
  > Scientist
  > Student
  > Writer
  > Other
```

