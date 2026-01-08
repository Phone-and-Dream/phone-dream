// Types for the application
export interface Recipient {
  id: string;
  name: string;
  avatar: string;
  coverPhoto: string;
  tagline: string;
  creatorType: 'Developer' | 'Designer' | 'Entrepreneur' | 'Content Creator' | 'Student';
  location: string;
  country: string;
  schoolOrCareer: string;
  institution: string;
  memberSince: string;
  isVerified: boolean;
  xp: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  leaderboardPosition: number;
  totalRecipients: number;
  deviceReceived?: DeviceReceived;
  skills: Skill[];
  courses: Course[];
  projects: Project[];
  milestones: Milestone[];
  communities: Community[];
  events: EventItem[];
  updates: Update[];
  journey: JourneyEvent[];
  stats: RecipientStats;
}

export interface DeviceReceived {
  type: string;
  specs: string;
  condition: 'New' | 'Refurbished';
  donorName: string;
  donorId: string;
  dateReceived: string;
  txHash: string;
  quote: string;
}

export interface Skill {
  name: string;
  category: 'Technical' | 'Creative' | 'Business' | 'Soft Skills';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  isVerified: boolean;
  isNew: boolean;
}

export interface Course {
  id: string;
  name: string;
  provider: string;
  thumbnail: string;
  status: 'completed' | 'in_progress';
  progress: number;
  completionDate?: string;
  certificateUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  techStack: string[];
  status: 'Completed' | 'In Progress' | 'Planned';
  isFeatured: boolean;
  liveUrl?: string;
  githubUrl?: string;
  builtWithDonatedDevice: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Learning' | 'Project' | 'Community' | 'Impact';
  isAchieved: boolean;
  achievedDate?: string;
  progress?: number;
}

export interface Community {
  id: string;
  name: string;
  logo: string;
  memberCount: number;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  description: string;
  isUpcoming: boolean;
}

export interface Update {
  id: string;
  date: string;
  title: string;
  content: string;
  image?: string;
}

export interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  type: 'application' | 'device' | 'project' | 'milestone';
}

export interface RecipientStats {
  projectsCompleted: number;
  skillsLearned: number;
  coursesFinished: number;
  communitiesJoined: number;
  daysSinceDevice: number;
}

export interface Donor {
  id: string;
  name: string;
  avatar: string;
  type: 'Individual' | 'Organization';
  location: string;
  memberSince: string;
  stats: DonorStats;
  donations: Donation[];
}

export interface DonorStats {
  totalDonated: number;
  recipientsHelped: number;
  regionsReached: number;
}

export interface Donation {
  id: string;
  deviceType: string;
  condition: 'New' | 'Refurbished';
  recipientName?: string;
  recipientId?: string;
  status: 'Pending' | 'Matched' | 'Delivered';
  date: string;
  txHash?: string;
  donorId?: string;
  donorName?: string;
}

export interface DreamRequest {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  deviceNeeded: string;
  purpose: string;
  creatorType: string;
  xpRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  region: string;
  needsRefurbishing: boolean;
  milestones: string[];
  timeline: string;
  datePosted: string;
}

export interface Application {
  id: string;
  recipientName: string;
  email: string;
  location: string;
  creatorType: string;
  schoolOrCareer: string;
  institution: string;
  purpose: string;
  references: Reference[];
  referenceLetterUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  referencesValidated?: boolean[];
}

export interface Reference {
  name: string;
  relationship: string;
  contact: string;
  isValidated?: boolean;
}

export interface XPRule {
  id: string;
  action: string;
  xpValue: number;
  description: string;
  isActive: boolean;
}

export interface RankThreshold {
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minXP: number;
  maxXP: number | null;
  icon: string;
}

export interface AttestationLog {
  id: string;
  txHash: string;
  deviceType: string;
  donorName: string;
  recipientName: string;
  date: string;
  network: string;
}

export interface XPAdjustment {
  id: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  reason: string;
  adminName: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  type: 'application' | 'donation' | 'match' | 'delivery' | 'approval';
  description: string;
  timestamp: string;
  user?: string;
}

