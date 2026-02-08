
# Implementation Plan: Create Working Homepage at /dev

## Summary
Create a fully functional homepage at `/dev` where all authentication buttons (Sign In, Sign Up, Get Started) link to the actual auth pages instead of the coming-soon page.

## What This Will Do
- Transform the blank `Index.tsx` into a working homepage
- Include the Navbar and Footer for consistent navigation
- All CTA buttons will link to real auth pages:
  - **Sign In** → `/login`
  - **Sign Up** / **Get Started** → `/signup`
  - **Donate a Device** → `/donor/register`
  - **I Need a Device** → `/recipient/apply`

## File Changes

### File: `src/pages/Index.tsx`

Replace the blank placeholder with a functional homepage that mirrors the Landing page structure but with working auth links.

**Key Differences from Landing.tsx:**
| Element | Landing.tsx | Index.tsx (new) |
|---------|-------------|-----------------|
| Sign In button | → `/coming-soon` | → `/login` |
| Get Started button | → `/coming-soon` | → `/signup` |
| Donate a Device | → `/coming-soon` | → `/donor/register` |
| I Need a Device | → `/coming-soon` | → `/recipient/apply` |
| Join Waitlist CTA | Shows waitlist modal | Shows "Get Started" to `/signup` |

**Structure:**
- Navbar with working auth buttons
- Hero section with working CTAs
- Stats section (same as Landing)
- How It Works section (same as Landing)
- Success Stories section (same as Landing)
- Final CTA section with working links
- Footer

## How to Navigate Between Pages
- **Landing page (pre-launch)**: `/` - buttons go to coming-soon
- **Working homepage (dev/testing)**: `/dev` - buttons go to real auth pages

## Result
You'll have two versions of the homepage:
1. `/` - Public landing with waitlist focus (for pre-launch)
2. `/dev` - Fully functional with working auth (for development/testing)
