#!/usr/bin/env node

import { callAnthropicAPI, extractText, parseJSON } from './lib/anthropic.mjs';
import {
  ALL_FLORIDA_EVENTS, EVENT_PACKAGES, DIGITAL_PRODUCTS, NATIONAL_BRIEFS,
  NATIONAL_EVENTS_SUMMARY, BISNOW_ATTENDEE_STATS, INTERNAL_DOMAINS, TARGET_AUDIENCE_MAP,
} from './lib/data.mjs';
import { generateDigestEmail } from './lib/email-template.mjs';

const SCRIPT_VERSION = '2026-03-23-v7-legendary';

const API_KEY = process.env.ANTHROPIC_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DIGEST_EMAIL = process.env.DIGEST_EMAIL;
const DIGEST_FROM = process.env.DIGEST_FROM || 'Bisnow Sales Digest <onboarding@resend.dev>';
const CALENDAR_ID = process.env.CALENDAR_ID || 'jordan.hinsch@bisnow.com';
const DRY_RUN = process.env.DRY_RUN === 'true';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const EXCLUDED_DOMAINS = new Set([
  'group.calendar.google.com',
  'calendar.google.com',
  'app.bisnow.com',
  'google.com',
  'gmail.com',
  'yahoo.com',
  'morningbrew.com',
  'enverus.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'me.com',
  'aol.com',
]);

function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function log(msg) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeDomain(email = '') {
  return email.split('@')[1]?.toLowerCase().trim() || '';
}

function isInternalDomain(domain = '') {
  return INTERNAL_DOMAINS.includes(domain) || domain.endsWith('.bisnow.com');
}

function isExcludedDomain(domain = '') {
  if (!domain) return true;
  if (EXCLUDED_DOMAINS.has(domain)) return true;
  if (isInternalDomain(domain)) return true;

  const blockedSuffixes = [
    '.calendar.google.com',
    '.google.com',
    '.gmail.com',
    '.outlook.com',
    '.yahoo.com',
  ];

  return blockedSuffixes.some(suffix => domain.endsWith(suffix));
}

function getBestExternalContacts(attendees = []) {
  const external = (attendees || []).filter(a => {
    const domain = normalizeDomain(a.email);
    return domain && !isInternalDomain(domain);
  });

  const good = external.filter(a => !isExcludedDomain(normalizeDomain(a.email)));
  return good.length > 0 ? good : external;
}

// ─── Data helpers ───

function buildFullEventCalendar() {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS
    .filter(e => e.date >= today)
    .map(e => `${e.date} | ${e.name} | ${e.format} | ${e.venue} | ${e.market}`)
    .join('\n');
}

function buildFullProductsText() {
  const eventPkgs = EVENT_PACKAGES.map(p =>
    `${p.name}: $${p.price.toLocaleString()} — ${p.inclusions} (${p.tickets} tickets${p.exclusive ? ', exclusive' : ''})`
  ).join('\n');

  const digital = [
    `South FL Morning Brief (${DIGITAL_PRODUCTS.southFloridaBrief.audience.toLocaleString()} subscribers): Takeover $${DIGITAL_PRODUCTS.southFloridaBrief.takeover} | Lead Ad $${DIGITAL_PRODUCTS.southFloridaBrief.leadAd} | Sponsored Link $${DIGITAL_PRODUCTS.southFloridaBrief.sponsoredLink}`,
    `Dedicated Email — South Florida (${DIGITAL_PRODUCTS.dedicatedEmail.audience.toLocaleString()} audience): $${DIGITAL_PRODUCTS.dedicatedEmail.price.toLocaleString()} — ${DIGITAL_PRODUCTS.dedicatedEmail.description}`,
    `Post-Event Dedicated Email: $${DIGITAL_PRODUCTS.postEventEmail.price.toLocaleString()} — ${DIGITAL_PRODUCTS.postEventEmail.description}`,
    `Custom Content Article (Studio B): $${DIGITAL_PRODUCTS.customArticle.price.toLocaleString()} — ${DIGITAL_PRODUCTS.customArticle.description}`,
    `Website Banner Ads: Run-of-Site $${DIGITAL_PRODUCTS.websiteBannerROS.cpm} CPM | Targeted $${DIGITAL_PRODUCTS.websiteBannerTargeted.cpm} CPM`,
  ].join('\n');

  const nationalBriefs = NATIONAL_BRIEFS.map(b => {
    const pricing = b.weeklyRate
      ? `$${b.weeklyRate.toLocaleString()}/week`
      : `Takeover $${b.takeover.toLocaleString()} | Sponsored Link $${b.sponsoredLink.toLocaleString()}`;
    return `${b.name} (${b.audience.toLocaleString()} subs): ${pricing}`;
  }).join('\n');

  return `EVENT SPONSORSHIP PACKAGES (at any Florida event):\n${eventPkgs}\n\nDIGITAL PRODUCTS:\n${digital}\n\nNATIONAL NEWSLETTER BRIEFS:\n${nationalBriefs}`;
}