// Mock Data
export const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Amara Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    coverPhoto: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
    tagline: 'Aspiring Mobile Developer',
    creatorType: 'Developer',
    location: 'Lagos',
    country: 'Nigeria',
    schoolOrCareer: 'Computer Science Student',
    institution: 'University of Lagos',
    memberSince: '2024-03-15',
    isVerified: true,
    xp: 2450,
    rank: 'Gold',
    leaderboardPosition: 3,
    totalRecipients: 156,
    deviceReceived: {
      type: 'MacBook Air M1',
      specs: '8GB RAM, 256GB SSD',
      condition: 'Refurbished',
      donorName: 'Tech Forward Foundation',
      donorId: 'd1',
      dateReceived: '2024-04-20',
      txHash: '0x7a3b...9f2c',
      quote: 'This device has completely transformed my ability to learn and build. I can finally run development environments!'
    },
    skills: [
      { name: 'React Native', category: 'Technical', level: 'Intermediate', progress: 65, isVerified: true, isNew: false },
      { name: 'JavaScript', category: 'Technical', level: 'Advanced', progress: 85, isVerified: true, isNew: false },
      { name: 'UI/UX Design', category: 'Creative', level: 'Beginner', progress: 40, isVerified: false, isNew: true },
      { name: 'Problem Solving', category: 'Soft Skills', level: 'Advanced', progress: 90, isVerified: true, isNew: false },
      { name: 'Git & GitHub', category: 'Technical', level: 'Intermediate', progress: 70, isVerified: true, isNew: false },
    ],
    courses: [
      { id: 'c1', name: 'The Complete React Native Course', provider: 'Udemy', thumbnail: '📱', status: 'completed', progress: 100, completionDate: '2024-06-15', certificateUrl: '#' },
      { id: 'c2', name: 'JavaScript Algorithms', provider: 'freeCodeCamp', thumbnail: '🧮', status: 'completed', progress: 100, completionDate: '2024-05-20', certificateUrl: '#' },
      { id: 'c3', name: 'CS50 Introduction to Computer Science', provider: 'Harvard/edX', thumbnail: '🎓', status: 'in_progress', progress: 72 },
      { id: 'c4', name: 'UI/UX Design Fundamentals', provider: 'Coursera', thumbnail: '🎨', status: 'in_progress', progress: 35 },
    ],
    projects: [
      { id: 'p1', name: 'FarmConnect', description: 'Mobile app connecting local farmers to buyers', thumbnail: '🌾', techStack: ['React Native', 'Firebase', 'Expo'], status: 'Completed', isFeatured: true, liveUrl: '#', githubUrl: '#', builtWithDonatedDevice: true },
      { id: 'p2', name: 'StudyBuddy', description: 'Peer tutoring platform for university students', thumbnail: '📚', techStack: ['React', 'Node.js', 'MongoDB'], status: 'In Progress', isFeatured: false, githubUrl: '#', builtWithDonatedDevice: true },
      { id: 'p3', name: 'Weather Dashboard', description: 'Real-time weather tracking app', thumbnail: '⛅', techStack: ['JavaScript', 'API Integration'], status: 'Completed', isFeatured: false, liveUrl: '#', builtWithDonatedDevice: true },
    ],
    milestones: [
      { id: 'm1', title: 'First Course Completed', description: 'Completed first online course', icon: '🎯', category: 'Learning', isAchieved: true, achievedDate: '2024-05-20' },
      { id: 'm2', title: 'First Project Launched', description: 'Deployed first project live', icon: '🚀', category: 'Project', isAchieved: true, achievedDate: '2024-07-10' },
      { id: 'm3', title: 'Community Contributor', description: 'Helped 5 peers with coding', icon: '🤝', category: 'Community', isAchieved: true, achievedDate: '2024-08-05' },
      { id: 'm4', title: 'First Freelance Gig', description: 'Earned first income from skills', icon: '💰', category: 'Impact', isAchieved: false, progress: 60 },
      { id: 'm5', title: '10 Projects Master', description: 'Complete 10 projects', icon: '⭐', category: 'Project', isAchieved: false, progress: 30 },
    ],
    communities: [
      { id: 'com1', name: 'React Native Nigeria', logo: '⚛️', memberCount: 2340 },
      { id: 'com2', name: 'DevCareer Africa', logo: '🌍', memberCount: 15000 },
      { id: 'com3', name: 'She Code Africa', logo: '👩‍💻', memberCount: 8500 },
    ],
    events: [
      { id: 'e1', name: 'Lagos Tech Summit', date: '2024-09-15', description: 'Annual tech conference', isUpcoming: false },
      { id: 'e2', name: 'React Conf Nigeria', date: '2025-02-20', description: 'React community meetup', isUpcoming: true },
    ],
    updates: [
      { id: 'u1', date: '2024-11-28', title: 'Completed FarmConnect MVP!', content: 'So excited to announce that my farmer marketplace app is now live. This journey started with just a dream and a donated laptop. Thank you to everyone who believed in me!', image: '🎉' },
      { id: 'u2', date: '2024-10-15', title: 'Learning UI/UX Design', content: 'Started diving into design principles. Building beautiful interfaces is harder than I thought, but I love the challenge!' },
    ],
    journey: [
      { id: 'j1', date: '2024-03-15', title: 'Application Approved', description: 'Joined the A Phone and A Dream community', icon: '✅', type: 'application' },
      { id: 'j2', date: '2024-04-20', title: 'Device Received', description: 'Received MacBook Air from Tech Forward Foundation', icon: '💻', type: 'device' },
      { id: 'j3', date: '2024-07-10', title: 'First Project Launched', description: 'Deployed FarmConnect to the App Store', icon: '🚀', type: 'project' },
      { id: 'j4', date: '2024-08-05', title: 'Community Milestone', description: 'Helped 5 peers learn to code', icon: '🤝', type: 'milestone' },
    ],
    stats: {
      projectsCompleted: 2,
      skillsLearned: 5,
      coursesFinished: 2,
      communitiesJoined: 3,
      daysSinceDevice: 256
    }
  },
  {
    id: '2',
    name: 'David Mensah',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverPhoto: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
    tagline: 'UI/UX Designer & Illustrator',
    creatorType: 'Designer',
    location: 'Accra',
    country: 'Ghana',
    schoolOrCareer: 'Freelance Designer',
    institution: 'Self-taught',
    memberSince: '2024-01-10',
    isVerified: true,
    xp: 3200,
    rank: 'Platinum',
    leaderboardPosition: 1,
    totalRecipients: 156,
    deviceReceived: {
      type: 'iPad Pro 12.9"',
      specs: 'M2 chip, 256GB, with Apple Pencil',
      condition: 'New',
      donorName: 'Creative Futures Initiative',
      donorId: 'd2',
      dateReceived: '2024-02-15',
      txHash: '0x8b4c...3e1d',
      quote: 'Having a proper drawing tablet has elevated my design work tremendously. I can now compete with designers worldwide.'
    },
    skills: [
      { name: 'Figma', category: 'Technical', level: 'Advanced', progress: 95, isVerified: true, isNew: false },
      { name: 'Illustration', category: 'Creative', level: 'Advanced', progress: 90, isVerified: true, isNew: false },
      { name: 'Branding', category: 'Creative', level: 'Intermediate', progress: 70, isVerified: true, isNew: false },
      { name: 'Motion Design', category: 'Creative', level: 'Beginner', progress: 35, isVerified: false, isNew: true },
    ],
    courses: [
      { id: 'c1', name: 'Advanced Figma Masterclass', provider: 'Skillshare', thumbnail: '🎨', status: 'completed', progress: 100, completionDate: '2024-04-10', certificateUrl: '#' },
      { id: 'c2', name: 'Brand Identity Design', provider: 'Domestika', thumbnail: '✨', status: 'completed', progress: 100, completionDate: '2024-06-20', certificateUrl: '#' },
    ],
    projects: [
      { id: 'p1', name: 'Afrobeats Visual Identity', description: 'Complete brand system for music festival', thumbnail: '🎵', techStack: ['Figma', 'Illustrator', 'Procreate'], status: 'Completed', isFeatured: true, liveUrl: '#', builtWithDonatedDevice: true },
      { id: 'p2', name: 'HealthTech App Design', description: 'UI/UX for telemedicine platform', thumbnail: '🏥', techStack: ['Figma', 'Prototyping'], status: 'Completed', isFeatured: false, liveUrl: '#', builtWithDonatedDevice: true },
    ],
    milestones: [
      { id: 'm1', title: 'First Paid Client', description: 'Landed first freelance design gig', icon: '💰', category: 'Impact', isAchieved: true, achievedDate: '2024-05-15' },
      { id: 'm2', title: 'Portfolio Master', description: 'Built professional portfolio', icon: '🖼️', category: 'Project', isAchieved: true, achievedDate: '2024-04-01' },
    ],
    communities: [
      { id: 'com1', name: 'Dribbble Africa', logo: '🏀', memberCount: 5600 },
      { id: 'com2', name: 'Design Ghana', logo: '🇬🇭', memberCount: 1200 },
    ],
    events: [
      { id: 'e1', name: 'Design Week Accra', date: '2024-10-20', description: 'Annual design conference', isUpcoming: false },
    ],
    updates: [
      { id: 'u1', date: '2024-11-20', title: 'First $1000 Month!', content: 'Never thought I\'d earn this much from design. The iPad changed everything for me. Grateful every day.' },
    ],
    journey: [
      { id: 'j1', date: '2024-01-10', title: 'Application Approved', description: 'Joined the community', icon: '✅', type: 'application' },
      { id: 'j2', date: '2024-02-15', title: 'Device Received', description: 'Received iPad Pro with Apple Pencil', icon: '🎨', type: 'device' },
      { id: 'j3', date: '2024-05-15', title: 'First Income', description: 'Earned $250 from first client', icon: '💰', type: 'milestone' },
    ],
    stats: {
      projectsCompleted: 8,
      skillsLearned: 4,
      coursesFinished: 2,
      communitiesJoined: 2,
      daysSinceDevice: 320
    }
  },
  {
    id: '3',
    name: 'Fatima Hassan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverPhoto: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
    tagline: 'Tech Entrepreneur & Content Creator',
    creatorType: 'Entrepreneur',
    location: 'Nairobi',
    country: 'Kenya',
    schoolOrCareer: 'Startup Founder',
    institution: 'Strathmore University (Dropout)',
    memberSince: '2024-05-20',
    isVerified: true,
    xp: 1850,
    rank: 'Silver',
    leaderboardPosition: 8,
    totalRecipients: 156,
    skills: [
      { name: 'Business Development', category: 'Business', level: 'Intermediate', progress: 60, isVerified: false, isNew: false },
      { name: 'Video Editing', category: 'Creative', level: 'Beginner', progress: 45, isVerified: false, isNew: true },
      { name: 'Public Speaking', category: 'Soft Skills', level: 'Intermediate', progress: 65, isVerified: true, isNew: false },
    ],
    courses: [
      { id: 'c1', name: 'Startup School', provider: 'Y Combinator', thumbnail: '🚀', status: 'in_progress', progress: 55 },
    ],
    projects: [
      { id: 'p1', name: 'MamaPesa', description: 'Savings app for market women', thumbnail: '💰', techStack: ['No-code', 'Bubble'], status: 'In Progress', isFeatured: true, builtWithDonatedDevice: false },
    ],
    milestones: [
      { id: 'm1', title: 'Pitch Competition Winner', description: 'Won local startup pitch', icon: '🏆', category: 'Impact', isAchieved: true, achievedDate: '2024-09-10' },
    ],
    communities: [
      { id: 'com1', name: 'iHub Nairobi', logo: '🏢', memberCount: 4500 },
    ],
    events: [],
    updates: [
      { id: 'u1', date: '2024-11-25', title: 'Awaiting my device!', content: 'So excited to receive my laptop soon. Can\'t wait to take MamaPesa to the next level!' },
    ],
    journey: [
      { id: 'j1', date: '2024-05-20', title: 'Application Approved', description: 'Welcome to the community!', icon: '✅', type: 'application' },
    ],
    stats: {
      projectsCompleted: 0,
      skillsLearned: 3,
      coursesFinished: 0,
      communitiesJoined: 1,
      daysSinceDevice: 0
    }
  }
];

