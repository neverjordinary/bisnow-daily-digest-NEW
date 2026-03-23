// Full 2026 Bisnow Event Calendar
// Events are sorted by date within each market

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

export const NATIONAL_EVENTS_SUMMARY = [
  { market: 'New York & Connecticut', keyEvents: ['NYC State of the Market (Nov)', 'National CRE Finance & Investment (Sep)', 'NY Multifamily Development & Investment (Mar)', 'Brooklyn State of Market (Apr)', 'NY Affordable Housing (Jul)', 'NY Construction & Development (Dec)'], totalEvents: '30+' },
  { market: 'DMV — DC, Maryland & Virginia', keyEvents: ['DC State of the Market (Apr)', 'East Coast Affordable Housing (May)', 'BMAC East Multifamily (Dec)', 'DC Capital Markets & CRE Finance (Sep)', 'National Opportunity Zones (Jul & Oct)', 'Mid-Atlantic Industrial (Oct)'], totalEvents: '35+' },
  { market: 'Boston & New England', keyEvents: ['Boston State of the Market (Oct)', 'Boston Multifamily BMAC (Sep)', 'Boston Life Sciences (Jun)', 'Boston Affordable Housing (Mar)'], totalEvents: '22+' },
  { market: 'Chicago', keyEvents: ['Chicago State of the Market (Oct)', 'BMAC Midwest (Aug)', 'AI x CRE (Jan)', 'Chicago Healthcare (Sep)', 'Chicago Industrial Summit (Nov)'], totalEvents: '25+' },
  { market: 'Dallas-Fort Worth', keyEvents: ['DFW State of the Market (Apr)', 'BMAC DFW (May)', 'Collin County State of Market (Oct)', 'DFW Industrial (Nov)'], totalEvents: '21+' },
  { market: 'Houston', keyEvents: ['Houston State of the Market (Apr)', 'BMAC Houston (Oct)', 'Healthcare South (Sep)', 'Industrial & Port of Houston (Mar)'], totalEvents: '18+' },
  { market: 'Austin-San Antonio', keyEvents: ['Austin State of the Market (Apr)', 'Central Texas Mega-Metro Summit (Oct)', 'Austin Multifamily BMAC (Sep)'], totalEvents: '16' },
  { market: 'Denver & Greater Colorado', keyEvents: ['Denver State of the Market (Sep)', 'BMAC Denver (Nov)', 'Denver Construction (Apr)'], totalEvents: '13' },
  { market: 'Phoenix', keyEvents: ['BMAC Phoenix (Oct)', 'Phoenix State of the Market (Nov)', 'Phoenix Construction (Mar)'], totalEvents: '12' },
  { market: 'Los Angeles, SoCal & Nevada', keyEvents: ['LA State of the Market (Oct)', 'LA BMAC West (Nov)', 'International Life Sciences (Sep)', 'SoCal Healthcare (Oct)', 'Vegas State of the Market (Jun)'], totalEvents: '30+' },
  { market: 'Northern California', keyEvents: ['Bay Area Life Sciences (Jun)', 'NorCal BMAC (Oct)', 'San Francisco State of the Market (Sep)', 'SF Development & Construction (Mar)'], totalEvents: '24' },
  { market: 'Pacific Northwest', keyEvents: ['Healthcare PacNW (Oct)', 'Seattle State of the Market (Sep)', 'BMAC PacNW (Nov)', 'Seattle Construction (Dec)'], totalEvents: '20' },
  { market: 'The Carolinas', keyEvents: ['Charlotte State of the Market (Sep)', 'Charlotte BMAC (May)', 'Triangle BMAC (Dec)', 'DICE Carolinas (Dec)'], totalEvents: '18' },
  { market: 'Atlanta, Georgia & Alabama', keyEvents: ['Atlanta State of the Market (Sep)', 'Multifamily Southeast (Nov)', 'Industrial Southeast (Oct)'], totalEvents: '18' },
  { market: 'Nashville & Tennessee', keyEvents: ['Nashville State of the Market (Nov)', 'BMAC Nashville (Mar)', 'Nashville Construction (Jun)'], totalEvents: '7' },
  { market: 'New Jersey', keyEvents: ['New Jersey State of the Market (Sep)', 'National Industrial Outdoor Storage (Aug)', 'NJ Industrial (Feb)'], totalEvents: '15' },
  { market: 'Pennsylvania, Delaware & South Jersey', keyEvents: ['Philadelphia State of the Market (Sep)', 'Pennsylvania Healthcare CRE (Oct)', 'BMAC Philadelphia (Apr)'], totalEvents: '26+' },
  { market: 'Data Centers (DICE Series)', keyEvents: ['DICE National (May, Maryland)', 'DICE South (Aug, Dallas)', 'DICE Southeast (Mar, Atlanta)', 'DICE West (Dec, San Jose)'], totalEvents: '20+' },
  { market: 'United Kingdom', keyEvents: ['London State of the Market (Oct)', 'Science & Technology (Sep)', 'Build to Rent Annual (Jun)', 'UK Industrial & Logistics (Jun)'], totalEvents: '24' },
  { market: 'Toronto', keyEvents: ['Life Sciences (Mar)', 'GTA State of Market (Apr)', 'Sustainability (Jun)', 'Office (Sep)', 'Purpose Built Rentals (Nov)'], totalEvents: '5' },
  { market: 'Dublin', keyEvents: ['Dublin State of Market (Mar)', 'Hotel Outlook (May)', 'Office Summit (Jun)', 'DICE Ireland (Sep)', 'Residential (Nov)'], totalEvents: '5' },
  { market: 'Netherlands', keyEvents: ['Residential (May)', 'Office (Sep)', 'State of Market (Nov)', 'DICE Netherlands (Dec)'], totalEvents: '4' },
];