function buildTargetAudienceText() {
  return Object.entries(TARGET_AUDIENCE_MAP)
    .map(([type, { primary, secondary }]) =>
      `${type}: Primary → ${primary.join(', ')} | Secondary → ${secondary.join(', ')}`)
    .join('\n');
}

function buildNationalEventsText() {
  return NATIONAL_EVENTS_SUMMARY.map(m =>
    `${m.market}: ${m.keyEvents}`
  ).join('\n');
}

function classifyContacts(attendees) {
  const internal = [];
  const external = [];

  for (const a of attendees || []) {
    const domain = normalizeDomain(a.email);
    if (isInternalDomain(domain)) {
      internal.push(a);
    } else if (domain) {
      external.push(a);
    }
  }

  return { internal, external };
}

function getUpcomingEvents(count = 8) {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS.filter(e => e.date >= today).slice(0, count);
}

function getNextEvent() {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS.find(e => e.date >= today) || null;
}

// ─── Google Calendar ───

async function getGoogleAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google OAuth token refresh failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchCalendarDirect() {
  log('Fetching Google Calendar events (direct API)...');

  const today = getTodayStr();
  const timeMin = `${today}T00:00:00-05:00`;
  const timeMax = `${today}T23:59:59-05:00`;

  const accessToken = await getGoogleAccessToken();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
    timeZone: 'America/New_York',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const events = data.items || [];
  const externalMeetings = [];

  for (const event of events) {
    if (!event.attendees || event.attendees.length === 0) continue;
    if (event.status === 'cancelled') continue;

    const attendees = event.attendees.map(a => ({
      email: a.email,
      name: a.displayName || a.email.split('@')[0],
      responseStatus: a.responseStatus,
    }));

    const hasExternal = attendees.some(a => {
      const domain = normalizeDomain(a.email);
      return domain && !isInternalDomain(domain);
    });

    if (!hasExternal) continue;

    externalMeetings.push({
      title: event.summary || 'Untitled',
      start_time: event.start?.dateTime || event.start?.date || '',
      end_time: event.end?.dateTime || event.end?.date || '',
      location: event.location || '',
      description: event.description || '',
      attendees,
    });
  }

  log(`Found ${externalMeetings.length} meetings with external attendees`);
  return externalMeetings;
}

// ─── Research ───

function buildFallbackResult(contactsToUse, domain, reason) {
  return {
    contacts: contactsToUse.map(c => ({
      name: c.name || 'Unknown',
      title: 'Unknown',
      company: domain || 'Unknown',
      linkedin_url: '',
      email: c.email,
      bio: '',
    })),
    company: {
      name: domain || 'Unknown',
      description: reason,
      hq: 'Unknown',
      size_estimate: 'Unknown',
      revenue: '',
      employees: '',
      cre_relevance: 'Unknown',
      florida_presence: 'Unknown',
      primary_markets: [],
    },
    sponsorship_intel: {
      past_cre_sponsorships: [],
      current_sponsorships: [],
      advertising_evidence: [],
      past_bisnow_sponsor: false,
    },
    recent_news: [],
    match_score: 0,
    match_reasoning: reason,
    best_fit_events: [],
    recommended_products: [],
    national_opportunity: null,
    target_audience: { primary: [], secondary: [], pitch_rationale: '' },
    icebreaker: '',
  };
}