export const mockDonors: Donor[] = [
  {
    id: 'd1',
    name: 'Tech Forward Foundation',
    avatar: '🏛️',
    type: 'Organization',
    location: 'San Francisco, USA',
    memberSince: '2023-06-01',
    stats: {
      totalDonated: 45,
      recipientsHelped: 42,
      regionsReached: 8
    },
    donations: [
      { id: 'don1', deviceType: 'MacBook Air M1', condition: 'Refurbished', recipientName: 'Amara Okonkwo', recipientId: '1', status: 'Delivered', date: '2024-04-18', txHash: '0x7a3b...9f2c', donorId: 'd1', donorName: 'Tech Forward Foundation' },
      { id: 'don2', deviceType: 'MacBook Pro 14"', condition: 'New', recipientName: 'Kwame Asante', recipientId: '5', status: 'Delivered', date: '2024-03-10', txHash: '0x9c2e...4f1a', donorId: 'd1', donorName: 'Tech Forward Foundation' },
      { id: 'don3', deviceType: 'ThinkPad X1 Carbon', condition: 'Refurbished', status: 'Matched', date: '2024-11-20', donorId: 'd1', donorName: 'Tech Forward Foundation' },
      { id: 'don4', deviceType: 'MacBook Air M2', condition: 'New', status: 'Pending', date: '2024-11-28', donorId: 'd1', donorName: 'Tech Forward Foundation' },
    ]
  },
  {
    id: 'd2',
    name: 'Creative Futures Initiative',
    avatar: '🎨',
    type: 'Organization',
    location: 'London, UK',
    memberSince: '2023-09-15',
    stats: {
      totalDonated: 28,
      recipientsHelped: 25,
      regionsReached: 6
    },
    donations: [
      { id: 'don5', deviceType: 'iPad Pro 12.9"', condition: 'New', recipientName: 'David Mensah', recipientId: '2', status: 'Delivered', date: '2024-02-12', txHash: '0x8b4c...3e1d', donorId: 'd2', donorName: 'Creative Futures Initiative' },
      { id: 'don6', deviceType: 'Wacom Tablet', condition: 'New', recipientName: 'Grace Adeyemi', recipientId: '6', status: 'Delivered', date: '2024-05-08', txHash: '0x2d5f...7b3c', donorId: 'd2', donorName: 'Creative Futures Initiative' },
    ]
  },
  {
    id: 'd3',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    type: 'Individual',
    location: 'Toronto, Canada',
    memberSince: '2024-02-20',
    stats: {
      totalDonated: 3,
      recipientsHelped: 3,
      regionsReached: 2
    },
    donations: [
      { id: 'don7', deviceType: 'iPhone 12', condition: 'Refurbished', recipientName: 'Samuel Otieno', recipientId: '7', status: 'Delivered', date: '2024-06-15', txHash: '0x4e8a...2c9f', donorId: 'd3', donorName: 'Michael Chen' },
      { id: 'don8', deviceType: 'Samsung Galaxy Tab', condition: 'Refurbished', status: 'Matched', date: '2024-10-30', donorId: 'd3', donorName: 'Michael Chen' },
    ]
  },
  {
    id: 'd4',
    name: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    type: 'Individual',
    location: 'Austin, USA',
    memberSince: '2024-08-10',
    stats: {
      totalDonated: 1,
      recipientsHelped: 0,
      regionsReached: 0
    },
    donations: [
      { id: 'don9', deviceType: 'Dell XPS 13', condition: 'New', status: 'Pending', date: '2024-11-25', donorId: 'd4', donorName: 'Sarah Williams' },
    ]
  }
];

