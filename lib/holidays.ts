import { HolidayEvent } from '../types';
import { parseISO } from 'date-fns';

const y = new Date().getFullYear();

const FINANCIAL_EVENTS: HolidayEvent[] = [
  { name: 'W-2 Forms Due', date: `${y}-01-31`, type: 'financial', description: 'Employers must send W-2 — great time to cover wage documents for immigrants' },
  { name: 'Tax Filing Deadline', date: `${y}-04-15`, type: 'financial', description: 'Federal tax deadline — ITIN filers, 1040-NR, self-employed immigrants' },
  { name: 'Q1 Estimated Taxes Due', date: `${y}-04-15`, type: 'financial', description: 'Self-employed / freelance immigrants quarterly payment' },
  { name: 'Q2 Estimated Taxes Due', date: `${y}-06-17`, type: 'financial', description: 'Self-employed quarterly payment' },
  { name: 'Q3 Estimated Taxes Due', date: `${y}-09-16`, type: 'financial', description: 'Self-employed quarterly payment' },
  { name: 'ITIN Renewal Season', date: `${y}-08-01`, type: 'financial', communities: ['hispanic_latino', 'south_asian', 'east_asian', 'middle_eastern'], description: 'Remind viewers about ITIN expiration and renewal process' },
  { name: 'Open Enrollment Begins', date: `${y}-11-01`, type: 'financial', description: 'Health insurance open enrollment — coverage options for immigrants' },
  { name: 'Open Enrollment Ends', date: `${y}-12-15`, type: 'financial', description: 'Last day to enroll in marketplace health insurance' },
  { name: 'Year-End Financial Review', date: `${y}-12-01`, type: 'financial', description: 'Annual check-up — credit score, savings, tax prep, goals for next year' },
  { name: 'Q4 Estimated Taxes Due', date: `${y + 1}-01-15`, type: 'financial', description: 'Final quarterly tax payment of the year' },
];

const CULTURAL_EVENTS: HolidayEvent[] = [
  { name: "New Year's Day", date: `${y}-01-01`, type: 'national', description: 'New Year financial resolutions for immigrant families' },
  { name: 'Lunar New Year', date: `${y}-01-29`, type: 'cultural', communities: ['east_asian', 'south_asian'], description: 'Lucky money, family wealth, fresh financial start traditions' },
  { name: 'Black History Month', date: `${y}-02-01`, type: 'cultural', communities: ['african', 'caribbean'], description: 'Black wealth building, financial empowerment history' },
  { name: "Valentine's Day", date: `${y}-02-14`, type: 'national', description: 'Couples finances, joint accounts, budgeting as a family' },
  { name: 'Eid al-Fitr', date: `${y}-03-30`, type: 'cultural', communities: ['middle_eastern', 'african', 'south_asian'], description: 'Halal finance, zakat, Islamic banking basics' },
  { name: "Mother's Day", date: `${y}-05-11`, type: 'national', description: 'Sending money home, protecting parents abroad, life insurance' },
  { name: 'Asian American Heritage Month', date: `${y}-05-01`, type: 'cultural', communities: ['east_asian', 'south_asian'], description: 'Asian immigrant financial journeys and success stories' },
  { name: 'Eid al-Adha', date: `${y}-06-07`, type: 'cultural', communities: ['middle_eastern', 'african', 'south_asian'], description: 'Community giving, charitable financial planning' },
  { name: 'Caribbean American Heritage Month', date: `${y}-06-01`, type: 'cultural', communities: ['caribbean'], description: 'Caribbean diaspora financial stories and remittances' },
  { name: "Father's Day", date: `${y}-06-15`, type: 'national', description: 'Financial legacy, life insurance, wills for immigrant dads' },
  { name: 'Indian Independence Day', date: `${y}-08-15`, type: 'cultural', communities: ['south_asian'], description: 'NRI taxes, dual taxation treaty, foreign income reporting (FBAR)' },
  { name: 'Back to School', date: `${y}-08-20`, type: 'national', description: 'Education savings, scholarships for DACA/immigrants, 529 plans' },
  { name: 'Hispanic Heritage Month', date: `${y}-09-15`, type: 'cultural', communities: ['hispanic_latino'], description: 'Month-long Latino financial empowerment content series' },
  { name: 'Diwali', date: `${y}-10-20`, type: 'cultural', communities: ['south_asian'], description: 'Festival of prosperity — wealth building, gold investing traditions' },
  { name: 'Thanksgiving', date: `${y}-11-27`, type: 'national', description: 'Holiday spending budget, avoiding debt, family finance conversations' },
  { name: 'Kwanzaa', date: `${y}-12-26`, type: 'cultural', communities: ['african', 'caribbean'], description: 'Ujamaa (cooperative economics), community wealth building' },
  { name: 'Christmas', date: `${y}-12-25`, type: 'national', description: 'Holiday spending traps, gifting on a budget, post-holiday debt recovery' },
];

