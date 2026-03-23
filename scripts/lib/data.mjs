// Shared data for the daily digest script
// Mirrors src/data/events.js and src/data/products.js for Node.js usage

export const FLORIDA_SOUTH = [
  { date: '2026-02-12', name: 'South Florida Wellness Real Estate Forum', format: 'Morning', panels: 2, venue: 'The Gale', market: 'South Florida' },
  { date: '2026-02-24', name: 'South Dade State of the Market', format: 'Morning', panels: 2, venue: 'Hilton Dadeland', market: 'South Florida' },
  { date: '2026-03-12', name: 'HOA & Condo Association Series: Annual Kickoff', format: 'Full Day', panels: 6, venue: 'DCOTA', market: 'South Florida' },
  { date: '2026-03-31', name: 'South Florida Architecture, Design, and Interiors', format: 'Morning', panels: 3, venue: 'Hyatt Regency', market: 'South Florida' },
  { date: '2026-04-23', name: 'Future of Little River & Little Haiti', format: 'Morning', panels: 2, venue: 'Hagerty Garage & Social', market: 'South Florida' },
  { date: '2026-04-28', name: 'Condoverse (Condo Sales & Development)', format: 'Full Day', panels: 6, venue: 'Miami Airport Conv Ctr', market: 'South Florida' },
  { date: '2026-05-21', name: 'South Florida Affordable Housing Summit', format: 'Morning', panels: 2, venue: 'The Gale', market: 'South Florida' },
  { date: '2026-05-28', name: 'Broward County State of the Market', format: 'Morning', panels: 4, venue: 'Seminole Hard Rock Hotel', market: 'South Florida' },
  { date: '2026-06-11', name: 'South Florida Office Summit', format: 'Morning', panels: 2, venue: 'TBD', market: 'South Florida' },
  { date: '2026-06-18', name: 'HOA & Condo Association Series: Property Management', format: 'Morning', panels: 3, venue: 'DCOTA', market: 'South Florida' },
  { date: '2026-06-30', name: 'Florida & Caribbean Hospitality Summit', format: 'Morning', panels: 3, venue: 'Miami', market: 'South Florida' },
  { date: '2026-07-16', name: 'South Florida Construction & Development', format: 'Morning', panels: 3, venue: 'Miami', market: 'South Florida' },
  { date: '2026-07-28', name: 'Boca Raton State of the Market', format: 'Morning', panels: 2, venue: 'Boca Raton', market: 'South Florida' },
  { date: '2026-08-04', name: 'South Florida Opportunity Zones', format: 'Morning', panels: 1, venue: 'Miami', market: 'South Florida' },
  { date: '2026-08-11', name: 'Florida Homebuilding Summit (Master-Planned Communities)', format: 'Morning', panels: 2, venue: 'TBD', market: 'South Florida' },
  { date: '2026-08-20', name: 'HOA & Condo Association Series: Finance & Reserves', format: 'Morning', panels: 3, venue: 'DCOTA', market: 'South Florida' },
  { date: '2026-09-23', name: 'Miami State of The Market', format: 'Full Day', panels: 6, venue: 'Jungle Island', market: 'South Florida' },
  { date: '2026-09-29', name: 'South Florida Higher Ed & K-12 Facilities & Development Summit', format: 'Morning', panels: 2, venue: 'Miami', market: 'South Florida' },
  { date: '2026-10-08', name: 'Ultra-Luxury Home Summit', format: 'Morning', panels: 3, venue: 'Miami', market: 'South Florida' },
  { date: '2026-10-13', name: 'Florida Industrial & Manufacturing', format: 'Morning', panels: 2, venue: 'Palm Beach County', market: 'South Florida' },
  { date: '2026-11-12', name: 'HOA & Condo Association Series: 2027 Forecast', format: 'Morning', panels: 3, venue: 'DCOTA', market: 'South Florida' },
  { date: '2026-11-17', name: 'South Florida Multifamily Summit', format: 'Morning', panels: 4, venue: 'TBD', market: 'South Florida' },
  { date: '2026-12-01', name: 'Palm Beach State of the Market', format: 'Full Day', panels: 6, venue: 'Palm Beach County', market: 'South Florida' },
];

export const FLORIDA_GULF = [
  { date: '2026-02-05', name: 'Tampa Bay Multifamily & Condo Summit', format: 'Morning', panels: 3, venue: 'Hotel Haya', market: 'Gulf Coast' },
  { date: '2026-05-14', name: 'Tampa Bay State of the Market', format: 'Morning', panels: 3, venue: 'The Motor Enclave', market: 'Gulf Coast' },
  { date: '2026-10-20', name: 'Florida Build-To-Rent', format: 'Morning', panels: 2, venue: 'Tampa/St Pete', market: 'Gulf Coast' },
  { date: '2026-11-03', name: 'Tampa Bay Construction & Development', format: 'Morning', panels: 2, venue: 'Tampa/St Pete', market: 'Gulf Coast' },
  { date: '2026-12-09', name: 'Southwest Florida State of the Market', format: 'Morning', panels: 2, venue: 'Fort Myers/Naples', market: 'Gulf Coast' },
];

