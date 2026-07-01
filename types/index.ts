export type IdeaStatus = 'draft' | 'scheduled' | 'in_progress' | 'executed';

export type CommunityTag =
  | 'hispanic_latino'
  | 'south_asian'
  | 'east_asian'
  | 'african'
  | 'caribbean'
  | 'middle_eastern'
  | 'eastern_european'
  | 'general';

export type FinancialTheme =
  | 'banking_basics'
  | 'credit_building'
  | 'budgeting'
  | 'taxes'
  | 'investing'
  | 'remittances'
  | 'insurance'
  | 'homeownership'
  | 'retirement'
  | 'entrepreneurship'
  | 'debt_management'
  | 'emergency_fund';

export type MilestoneTopicStatus = 'not_started' | 'in_progress' | 'published';

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'podcast';

export interface Idea {
  id: string;
  title: string;
  description?: string;
  theme?: FinancialTheme;
  community_tags?: CommunityTag[];
  status: IdeaStatus;
  scheduled_date?: string;
  holiday_link?: string;
  milestone_stage_id?: string;
  milestone_topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPoint {
  id: string;
  idea_id: string;
  text: string;
  is_completed: boolean;
  ai_generated: boolean;
  sort_order: number;
  created_at: string;
}

export interface AIMessage {
  id: string;
  idea_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface HolidayEvent {
  name: string;
  date: string;
  type: 'financial' | 'cultural' | 'national';
  communities?: CommunityTag[];
  description?: string;
}

export interface MilestoneTopic {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  communities: CommunityTag[];
  visaTypes?: string[];
}

export interface LifeStage {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  emoji: string;
  description: string;
  timeline: string;
  topics: MilestoneTopic[];
}

export interface MilestoneProgress {
  id: string;
  stage_id: string;
  topic_id: string;
  status: MilestoneTopicStatus;
  idea_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  platforms: Platform[];
  communities: CommunityTag[];
  timezone: string;
  posting_days: string[];
  reminders_enabled: boolean;
  engagement_alerts: boolean;
  deadline_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostingInsight {
  platform: Platform;
  day: string;
  timeWindow: string;
  label: string;
  score: number;
  community?: CommunityTag;
  tip: string;
}