async function researchMeeting(meeting, externalContacts) {
  const filteredContacts = getBestExternalContacts(externalContacts);
  const contactsToUse = filteredContacts.length > 0 ? filteredContacts : externalContacts;

  const domain = normalizeDomain(contactsToUse[0]?.email || '');
  if (!domain || isExcludedDomain(domain)) {
    log(`Skipping excluded domain inside researchMeeting: ${domain || 'unknown'}`);
    return buildFallbackResult(contactsToUse, domain, 'Skipped excluded/non-company domain');
  }

  const contactStr = contactsToUse
    .map(c => `${c.name || 'Unknown'} <${c.email}>`)
    .join(', ');

  log(`Researching ${domain}...`);

  const fullEventCalendar = buildFullEventCalendar();
  const fullProducts = buildFullProductsText();
  const targetAudiences = buildTargetAudienceText();
  const nationalEvents = buildNationalEventsText();

  const system = `You are an elite sales intelligence researcher for Bisnow, the largest commercial real estate (CRE) media and events company in the US. Your job is to prepare comprehensive, deal-ready intelligence for Jordan Hinsch, Head of Sales for Florida.

Your research must be DEEP, SPECIFIC, and ACTIONABLE. Do not give generic summaries. Find real data points: revenue figures, deal sizes, transaction volumes, specific project names, specific people's career histories. Use web search extensively — search for each contact individually on LinkedIn, search for recent company news, search for their past sponsorships and advertising.

CRITICAL RULES:
- Search for EACH contact's LinkedIn profile individually by name + company. Verify the URL leads to the right person.
- Find specific, recent news (last 12 months) — real deals, transactions, hires, project announcements.
- Map each news item to a specific Bisnow event where that news creates a sales opportunity.
- Check if this company or its parent has EVER sponsored, advertised with, or been featured on Bisnow.
- Recommend specific products with EXACT prices from the price list provided.
- Think like a sales strategist: what would make this company want to spend $20K-$50K+ with Bisnow?

Return valid JSON only. No markdown wrapping.`;

  const userMessage = `MEETING INTELLIGENCE REQUEST
============================
Meeting: ${meeting.title}
Time: ${meeting.start_time}
Location: ${meeting.location || 'Not specified'}
Domain: ${domain}
Contacts: ${contactStr}
Meeting Notes: ${meeting.description ? meeting.description.slice(0, 500) : 'None'}

FULL BISNOW FLORIDA EVENT CALENDAR (upcoming):
${fullEventCalendar}

BISNOW NATIONAL EVENTS (key markets for cross-sell):
${nationalEvents}

COMPLETE BISNOW PRODUCT & PRICING MENU:
${fullProducts}

TARGET AUDIENCE MAPPING (who attends Bisnow events by company type):
${targetAudiences}

BISNOW EVENT ATTENDEE DEMOGRAPHICS:
- ${BISNOW_ATTENDEE_STATS.vpPlus} are VP-level or above
- ${BISNOW_ATTENDEE_STATS.cSuite} are C-suite
- ${BISNOW_ATTENDEE_STATS.ownersOperatorsDevPELenders} are Owners/Operators/Developers/PE/Lenders
- Average attendance: ${BISNOW_ATTENDEE_STATS.avgAttendees} per event
- ${BISNOW_ATTENDEE_STATS.totalSubscribers} total subscribers, ${BISNOW_ATTENDEE_STATS.totalReaders} annual readers

RESEARCH INSTRUCTIONS:
1. Search for EACH contact on LinkedIn. Get their exact LinkedIn URL, current title, and a 1-2 sentence career bio (years of experience, notable achievements, previous companies, specializations).
2. Research the company deeply: revenue, employee count, key metrics, CRE relevance, Florida operations, recent transactions/projects.
3. Search for "${domain} bisnow" and "${domain} sponsor" to find any past Bisnow relationship.
4. Search for recent company news (deals, projects, hires, market reports) from the last 12 months.
5. For each news item, map it to a SPECIFIC Bisnow event and explain why that event is the perfect platform.
6. Build a recommended pitch of 4-6 specific products with exact prices that create a compelling package.
7. Identify national cross-sell opportunities if the company operates in multiple US markets.

Return JSON with this EXACT structure:
{
  "contacts": [
    {
      "name": "Full Name",
      "title": "Current Title at Company",
      "company": "Company Name",
      "linkedin_url": "https://linkedin.com/in/exact-profile-slug",
      "email": "their@email.com",
      "bio": "15+ year CRE veteran. Previously VP at JLL. Specializes in office leasing. Led $500M in transactions in 2024."
    }
  ],
  "company": {
    "name": "Full Company Name",
    "description": "Detailed company description including key metrics (revenue, AUM, transaction volume, employees, office count). Be specific.",
    "hq": "City, State",
    "size_estimate": "e.g. 500 employees / $2B revenue",
    "revenue": "$X revenue or AUM figure if available",
    "employees": "Number or estimate",
    "cre_relevance": "HIGH/MEDIUM/LOW with specific explanation of their CRE business",
    "florida_presence": "Specific Florida offices, team size, recent Florida deals",
    "primary_markets": ["Miami", "Fort Lauderdale", "Palm Beach"]
  },
  "sponsorship_intel": {
    "past_cre_sponsorships": ["List any CRE event sponsorships found (ICSC, ULI, NAIOP, CREFC, Bisnow, etc.)"],
    "current_sponsorships": ["Any current/active sponsorships"],
    "advertising_evidence": ["Any advertising, sponsored content, or marketing activities found"],
    "past_bisnow_sponsor": true
  },
  "recent_news": [
    {
      "headline": "Specific headline about a real deal/project/hire",
      "summary": "2-3 sentence summary with specific numbers",
      "url": "https://source-url.com/article",
      "date": "2026-01-15",
      "mapped_bisnow_event": "South Florida Office Summit (Jun 11)",
      "event_rationale": "This deal directly relates to the office market discussion at this event. Speaking opportunity to showcase their expertise."
    }
  ],
  "match_score": 85,
  "match_reasoning": "2-3 sentences explaining WHY this score, referencing specific data points",
  "best_fit_events": [
    {
      "event_name": "Exact Event Name from calendar",
      "date": "2026-06-11",
      "venue": "Venue name",
      "market": "South Florida",
      "why": "Specific explanation connecting company's business to this event's audience and topic"
    }
  ],
  "recommended_products": [
    {
      "product": "Panelist Package @ South Florida Office Summit (Jun 11)",
      "price": "$7,350",
      "rationale": "Speaking slot positions them as office market experts. Their recent Gateway leasing assignment makes them the perfect panelist."
    }
  ],
  "national_opportunity": "If applicable: 'Company has offices in NYC, Chicago, Boston. Cross-sell to Bisnow teams in those markets. Specific events: NYC State of the Market (Nov), Chicago SOTM (Oct).' or null if purely local.",
  "target_audience": {
    "primary": ["Investors", "Developers", "Owners"],
    "secondary": ["Lenders", "Property managers"],
    "pitch_rationale": "Explain WHY these are the people this company wants to meet and HOW Bisnow events deliver them. Reference the attendee demographics."
  },
  "icebreaker": "A specific, researched conversation opener referencing a real recent deal, project, or achievement. Not generic."
}

IMPORTANT:
- Include 3-5 recent_news items if available (with event mappings for each)
- Include 4-6 recommended_products to build a $30K-$50K+ pipeline
- Use EXACT prices from the product menu above
- Each recommended product should name a SPECIFIC event from the calendar
- Contact bios should include real career details from LinkedIn, not generic placeholders
- LinkedIn URLs must be real profile URLs you found via search, not guesses
- If you cannot find a LinkedIn profile, set linkedin_url to empty string ""`;

  try {
    const response = await callAnthropicAPI({
      apiKey: API_KEY,
      system,
      userMessage,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      maxTokens: 8000,
    });

    const text = extractText(response);

    try {
      const result = parseJSON(text);
      log(`  ${domain}: score ${result.match_score ?? 0}, ${result.recommended_products?.length || 0} products, ${result.recent_news?.length || 0} news`);
      return result;
    } catch (parseErr) {
      log(`  Failed to parse JSON for ${domain}: ${parseErr.message}`);
      log(`  Raw text for ${domain}: ${text.slice(0, 500)}`);
      return buildFallbackResult(contactsToUse, domain, 'Claude returned non-JSON output');
    }
  } catch (err) {
    const msg = String(err?.message || err);

    if (msg.includes('rate_limit_error') || msg.includes('429')) {
      log(`  Rate limited while researching ${domain}; returning fallback result`);
      return buildFallbackResult(contactsToUse, domain, 'Skipped due to Anthropic rate limiting');
    }

    log(`  Failed to research ${domain}: ${msg}`);
    return buildFallbackResult(contactsToUse, domain, 'Research data unavailable');
  }
}