export const ALL_EVENTS: HolidayEvent[] = [...FINANCIAL_EVENTS, ...CULTURAL_EVENTS];

export function getUpcomingEvents(days = 30): HolidayEvent[] {
  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() + days);

  return ALL_EVENTS.filter(e => {
    const d = parseISO(e.date);
    return d >= today && d <= cutoff;
  }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
}

export function getEventsForDate(dateStr: string): HolidayEvent[] {
  return ALL_EVENTS.filter(e => e.date === dateStr);
}

export function buildCalendarMarkers(): Record<string, { dots: Array<{ key: string; color: string }> }> {
  const markers: Record<string, { dots: Array<{ key: string; color: string }> }> = {};
  ALL_EVENTS.forEach(event => {
    const color =
      event.type === 'financial' ? '#F57F17' :
      event.type === 'cultural' ? '#7B1FA2' : '#1565C0';
    if (!markers[event.date]) markers[event.date] = { dots: [] };
    markers[event.date].dots.push({ key: event.name, color });
  });
  return markers;
}

export function suggestHolidayForIdea(title: string, description = ''): HolidayEvent | null {
  const text = `${title} ${description}`.toLowerCase();
  const matches: Array<{ keywords: string[]; eventName: string }> = [
    { keywords: ['tax', 'irs', '1040', 'w-2', 'w2'], eventName: 'Tax Filing Deadline' },
    { keywords: ['itin'], eventName: 'ITIN Renewal Season' },
    { keywords: ['insurance', 'health plan', 'enrollment'], eventName: 'Open Enrollment Begins' },
    { keywords: ['mother', 'mom', 'mama', 'remit', 'send money home'], eventName: "Mother's Day" },
    { keywords: ['father', 'dad', 'papa', 'legacy', 'life insurance'], eventName: "Father's Day" },
    { keywords: ['new year', 'resolution', 'goal'], eventName: "New Year's Day" },
    { keywords: ['lunar', 'chinese new year', 'vietnamese'], eventName: 'Lunar New Year' },
    { keywords: ['diwali', 'deepavali', 'prosperity'], eventName: 'Diwali' },
    { keywords: ['eid', 'halal', 'zakat', 'islamic'], eventName: 'Eid al-Fitr' },
    { keywords: ['hispanic', 'latino', 'latina'], eventName: 'Hispanic Heritage Month' },
    { keywords: ['school', 'education', 'college', 'tuition'], eventName: 'Back to School' },
    { keywords: ['holiday', 'christmas', 'gift', 'spending'], eventName: 'Christmas' },
    { keywords: ['budget', 'annual', 'review', 'year end'], eventName: 'Year-End Financial Review' },
    { keywords: ['kwanzaa', 'ujamaa', 'community wealth'], eventName: 'Kwanzaa' },
    { keywords: ['nri', 'fbar', 'foreign income', 'dual tax'], eventName: 'Indian Independence Day' },
  ];

  for (const { keywords, eventName } of matches) {
    if (keywords.some(k => text.includes(k))) {
      return ALL_EVENTS.find(e => e.name === eventName) ?? null;
    }
  }
  return null;
}