export const FLORIDA_NORTH = [
  { date: '2026-03-05', name: 'Jacksonville State of the Market', format: 'Morning', panels: 3, venue: 'The River Club', market: 'North Florida' },
  { date: '2026-10-01', name: 'Jacksonville Construction & Development', format: 'Morning', panels: 3, venue: 'Jacksonville', market: 'North Florida' },
  { date: '2026-12-08', name: 'Gainesville State of the Market', format: 'Morning', panels: 2, venue: 'Gainesville', market: 'North Florida' },
];

export const FLORIDA_CENTRAL = [
  { date: '2026-04-14', name: 'Treasure Coast State of the Market', format: 'Morning', panels: 3, venue: 'Crane Club at Tesoro', market: 'Central Florida' },
  { date: '2026-06-25', name: 'Orlando State of the Market', format: 'Morning', panels: 3, venue: 'Orlando', market: 'Central Florida' },
  { date: '2026-08-25', name: 'Space Coast State of the Market', format: 'Morning', panels: 2, venue: 'Brevard County', market: 'Central Florida' },
  { date: '2026-09-17', name: 'Central Florida Construction & Development', format: 'Morning', panels: 2, venue: 'Orlando', market: 'Central Florida' },
];

export const ALL_FLORIDA_EVENTS = [
  ...FLORIDA_SOUTH,
  ...FLORIDA_GULF,
  ...FLORIDA_NORTH,
  ...FLORIDA_CENTRAL,
].sort((a, b) => a.date.localeCompare(b.date));

export const EVENT_PACKAGES = [
  { name: 'Presenting Sponsor', price: 22500, tickets: 12, exclusive: true, inclusions: 'Speaking slot, booth, premium logo, attendee list, speaker profile article, dedicated newsletter' },
  { name: 'Whole Panel Buyout', price: 17500, tickets: 10, exclusive: false, inclusions: '5 speaking slots, 2 booths, in-agenda logo' },
  { name: 'Panelist Package', price: 7350, tickets: 5, exclusive: false, inclusions: 'Speaking slot' },
  { name: 'Stage Furniture Sponsor', price: 2500, tickets: 3, exclusive: false, inclusions: 'Sponsor provides furniture' },
  { name: 'Exhibitor Booth', price: 2350, tickets: 2, exclusive: false, inclusions: 'Booth (+$950 newsletter)' },
  { name: 'Supporting Sponsor', price: 1000, tickets: 1, exclusive: false, inclusions: '(+$950 newsletter)' },
];

export const DIGITAL_PRODUCTS = {
  southFloridaBrief: { name: 'South Florida Morning Brief', audience: 39000, takeover: 2250, leadAd: 1500, sponsoredLink: 950 },
  dedicatedEmail: { name: 'Dedicated Email (South Florida)', audience: 33426, price: 6500 },
  postEventEmail: { name: 'Post-Event Dedicated Email', price: 2000 },
  customArticle: { name: 'Custom Content Article (Studio B)', price: 5750 },
};

export const INTERNAL_DOMAINS = ['bisnow.com', 'biscred.com', 'selectleaders.com', 'openseasadvisory.com'];

export const TARGET_AUDIENCE_MAP = {
  'General Contractor': { primary: ['Developers', 'Owners'], secondary: ['Architects', 'Engineers', 'PMs'] },
  'Developer (market-rate)': { primary: ['LP investors', 'Equity partners', 'Capital sources'], secondary: ['Lenders', 'Brokers', 'Architects'] },
  'Developer (affordable)': { primary: ['Government officials', 'LIHTC investors', 'CDFIs'], secondary: ['Lenders', 'Property managers'] },
  'Architecture / Design': { primary: ['Developers', 'Owners', 'Operators'], secondary: ['GCs', 'Engineers', 'Institutional investors'] },
  'Commercial Brokerage': { primary: ['Investors', 'Developers', 'Owners', 'Tenants'], secondary: ['Lenders', 'Property managers'] },
  'Law Firm (RE practice)': { primary: ['Developers', 'Investors', 'Lenders'], secondary: ['Brokers', 'Title companies'] },
  'PropTech / CRE Technology': { primary: ['Owners', 'Operators', 'Property managers', 'Developers'], secondary: ['Brokers', 'Investors'] },
  'Hospitality / Hotel Operator': { primary: ['Investors', 'Developers', 'Lenders'], secondary: ['Brokers', 'Architects', 'Tourism boards'] },
  'Industrial / Logistics': { primary: ['Tenants', '3PLs', 'Manufacturers'], secondary: ['Developers', 'Investors', 'Brokers'] },
};