export const mockDreamRequests: DreamRequest[] = [
  {
    id: 'dr1',
    recipientId: '3',
    recipientName: 'Fatima Hassan',
    recipientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    deviceNeeded: 'Laptop',
    purpose: 'Building MamaPesa - a savings app to help market women in Kenya save and access microloans. Need a laptop to code and run my startup.',
    creatorType: 'Entrepreneur',
    xpRank: 'Silver',
    region: 'East Africa',
    needsRefurbishing: false,
    milestones: ['Launch MVP in 3 months', 'Onboard 100 users in 6 months', 'Secure seed funding'],
    timeline: '6 months',
    datePosted: '2024-11-15'
  },
  {
    id: 'dr2',
    recipientId: '8',
    recipientName: 'Emmanuel Nwachukwu',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    deviceNeeded: 'Smartphone',
    purpose: 'I create educational TikTok content about African history. A better phone would let me shoot and edit high-quality videos.',
    creatorType: 'Content Creator',
    xpRank: 'Bronze',
    region: 'West Africa',
    needsRefurbishing: true,
    milestones: ['Reach 10K followers', 'Launch YouTube channel', 'Collaborate with schools'],
    timeline: '4 months',
    datePosted: '2024-11-20'
  },
  {
    id: 'dr3',
    recipientId: '9',
    recipientName: 'Aisha Mohamed',
    recipientAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
    deviceNeeded: 'Tablet',
    purpose: 'Studying medicine remotely. Need a tablet for accessing medical resources, attending virtual lectures, and studying anatomy.',
    creatorType: 'Student',
    xpRank: 'Bronze',
    region: 'North Africa',
    needsRefurbishing: false,
    milestones: ['Complete first year', 'Join medical study group', 'Start clinical rotations research'],
    timeline: '12 months',
    datePosted: '2024-11-22'
  },
  {
    id: 'dr4',
    recipientId: '10',
    recipientName: 'James Oduya',
    recipientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    deviceNeeded: 'Laptop',
    purpose: 'Backend developer learning cloud technologies. Need a powerful laptop to run Docker, Kubernetes, and practice AWS/GCP.',
    creatorType: 'Developer',
    xpRank: 'Silver',
    region: 'East Africa',
    needsRefurbishing: false,
    milestones: ['Get AWS certified', 'Build 3 microservices projects', 'Land remote job'],
    timeline: '8 months',
    datePosted: '2024-11-10'
  },
  {
    id: 'dr5',
    recipientId: '11',
    recipientName: 'Chioma Eze',
    recipientAvatar: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=200&h=200&fit=crop',
    deviceNeeded: 'PC',
    purpose: 'Game developer and 3D artist. Need a desktop PC with GPU for Unity development and Blender 3D modeling.',
    creatorType: 'Developer',
    xpRank: 'Gold',
    region: 'West Africa',
    needsRefurbishing: false,
    milestones: ['Complete first indie game', 'Publish on Steam', 'Build game dev community'],
    timeline: '10 months',
    datePosted: '2024-11-18'
  },
  {
    id: 'dr6',
    recipientId: '12',
    recipientName: 'Blessing Adebayo',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    deviceNeeded: 'Laptop',
    purpose: 'Fashion designer transitioning to digital. Need laptop for CAD software, pattern making, and running my online store.',
    creatorType: 'Designer',
    xpRank: 'Bronze',
    region: 'West Africa',
    needsRefurbishing: true,
    milestones: ['Learn CLO 3D', 'Launch digital collection', 'Get 50 online orders'],
    timeline: '6 months',
    datePosted: '2024-11-24'
  },
  {
    id: 'dr7',
    recipientId: '13',
    recipientName: 'Peter Kimani',
    recipientAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    deviceNeeded: 'Smartphone',
    purpose: 'Agricultural consultant helping farmers. Need a phone with good camera for field documentation and running farm management apps.',
    creatorType: 'Entrepreneur',
    xpRank: 'Silver',
    region: 'East Africa',
    needsRefurbishing: false,
    milestones: ['Consult for 20 farms', 'Build farmer network app', 'Train 5 local consultants'],
    timeline: '5 months',
    datePosted: '2024-11-08'
  },
  {
    id: 'dr8',
    recipientId: '14',
    recipientName: 'Nana Asante',
    recipientAvatar: 'https://images.unsplash.com/photo-1507152927826-86d2e3e94f3e?w=200&h=200&fit=crop',
    deviceNeeded: 'Tablet',
    purpose: 'Music producer and teacher. Need tablet for music production on the go and teaching students music theory.',
    creatorType: 'Content Creator',
    xpRank: 'Bronze',
    region: 'West Africa',
    needsRefurbishing: true,
    milestones: ['Release first EP', 'Teach 15 students', 'Build home studio'],
    timeline: '7 months',
    datePosted: '2024-11-21'
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    recipientName: 'Grace Mwangi',
    email: 'grace.mwangi@email.com',
    location: 'Mombasa, Kenya',
    creatorType: 'Developer',
    schoolOrCareer: 'Computer Science Student',
    institution: 'Technical University of Mombasa',
    purpose: 'I want to build apps that help local fishermen track weather patterns and market prices.',
    references: [
      { name: 'Prof. John Kamau', relationship: 'Lecturer', contact: 'j.kamau@tum.ac.ke', isValidated: true },
      { name: 'Mary Wanjiku', relationship: 'Community Leader', contact: '+254712345678', isValidated: false }
    ],
    referenceLetterUrl: '#',
    status: 'pending',
    submittedDate: '2024-11-26'
  },
  {
    id: 'app2',
    recipientName: 'Yusuf Diallo',
    email: 'yusuf.diallo@email.com',
    location: 'Dakar, Senegal',
    creatorType: 'Designer',
    schoolOrCareer: 'Graphic Designer',
    institution: 'Self-taught',
    purpose: 'I design visuals for local NGOs and small businesses. A better device would help me take on international clients.',
    references: [
      { name: 'Aminata Sow', relationship: 'Former Client', contact: 'aminata@ngo.org', isValidated: false },
      { name: 'Ousmane Fall', relationship: 'Mentor', contact: '+221771234567', isValidated: false }
    ],
    referenceLetterUrl: '#',
    status: 'pending',
    submittedDate: '2024-11-25'
  },
  {
    id: 'app3',
    recipientName: 'Ruth Obi',
    email: 'ruth.obi@email.com',
    location: 'Enugu, Nigeria',
    creatorType: 'Content Creator',
    schoolOrCareer: 'YouTuber',
    institution: 'N/A',
    purpose: 'I create cooking content showcasing Nigerian cuisine. Need better equipment to improve video quality.',
    references: [
      { name: 'Chidi Okonkwo', relationship: 'Collaborator', contact: 'chidi@youtube.com', isValidated: false },
      { name: 'Ada Eze', relationship: 'Subscriber/Fan', contact: 'ada.eze@email.com', isValidated: false }
    ],
    referenceLetterUrl: '#',
    status: 'pending',
    submittedDate: '2024-11-24'
  }
];

