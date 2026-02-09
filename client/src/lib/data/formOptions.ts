export const donorTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company / Startup' },
  { value: 'community', label: 'Community / DAO / NGO' },
] as const;

export const organizationRoles = [
  { value: 'founder', label: 'Founder' },
  { value: 'ceo', label: 'CEO' },
  { value: 'hr', label: 'HR Manager' },
  { value: 'community_lead', label: 'Community Lead' },
  { value: 'operations', label: 'Operations Manager' },
  { value: 'other', label: 'Other' },
] as const;

export const deviceTypes = [
  { value: 'phones', label: 'Phones', donorOnly: false },
  { value: 'laptops', label: 'Laptops', donorOnly: false },
  { value: 'tablets', label: 'Tablets', donorOnly: false },
  { value: 'desktop_pcs', label: 'Desktop PCs', donorOnly: false },
  { value: 'monitors_peripherals', label: 'Monitors & Peripherals', donorOnly: false },
  { value: 'external_storage', label: 'External Storage', donorOnly: false },
  { value: 'creator_tools', label: 'Creator Tools', donorOnly: false },
  { value: 'cash', label: 'Cash (to fund a device)', donorOnly: true },
  { value: 'not_sure', label: 'Not sure yet', donorOnly: true },
] as const;

export const ageRanges = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_24', label: '18–24' },
  { value: '25_35', label: '25–35' },
  { value: '35+', label: '35+' },
] as const;

export const timingOptions = [
  { value: 'immediately', label: 'Immediately at launch' },
  { value: '1_3_months', label: 'Within 1–3 months' },
  { value: 'not_sure', label: 'Not sure' },
] as const;

export const deviceCounts = [
  { value: '1', label: '1' },
  { value: '2_5', label: '2–5' },
  { value: '5+', label: '5+' },
] as const;

export const currentStatusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_learning', label: 'Self-learning / Upskilling' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'early_founder', label: 'Early-stage founder' },
  { value: 'other', label: 'Other' },
] as const;

export const learningInterests = [
  { value: 'tech', label: 'Tech (coding, design, AI, Web3, etc.)' },
  { value: 'content_creation', label: 'Content creation' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
] as const;

export const currentDeviceStatusOptions = [
  { value: 'none', label: 'None' },
  { value: 'broken', label: 'Broken / unusable' },
  { value: 'shared', label: 'Shared device' },
  { value: 'slow', label: 'Old but slow device' },
] as const;

export type DonorType = typeof donorTypes[number]['value'];
export type OrganizationRole = typeof organizationRoles[number]['value'];
export type DeviceType = typeof deviceTypes[number]['value'];
export type AgeRange = typeof ageRanges[number]['value'];
export type TimingOption = typeof timingOptions[number]['value'];
export type DeviceCount = typeof deviceCounts[number]['value'];
export type CurrentStatus = typeof currentStatusOptions[number]['value'];
export type LearningInterest = typeof learningInterests[number]['value'];
export type CurrentDeviceStatus = typeof currentDeviceStatusOptions[number]['value'];
