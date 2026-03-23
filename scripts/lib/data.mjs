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
  { name: 'Co-Branded Step & Repeat', price: 9900, tickets: 5, exclusive: true, inclusions: 'On-stage backdrop' },
  { name: 'PR Bundle', price: 8850, tickets: 5, exclusive: false, inclusions: '1 article + press release' },
  { name: 'Business Dev Bundle', price: 8500, tickets: 2, exclusive: false, inclusions: '1 booth at 3 events + BisCred prospecting data' },
  { name: 'Panelist Package', price: 7350, tickets: 5, exclusive: false, inclusions: 'Speaking slot' },
  { name: 'Moderator Package', price: 7350, tickets: 5, exclusive: false, inclusions: 'Speaking slot' },
  { name: 'Presenter/Keynote', price: 7150, tickets: 5, exclusive: false, inclusions: 'Speaking slot' },
  { name: 'Video Commercial', price: 5000, tickets: 4, exclusive: false, inclusions: 'Logo exposure' },
  { name: 'Verbal Commercial', price: 5000, tickets: 4, exclusive: false, inclusions: 'Logo exposure' },
  { name: 'Lanyard Sponsor', price: 4050, tickets: 3, exclusive: true, inclusions: 'Branded lanyards (+$950 newsletter)' },
  { name: 'Name Tag Sponsor', price: 4050, tickets: 3, exclusive: true, inclusions: 'Branded name tags (+$950 newsletter)' },
  { name: 'Coffee Cups Sponsor', price: 4050, tickets: 3, exclusive: true, inclusions: 'Branded cups (+$950 newsletter)' },
  { name: 'Panel Branding Sponsor', price: 3990, tickets: 3, exclusive: false, inclusions: 'Logo on-screen during panel' },
  { name: 'Agenda Sponsor', price: 3990, tickets: 3, exclusive: true, inclusions: 'Logo on agendas (+$950 newsletter)' },
  { name: 'Microphone Sponsor', price: 3990, tickets: 3, exclusive: false, inclusions: 'Logo on mics' },
  { name: 'Stage-side Branding', price: 3990, tickets: 3, exclusive: false, inclusions: 'Sponsor provides signage' },
  { name: 'Interview Package', price: 3990, tickets: 6, exclusive: false, inclusions: 'Sponsor provides equipment' },
  { name: 'Stage Furniture Sponsor', price: 2500, tickets: 3, exclusive: false, inclusions: 'Sponsor provides furniture' },
  { name: 'Exhibitor Booth', price: 2350, tickets: 2, exclusive: false, inclusions: 'Booth (+$950 newsletter)' },
  { name: 'Registration Sponsor', price: 2000, tickets: 2, exclusive: true, inclusions: 'Logo on registration (+$950 newsletter)' },
  { name: 'Breakfast/Lunch Sponsor', price: 2000, tickets: 2, exclusive: false, inclusions: 'Branded napkins (+$950 newsletter)' },
  { name: 'Seat Drop Sponsor', price: 2000, tickets: 2, exclusive: true, inclusions: '(+$950 newsletter)' },
  { name: 'Supporting Sponsor', price: 1000, tickets: 1, exclusive: false, inclusions: '(+$950 newsletter)' },
];

export const DIGITAL_PRODUCTS = {
  southFloridaBrief: { name: 'South Florida Morning Brief', audience: 39000, takeover: 2250, leadAd: 1500, sponsoredLink: 950 },
  dedicatedEmail: { name: 'Dedicated Email (South Florida)', audience: 33426, price: 6500, description: '100% share of voice, full performance reporting with lead data' },
  postEventEmail: { name: 'Post-Event Dedicated Email', price: 2000, description: 'Exclusive follow-up to all event attendees within 24 hours' },
  customArticle: { name: 'Custom Content Article (Studio B)', price: 5750, description: 'Written by Bisnow in-house team, published on Bisnow.com, promoted in briefs' },
  websiteBannerROS: { name: 'Website Banner Ads (Run-of-Site)', cpm: 50, description: 'Run-of-site display advertising' },
  websiteBannerTargeted: { name: 'Website Banner Ads (Targeted)', cpm: 70, description: 'Targeted by market or topic' },
};

export const NATIONAL_BRIEFS = [
  { name: 'National / Investment', audience: 207100, takeover: 6850, sponsoredLink: 1500 },
  { name: "National / Editor's Choice", audience: 143800, takeover: 6500, sponsoredLink: 1500 },
  { name: 'National / The First Draft', audience: 142300, weeklyRate: 10000 },
  { name: 'National / National Deal Brief', audience: 122200, takeover: 5500, sponsoredLink: 1500 },
  { name: 'National / What Tenants Want', audience: 78400, takeover: 5500, sponsoredLink: 1500 },
  { name: 'National / Multifamily Brief', audience: 62400, takeover: 6750, sponsoredLink: 1500 },
  { name: "National / Broker's Brief", audience: 54600, takeover: 6000, sponsoredLink: 1500 },
  { name: 'National / SFR Brief', audience: 51700, takeover: 5000, sponsoredLink: 1500 },
  { name: 'National / Life Sciences', audience: 38100, takeover: 4500, sponsoredLink: 1500 },
  { name: 'National / Affordable Housing', audience: 36800, takeover: 6000, sponsoredLink: 1500 },
  { name: 'National / Data Center Weekly', audience: 33600, takeover: 4000, sponsoredLink: 1500 },
  { name: 'National / Office Brief', audience: 33800, takeover: 5500, sponsoredLink: 1500 },
  { name: 'National / Industrial', audience: 28300, takeover: 4500, sponsoredLink: 1500 },
];