export const mockXPRules: XPRule[] = [
  { id: 'xp1', action: 'Course Completed', xpValue: 100, description: 'Finish an online course with certificate', isActive: true },
  { id: 'xp2', action: 'Project Completed', xpValue: 150, description: 'Complete and deploy a project', isActive: true },
  { id: 'xp3', action: 'Skill Verified', xpValue: 50, description: 'Get a skill verified by community', isActive: true },
  { id: 'xp4', action: 'Community Joined', xpValue: 25, description: 'Join a professional community', isActive: true },
  { id: 'xp5', action: 'Recommendation Received', xpValue: 75, description: 'Receive a recommendation from peer or mentor', isActive: true },
  { id: 'xp6', action: 'Career Event Added', xpValue: 30, description: 'Add a career milestone to journey', isActive: true },
  { id: 'xp7', action: 'First Income Earned', xpValue: 200, description: 'Earn first income using skills', isActive: true },
  { id: 'xp8', action: 'Mentored Peer', xpValue: 100, description: 'Help another recipient learn', isActive: true },
];

export const mockRankThresholds: RankThreshold[] = [
  { rank: 'Bronze', minXP: 0, maxXP: 999, icon: '🥉' },
  { rank: 'Silver', minXP: 1000, maxXP: 1999, icon: '🥈' },
  { rank: 'Gold', minXP: 2000, maxXP: 2999, icon: '🥇' },
  { rank: 'Platinum', minXP: 3000, maxXP: null, icon: '💎' },
];

