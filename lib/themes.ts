import { FinancialTheme, CommunityTag } from '../types';

export const THEME_CONFIG: Record<FinancialTheme, { label: string; color: string; icon: string; description: string }> = {
  banking_basics:    { label: 'Banking Basics',    color: '#1565C0', icon: 'bank',          description: 'Opening accounts, fees, wires, checks — the US banking system explained' },
  credit_building:   { label: 'Credit Building',   color: '#6A1B9A', icon: 'credit-card',   description: 'Building credit from zero, secured cards, credit scores' },
  budgeting:         { label: 'Budgeting',          color: '#2E7D32', icon: 'calculator',    description: 'Managing income, tracking expenses, 50/30/20 for immigrants' },
  taxes:             { label: 'Taxes',              color: '#E65100', icon: 'file-document', description: 'US tax system, ITIN, 1040-NR, self-employment, dual taxation' },
  investing:         { label: 'Investing',          color: '#00695C', icon: 'chart-line',    description: '401k, IRAs, index funds — starting from scratch' },
  remittances:       { label: 'Remittances',        color: '#0277BD', icon: 'send',          description: 'Cheapest ways to send money home, exchange rates, wire transfers' },
  insurance:         { label: 'Insurance',          color: '#37474F', icon: 'shield',        description: 'Health, life, auto insurance for immigrants and visa holders' },
  homeownership:     { label: 'Homeownership',      color: '#4E342E', icon: 'home',          description: 'Buying a home as an immigrant, ITIN mortgages, down payment programs' },
  retirement:        { label: 'Retirement',         color: '#558B2F', icon: 'weather-sunny', description: 'Social Security for immigrants, retirement accounts, planning across borders' },
  entrepreneurship:  { label: 'Entrepreneurship',   color: '#F57F17', icon: 'store',         description: 'Starting a business as an immigrant, EIN, business banking, funding' },
  debt_management:   { label: 'Debt Management',    color: '#B71C1C', icon: 'trending-down', description: 'Avoiding predatory lending, paying off debt, payday loan alternatives' },
  emergency_fund:    { label: 'Emergency Fund',     color: '#0288D1', icon: 'umbrella',      description: 'Building a 3-6 month safety net on an immigrant income' },
};

export const COMMUNITY_CONFIG: Record<CommunityTag, { label: string; emoji: string; color: string }> = {
  hispanic_latino:   { label: 'Hispanic / Latino',   emoji: '🇲🇽', color: '#C62828' },
  south_asian:       { label: 'South Asian',          emoji: '🇮🇳', color: '#1565C0' },
  east_asian:        { label: 'East Asian',           emoji: '🇨🇳', color: '#B71C1C' },
  african:           { label: 'African',              emoji: '🌍', color: '#2E7D32' },
  caribbean:         { label: 'Caribbean',            emoji: '🌊', color: '#0277BD' },
  middle_eastern:    { label: 'Middle Eastern',       emoji: '🌙', color: '#F57F17' },
  eastern_european:  { label: 'Eastern European',     emoji: '🌿', color: '#6A1B9A' },
  general:           { label: 'All Communities',      emoji: '🌎', color: '#455A64' },
};

export const SUGGESTED_PROMPTS: Record<FinancialTheme, string[]> = {
  banking_basics: [
    'Give me 3 common mistakes immigrants make when opening a US bank account',
    'What should I explain about ChexSystems to new immigrants?',
    'How do I explain the difference between a debit card and a credit card simply?',
  ],
  credit_building: [
    'How does someone build credit with no Social Security Number?',
    'Explain the 5 credit score factors in simple terms for a first-time listener',
    'What are the best starter credit cards for immigrants?',
  ],
  taxes: [
    'What are the top 3 tax mistakes immigrants make?',
    'How do I explain ITIN vs SSN to my audience?',
    'What deductions are most immigrants missing?',
  ],
  remittances: [
    'Which remittance services have the lowest fees right now?',
    'How do I explain exchange rate markup to my audience?',
    'What are the risks of informal money transfer (hawala)?',
  ],
  budgeting: [
    'Create a realistic budget example for a family of 4 earning $50k',
    'How do I explain budgeting to someone who is sending 30% of income home?',
    'What savings strategies work best for recent immigrants?',
  ],
  investing: [
    'How do I explain 401k matching to someone who has never heard of it?',
    'What should immigrants know about investing before they get their green card?',
    'Simple analogy to explain index funds to a first-generation investor',
  ],
  insurance: [
    'How do I explain the US health insurance system to someone used to universal healthcare?',
    'What life insurance options are available for non-citizens?',
    'How do I explain deductibles vs premiums simply?',
  ],
  homeownership: [
    'Can undocumented immigrants buy a home? Walk me through the ITIN mortgage process',
    'What first-time homebuyer programs exist for immigrants?',
    'How do I explain mortgage pre-approval in simple terms?',
  ],
  retirement: [
    'What happens to a 401k if an immigrant has to return to their home country?',
    'How does Social Security work for non-citizens who later leave the US?',
    'Simple explanation of Roth IRA vs Traditional IRA for immigrants',
  ],
  entrepreneurship: [
    'What business structure should an immigrant entrepreneur choose?',
    'How do immigrant entrepreneurs access small business loans?',
    'What taxes does a self-employed immigrant need to pay?',
  ],
  debt_management: [
    'How do I warn my audience about predatory payday loans targeting immigrants?',
    'What is the debt avalanche vs debt snowball method? Give me a relatable immigrant example',
    'What credit card traps should immigrants avoid?',
  ],
  emergency_fund: [
    'How do I explain emergency fund priority when someone is also sending remittances?',
    'Where should immigrants keep their emergency fund?',
    'How do you build an emergency fund on a minimum wage income?',
  ],
};