// ─── Send Email ───

async function sendEmail(html, date) {
  if (DRY_RUN) {
    log('DRY_RUN mode — writing HTML to stdout');
    console.log(html);
    return;
  }

  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');
  if (!DIGEST_EMAIL) throw new Error('DIGEST_EMAIL not set');

  log(`Sending digest to ${DIGEST_EMAIL}...`);

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: DIGEST_FROM,
      to: [DIGEST_EMAIL],
      subject: `Bisnow Sales Digest — ${formattedDate}`,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  log(`Email sent! ID: ${result.id}`);
}

// ─── Main ───

async function main() {
  const startTime = Date.now();
  const today = getTodayStr();

  log(`=== Bisnow Daily Sales Digest — ${today} ===`);
  log(`SCRIPT_VERSION=${SCRIPT_VERSION}`);

  if (!API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }
  if (!RESEND_API_KEY && !DRY_RUN) {
    console.error('ERROR: RESEND_API_KEY not set (use DRY_RUN=true to skip email)');
    process.exit(1);
  }
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    console.error('ERROR: Google OAuth credentials not set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)');
    process.exit(1);
  }

  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    log('Weekend — skipping digest');
    process.exit(0);
  }

  const events = await fetchCalendarDirect();

  if (events.length === 0) {
    log('No external meetings today. Sending summary email.');
    const html = generateDigestEmail({
      date: today,
      meetings: [],
      upcomingEvents: getUpcomingEvents(8),
      nextEvent: getNextEvent(),
    });
    await sendEmail(html, today);
    process.exit(0);
  }

  const results = [];

  for (const meeting of events) {
    const { external } = classifyContacts(meeting.attendees);
    if (external.length === 0) continue;

    const filtered = getBestExternalContacts(external);
    const contactsToUse = filtered.length > 0 ? filtered : external;

    const domain = normalizeDomain(contactsToUse[0]?.email || '');
    log(`DEBUG domain check: ${domain} | excluded=${isExcludedDomain(domain)}`);

    if (!domain || isExcludedDomain(domain)) {
      log(`Skipping excluded domain: ${domain || 'unknown'}`);
      continue;
    }

    const research = await researchMeeting(meeting, contactsToUse);
    results.push({ meeting, research });

    // 60s delay between research calls to respect rate limits
    if (events.indexOf(meeting) < events.length - 1) {
      await sleep(60000);
    }
  }

  log(`Researched ${results.length} meetings`);

  const html = generateDigestEmail({
    date: today,
    meetings: results,
    upcomingEvents: getUpcomingEvents(8),
    nextEvent: getNextEvent(),
  });

  await sendEmail(html, today);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`Done in ${elapsed}s`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
