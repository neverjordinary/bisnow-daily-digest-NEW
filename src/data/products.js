// Bisnow Products & Pricing

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

export const INTERNAL_DOMAINS = ['bisnow.com', 'biscred.com', 'selectleaders.com', 'openseasadvisory.com'];