export const mockAttestationLogs: AttestationLog[] = [
  { id: 'att1', txHash: '0x7a3b...9f2c', deviceType: 'MacBook Air M1', donorName: 'Tech Forward Foundation', recipientName: 'Amara Okonkwo', date: '2024-04-20', network: 'Optimism' },
  { id: 'att2', txHash: '0x8b4c...3e1d', deviceType: 'iPad Pro 12.9"', donorName: 'Creative Futures Initiative', recipientName: 'David Mensah', date: '2024-02-15', network: 'Optimism' },
  { id: 'att3', txHash: '0x9c2e...4f1a', deviceType: 'MacBook Pro 14"', donorName: 'Tech Forward Foundation', recipientName: 'Kwame Asante', date: '2024-03-10', network: 'Optimism' },
  { id: 'att4', txHash: '0x2d5f...7b3c', deviceType: 'Wacom Tablet', donorName: 'Creative Futures Initiative', recipientName: 'Grace Adeyemi', date: '2024-05-08', network: 'Optimism' },
  { id: 'att5', txHash: '0x4e8a...2c9f', deviceType: 'iPhone 12', donorName: 'Michael Chen', recipientName: 'Samuel Otieno', date: '2024-06-15', network: 'Optimism' },
];

export const mockXPAdjustments: XPAdjustment[] = [
  { id: 'adj1', recipientId: '1', recipientName: 'Amara Okonkwo', amount: 50, reason: 'Bonus for exceptional project quality', adminName: 'Admin', date: '2024-10-15' },
  { id: 'adj2', recipientId: '2', recipientName: 'David Mensah', amount: 100, reason: 'Community contribution award', adminName: 'Admin', date: '2024-11-01' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'act1', type: 'application', description: 'Grace Mwangi submitted application', timestamp: '2024-11-26T10:30:00Z', user: 'Grace Mwangi' },
  { id: 'act2', type: 'donation', description: 'Sarah Williams donated Dell XPS 13', timestamp: '2024-11-25T14:15:00Z', user: 'Sarah Williams' },
  { id: 'act3', type: 'match', description: 'ThinkPad X1 matched to recipient', timestamp: '2024-11-20T09:00:00Z' },
  { id: 'act4', type: 'approval', description: 'Yusuf Diallo application under review', timestamp: '2024-11-25T16:45:00Z' },
  { id: 'act5', type: 'delivery', description: 'MacBook Air delivered to Amara', timestamp: '2024-04-20T11:00:00Z', user: 'Tech Forward Foundation' },
];

// Helper functions
export const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'Bronze': return 'badge-bronze';
    case 'Silver': return 'badge-silver';
    case 'Gold': return 'badge-gold';
    case 'Platinum': return 'badge-platinum';
    default: return 'bg-muted';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Delivered': return 'bg-success text-success-foreground';
    case 'Matched': return 'bg-info text-info-foreground';
    case 'Pending': return 'bg-warning text-warning-foreground';
    case 'approved': return 'bg-success text-success-foreground';
    case 'rejected': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get all donations flattened from all donors
export const getAllDonations = (): Donation[] => {
  return mockDonors.flatMap(donor => 
    donor.donations.map(d => ({
      ...d,
      donorId: donor.id,
      donorName: donor.name
    }))
  );
};