export const NATIONAL_EVENTS_SUMMARY = [
  { market: 'New York & Connecticut', keyEvents: 'NYC State of the Market (Nov), National CRE Finance & Investment (Sep), NY Multifamily (Mar)' },
  { market: 'DMV — DC, Maryland & Virginia', keyEvents: 'DC State of the Market (Apr), East Coast Affordable Housing (May), BMAC East Multifamily (Dec)' },
  { market: 'Boston & New England', keyEvents: 'Boston State of the Market (Oct), BMAC Boston (Sep), Life Sciences (Jun)' },
  { market: 'Chicago', keyEvents: 'Chicago State of the Market (Oct), BMAC Midwest (Aug), Industrial Summit (Nov)' },
  { market: 'Dallas-Fort Worth', keyEvents: 'DFW State of the Market (Apr), BMAC DFW (May), Industrial (Nov)' },
  { market: 'Houston', keyEvents: 'Houston State of the Market (Apr), BMAC Houston (Oct), Industrial & Port (Mar)' },
  { market: 'Austin-San Antonio', keyEvents: 'Austin State of the Market (Apr), Central Texas Mega-Metro (Oct), BMAC Austin (Sep)' },
  { market: 'Denver', keyEvents: 'Denver State of the Market (Sep), BMAC Denver (Nov), Construction (Apr)' },
  { market: 'Phoenix', keyEvents: 'BMAC Phoenix (Oct), State of the Market (Nov), Construction (Mar)' },
  { market: 'Los Angeles & SoCal', keyEvents: 'LA State of the Market (Oct), BMAC West (Nov), International Life Sciences (Sep)' },
  { market: 'Northern California', keyEvents: 'Bay Area Life Sciences (Jun), NorCal BMAC (Oct), SF State of the Market (Sep)' },
  { market: 'The Carolinas', keyEvents: 'Charlotte State of the Market (Sep), Charlotte BMAC (May), Triangle BMAC (Dec)' },
  { market: 'Atlanta', keyEvents: 'Atlanta State of the Market (Sep), Multifamily Southeast (Nov), Industrial Southeast (Oct)' },
  { market: 'Nashville', keyEvents: 'Nashville State of the Market (Nov), BMAC Nashville (Mar), Construction (Jun)' },
];

export const BISNOW_ATTENDEE_STATS = {
  vpPlus: '42%',
  cSuite: '15%',
  ownersOperatorsDevPELenders: '27%',
  avgAttendees: '200+',
  totalSubscribers: '1.7M',
  totalReaders: '11M',
  totalEvents: '436',
  totalMarkets: '50+',
  newsletters: '79',
};

export const INTERNAL_DOMAINS = ['bisnow.com', 'biscred.com', 'selectleaders.com', 'openseasadvisory.com'];

export const TARGET_AUDIENCE_MAP = {
  'General Contractor': { primary: ['Developers', 'Owners'], secondary: ['Architects', 'Engineers', 'PMs'] },
  'Developer (market-rate)': { primary: ['LP investors', 'Equity partners', 'Capital sources'], secondary: ['Lenders', 'Brokers', 'Architects'] },
  'Developer (affordable)': { primary: ['Government officials', 'LIHTC investors', 'CDFIs'], secondary: ['Lenders', 'Property managers'] },
  'Architecture / Design': { primary: ['Developers', 'Owners', 'Operators'], secondary: ['GCs', 'Engineers', 'Institutional investors'] },
  'Engineering Firm': { primary: ['Developers', 'GCs', 'Architects'], secondary: ['Owners', 'Government agencies'] },
  'Commercial Lender / Debt Fund': { primary: ['Developers', 'Owners', 'Operators', 'Borrowers'], secondary: ['Brokers', 'Equity partners'] },
  'Equity Investor / PE Fund': { primary: ['Developers', 'Operators', 'Deal sponsors (GPs)'], secondary: ['Lenders', 'Brokers', 'Co-investors'] },
  'Commercial Brokerage': { primary: ['Investors', 'Developers', 'Owners', 'Tenants'], secondary: ['Lenders', 'Property managers'] },
  'Law Firm (RE practice)': { primary: ['Developers', 'Investors', 'Lenders'], secondary: ['Brokers', 'Title companies'] },
  'Title / Insurance Company': { primary: ['Lenders', 'Brokers', 'Developers', 'Attorneys'], secondary: ['Investors', 'Property managers'] },
  'PropTech / CRE Technology': { primary: ['Owners', 'Operators', 'Property managers', 'Developers'], secondary: ['Brokers', 'Investors'] },
  'Property Management': { primary: ['Owners', 'Investors', 'Developers'], secondary: ['Lenders', 'Tenants', 'Vendors'] },
  'Co-working / Flex Office': { primary: ['Tenants', 'Building owners', 'Landlords', 'Brokers'], secondary: ['Developers', 'Investors'] },
  'Municipality / EDO': { primary: ['Developers', 'Investors', 'Employers considering relocation'], secondary: ['Brokers', 'Site selectors'] },
  'Hospitality / Hotel Operator': { primary: ['Investors', 'Developers', 'Lenders'], secondary: ['Brokers', 'Architects', 'Tourism boards'] },
  'Industrial / Logistics': { primary: ['Tenants', '3PLs', 'Manufacturers'], secondary: ['Developers', 'Investors', 'Brokers'] },
  'Homebuilder / MPC Developer': { primary: ['Land sellers', 'Investors'], secondary: ['Lenders', 'Title companies', 'Municipalities'] },
  'Condo Developer / Sales': { primary: ['LP investors', 'Buyers (marketing)', 'Brokers'], secondary: ['Lenders', 'Architects', 'Interior designers'] },
};
