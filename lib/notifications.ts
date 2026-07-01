import { Platform, PostingInsight, CommunityTag } from '../types';
import { getDay, getHours, format } from 'date-fns';

export const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string; color: string; emoji: string }> = {
  youtube:   { label: 'YouTube',   icon: 'youtube',          color: '#FF0000', emoji: '▶️' },
  instagram: { label: 'Instagram', icon: 'instagram',        color: '#E1306C', emoji: '📸' },
  tiktok:    { label: 'TikTok',    icon: 'music-note',       color: '#010101', emoji: '🎵' },
  facebook:  { label: 'Facebook',  icon: 'facebook',         color: '#1877F2', emoji: '👥' },
  linkedin:  { label: 'LinkedIn',  icon: 'linkedin',         color: '#0A66C2', emoji: '💼' },
  podcast:   { label: 'Podcast',   icon: 'microphone',       color: '#8940FA', emoji: '🎙️' },
};

type DayName = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
const DAY_NAMES: DayName[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface PlatformSchedule {
  bestDays: DayName[];
  bestHours: number[];
  communityPeak: Partial<Record<CommunityTag, { days: DayName[]; hours: number[]; note: string }>>;
  tip: string;
}

const POSTING_SCHEDULES: Record<Platform, PlatformSchedule> = {
  youtube: {
    bestDays: ['tuesday', 'wednesday', 'thursday', 'saturday'],
    bestHours: [14, 15, 16, 20],
    communityPeak: {
      hispanic_latino: { days: ['friday', 'saturday'], hours: [19, 20, 21], note: 'Friday evenings & Saturday after family time' },
      south_asian:     { days: ['saturday', 'sunday'], hours: [9, 10, 20, 21], note: 'Weekend mornings & evenings' },
      african:         { days: ['saturday', 'sunday'], hours: [10, 11, 18, 19], note: 'Weekend midday and early evening' },
      east_asian:      { days: ['tuesday', 'thursday'], hours: [12, 19, 20], note: 'Lunch break and after dinner' },
      caribbean:       { days: ['saturday'], hours: [14, 15, 20], note: 'Saturday afternoon' },
    },
    tip: 'Upload Tue–Thu for the weekday algorithm boost; Saturday for immigrant audiences with weekend schedules.',
  },
  instagram: {
    bestDays: ['monday', 'tuesday', 'wednesday', 'friday'],
    bestHours: [6, 7, 12, 17, 18],
    communityPeak: {
      hispanic_latino: { days: ['wednesday', 'friday'], hours: [18, 19, 20], note: 'Evening scrolling after work' },
      south_asian:     { days: ['tuesday', 'thursday'], hours: [7, 8, 21], note: 'Morning commute & late evening' },
      african:         { days: ['monday', 'wednesday'], hours: [12, 13, 18], note: 'Lunch and early evening' },
    },
    tip: 'Reels on Tue/Thu 9am–12pm, carousels on Mon/Fri afternoons. Stories daily for reminders.',
  },
  tiktok: {
    bestDays: ['tuesday', 'wednesday', 'thursday', 'friday'],
    bestHours: [9, 10, 11, 19, 20, 21],
    communityPeak: {
      hispanic_latino: { days: ['thursday', 'friday'], hours: [20, 21, 22], note: 'Late evening, high Spanish content engagement' },
      south_asian:     { days: ['wednesday', 'thursday'], hours: [9, 10, 20], note: 'Morning and post-dinner scrolling' },
      african:         { days: ['tuesday', 'wednesday'], hours: [19, 20, 21], note: 'Evening, high diaspora engagement midweek' },
    },
    tip: 'Post 2–3x weekly minimum. Financial content performs best Tue–Thu. Use trending audio.',
  },
  facebook: {
    bestDays: ['wednesday', 'thursday', 'friday'],
    bestHours: [13, 14, 15],
    communityPeak: {
      hispanic_latino: { days: ['wednesday', 'friday'], hours: [12, 13, 19], note: 'Lunch and evening — high group activity' },
      african:         { days: ['thursday', 'friday'], hours: [14, 15], note: 'Afternoon engagement in community groups' },
      east_asian:      { days: ['tuesday', 'wednesday'], hours: [12, 13], note: 'Lunch hour engagement' },
    },
    tip: 'Facebook Groups are gold for immigrant audiences. Post in niche community groups, not just your page.',
  },
  linkedin: {
    bestDays: ['tuesday', 'wednesday', 'thursday'],
    bestHours: [8, 9, 12, 17],
    communityPeak: {
      south_asian:    { days: ['tuesday', 'wednesday'], hours: [8, 9, 17], note: 'Professional South Asian diaspora is highly active here' },
      east_asian:     { days: ['wednesday', 'thursday'], hours: [8, 12], note: 'Morning and lunch content' },
      eastern_european: { days: ['tuesday', 'thursday'], hours: [9, 12], note: 'Professional eastern European immigrants' },
    },
    tip: 'LinkedIn immigrants are often H-1B / professional visa holders. Business + personal finance content converts well.',
  },
  podcast: {
    bestDays: ['monday', 'tuesday', 'wednesday'],
    bestHours: [6, 7, 8, 17, 18],
    communityPeak: {
      south_asian:    { days: ['monday', 'wednesday'], hours: [7, 8, 17, 18], note: 'Commute time — South Asian professionals' },
      east_asian:     { days: ['tuesday', 'thursday'], hours: [7, 8], note: 'Morning commute listeners' },
      hispanic_latino: { days: ['monday', 'friday'], hours: [17, 18], note: 'End-of-day commute and evening walks' },
    },
    tip: 'Release Monday or Tuesday so commuters discover it Mon–Wed. Keep episodes 15–25 min for immigrant audiences.',
  },
};

export function getTodayInsights(
  platforms: Platform[],
  communities: CommunityTag[]
): PostingInsight[] {
  const now = new Date();
  const todayIndex = getDay(now);
  const todayName = DAY_NAMES[todayIndex];
  const insights: PostingInsight[] = [];

  for (const platform of platforms) {
    const schedule = POSTING_SCHEDULES[platform];
    const isGoodDay = schedule.bestDays.includes(todayName);

    // Check community-specific peaks first
    for (const community of communities) {
      const peak = schedule.communityPeak[community];
      if (peak && peak.days.includes(todayName)) {
        const windows = peak.hours.map(h => `${h}:00${h < 12 ? 'am' : 'pm'}`);
        insights.push({
          platform,
          day: todayName,
          timeWindow: formatHoursToWindow(peak.hours),
          label: `${PLATFORM_CONFIG[platform].label} — ${communityLabel(community)}`,
          score: 90,
          community,
          tip: peak.note,
        });
      }
    }

    // General good day
    if (isGoodDay && insights.filter(i => i.platform === platform).length === 0) {
      insights.push({
        platform,
        day: todayName,
        timeWindow: formatHoursToWindow(schedule.bestHours),
        label: `${PLATFORM_CONFIG[platform].label}`,
        score: 70,
        tip: schedule.tip,
      });
    }
  }

  return insights.sort((a, b) => b.score - a.score).slice(0, 3);
}

export function getWeeklyBestTimes(
  platform: Platform,
  community?: CommunityTag
): Array<{ day: DayName; timeWindow: string; score: number }> {
  const schedule = POSTING_SCHEDULES[platform];
  return DAY_NAMES.map(day => {
    const communityPeak = community ? schedule.communityPeak[community] : undefined;
    const isCommunityPeak = communityPeak?.days.includes(day) ?? false;
    const isGeneralBest = schedule.bestDays.includes(day);

    const hours = isCommunityPeak
      ? (communityPeak?.hours ?? schedule.bestHours)
      : schedule.bestHours;

    return {
      day,
      timeWindow: formatHoursToWindow(hours),
      score: isCommunityPeak ? 90 : isGeneralBest ? 70 : 30,
    };
  }).sort((a, b) => b.score - a.score);
}

export function getContentReminders(daysAhead = 7): Array<{ message: string; urgency: 'high' | 'medium' | 'low'; daysUntil: number }> {
  const reminders = [];
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Tax season
  if (month === 3 || (month === 4 && day < 10)) {
    reminders.push({ message: 'Tax season ends April 15 — do you have ITIN, 1040-NR, and self-employed content ready?', urgency: 'high' as const, daysUntil: Math.max(0, (new Date(now.getFullYear(), 3, 15).getTime() - now.getTime()) / 86400000 | 0) });
  }
  if (month === 1) {
    reminders.push({ message: 'W-2 forms due Jan 31 — great time to post "how to read your W-2" content', urgency: 'high' as const, daysUntil: Math.max(0, (new Date(now.getFullYear(), 0, 31).getTime() - now.getTime()) / 86400000 | 0) });
  }
  if (month === 10 || month === 11) {
    reminders.push({ message: 'Open enrollment (Nov 1–Dec 15) — health insurance content for immigrant audiences', urgency: 'high' as const, daysUntil: month === 10 ? 30 - day : 0 });
  }
  if (month === 9 && day >= 10 && day <= 20) {
    reminders.push({ message: 'Hispanic Heritage Month starts Sept 15 — schedule your Latino financial empowerment series', urgency: 'high' as const, daysUntil: Math.max(0, 15 - day) });
  }
  if (month === 7 || (month === 8 && day < 20)) {
    reminders.push({ message: 'Back to school season — education savings, DACA scholarships, and student loans for immigrants', urgency: 'medium' as const, daysUntil: 14 });
  }

  // Weekly default
  reminders.push({ message: 'Consistency is key — aim for 2–3 posts this week. What\'s your next financial literacy topic?', urgency: 'low' as const, daysUntil: 0 });

  return reminders.slice(0, 3);
}

function formatHoursToWindow(hours: number[]): string {
  if (hours.length === 0) return '';
  const sorted = [...hours].sort((a, b) => a - b);
  const fmt = (h: number) => h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`;

  // Group consecutive hours into ranges
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] <= 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? fmt(start) : `${fmt(start)}–${fmt(end)}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? fmt(start) : `${fmt(start)}–${fmt(end)}`);
  return ranges.join(', ');
}

function communityLabel(c: CommunityTag): string {
  const labels: Record<CommunityTag, string> = {
    hispanic_latino: 'Hispanic/Latino audience',
    south_asian: 'South Asian audience',
    east_asian: 'East Asian audience',
    african: 'African diaspora',
    caribbean: 'Caribbean audience',
    middle_eastern: 'Middle Eastern audience',
    eastern_european: 'Eastern European audience',
    general: 'General immigrant audience',
  };
  return labels[c];
}

export { POSTING_SCHEDULES };
