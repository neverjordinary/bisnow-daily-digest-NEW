#!/usr/bin/env node

import { callAnthropicAPI, extractText, parseJSON } from './lib/anthropic.mjs';
import { ALL_FLORIDA_EVENTS, EVENT_PACKAGES, DIGITAL_PRODUCTS, INTERNAL_DOMAINS, TARGET_AUDIENCE_MAP } from './lib/data.mjs';
import { generateDigestEmail } from './lib/email-template.mjs';

const SCRIPT_VERSION = '2026-03-23-v5';

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

function buildEventCalendarText() {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS
    .filter(e => e.date >= today)
    .slice(0, 12)
    .map(e => `${e.date} | ${e.name} | ${e.market}`)
    .join('\n');
}

function buildProductsText() {
  const eventPkgs = EVENT_PACKAGES.slice(0, 6).map(p =>
    `${p.name}: $${p.price.toLocaleString()} — ${p.inclusions}`
  ).join('\n');

  const digital = [
    `South FL Morning Brief: Takeover $${DIGITAL_PRODUCTS.southFloridaBrief.takeover} | Lead Ad $${DIGITAL_PRODUCTS.southFloridaBrief.leadAd} | Sponsored Link $${DIGITAL_PRODUCTS.southFloridaBrief.sponsoredLink}`,
    `Dedicated Email (SoFL): $${DIGITAL_PRODUCTS.dedicatedEmail.price.toLocaleString()}`,
    `Post-Event Dedicated Email: $${DIGITAL_PRODUCTS.postEventEmail.price.toLocaleString()}`,
    `Custom Content Article (Studio B): $${DIGITAL_PRODUCTS.customArticle.price.toLocaleString()}`,
  ].join('\n');

  return `EVENT SPONSORSHIP PACKAGES:\n${eventPkgs}\n\nDIGITAL PRODUCTS:\n${digital}`;
}

function buildTargetAudienceText() {
  return Object.entries(TARGET_AUDIENCE_MAP)
    .slice(0, 12)
    .map(([type, { primary, secondary }]) =>
      `${type}: Primary → ${primary.join(', ')} | Secondary → ${secondary.join(', ')}`)
    .join('\n');
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

function getUpcomingEvents(count = 5) {
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

async function researchMeeting(meeting, externalContacts) {
  const filteredContacts = getBestExternalContacts(externalContacts);
  const contactsToUse = filteredContacts.length > 0 ? filteredContacts : externalContacts;

  const domain = normalizeDomain(contactsToUse[0]?.email || '');
  if (!domain || isExcludedDomain(domain)) {
    log(`Skipping excluded domain inside researchMeeting: ${domain || 'unknown'}`);
    return {
      contacts: contactsToUse.map(c => ({
        name: c.name || 'Unknown',
        title: 'Unknown',
        company: domain || 'Unknown',
        linkedin_url: '',
        email: c.email,
      })),
      company: {
        name: domain || 'Unknown',
        description: 'Skipped excluded/non-company domain',
        hq: 'Unknown',
        size_estimate: 'Unknown',
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
      match_reasoning: 'Skipped excluded or non-company domain',
      best_fit_events: [],
      recommended_products: [],
      national_opportunity: null,
      target_audience: { primary: [], secondary: [], pitch_rationale: '' },
      icebreaker: '',
    };
  }

  const contactStr = contactsToUse
    .map(c => `${c.name || 'Unknown'} <${c.email}>`)
    .join(', ');

  log(`Researching ${domain}...`);

  const upcomingEvents = getUpcomingEvents(5)
    .map(e => `${e.name} | ${e.date} | ${e.market}`)
    .join('\n');

  const compactProducts = [
    'Event sponsorships: speaking, branding, tickets',
    'South Florida Morning Brief ads',
    'Dedicated emails',
    'Custom content / Studio B',
  ].join('\n');

  const system = `You are a sales researcher for Bisnow Florida.
Research the company and meeting contacts using web search.
Keep the result concise, practical, and sales-focused.
Return valid JSON only.`;

  const userMessage = `Meeting: ${meeting.title}
Time: ${meeting.start_time}
Domain: ${domain}
Contacts: ${contactStr}

Upcoming Bisnow Florida events:
${upcomingEvents}

Bisnow products:
${compactProducts}

Return JSON with this exact structure:
{
  "contacts": [{"name":"str","title":"str","company":"str","linkedin_url":"str","email":"str"}],
  "company": {"name":"str","description":"str","hq":"str","size_estimate":"str","cre_relevance":"str","florida_presence":"str","primary_markets":["str"]},
  "sponsorship_intel": {"past_cre_sponsorships":[],"current_sponsorships":[],"advertising_evidence":[],"past_bisnow_sponsor":false},
  "recent_news": [{"headline":"str","summary":"str","url":"str","date":"str"}],
  "match_score": 0,
  "match_reasoning": "str",
  "best_fit_events": [{"event_name":"str","date":"str","market":"str","why":"str"}],
  "recommended_products": [{"product":"str","price":"str","rationale":"str"}],
  "national_opportunity": "str or null",
  "target_audience": {"primary":["str"],"secondary":["str"],"pitch_rationale":"str"},
  "icebreaker": "str"
}

Rules:
- keep recent_news to max 2
- keep best_fit_events to max 2
- keep recommended_products to max 2
- do not include markdown
- do not include trailing commas
- if unsure, use empty arrays or empty strings
- keep all fields short
- return JSON only`;

  try {
    const response = await callAnthropicAPI({
      apiKey: API_KEY,
      system,
      userMessage,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      maxTokens: 3000,
    });

    const text = extractText(response);

    try {
      const result = parseJSON(text);
      log(`  ${domain}: score ${result.match_score ?? 0}, ${result.recommended_products?.length || 0} products`);
      return result;
    } catch (parseErr) {
      log(`  Failed to parse JSON for ${domain}: ${parseErr.message}`);
      log(`  Raw text for ${domain}: ${text}`);

      return {
        contacts: contactsToUse.map(c => ({
          name: c.name || 'Unknown',
          title: 'Unknown',
          company: domain,
          linkedin_url: '',
          email: c.email,
        })),
        company: {
          name: domain,
          description: text.slice(0, 500) || 'Research returned non-JSON text',
          hq: 'Unknown',
          size_estimate: 'Unknown',
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
        match_reasoning: 'Claude returned non-JSON output',
        best_fit_events: [],
        recommended_products: [],
        national_opportunity: null,
        target_audience: { primary: [], secondary: [], pitch_rationale: '' },
        icebreaker: '',
      };
    }
  } catch (err) {
    const msg = String(err?.message || err);

    if (msg.includes('rate_limit_error') || msg.includes('429')) {
      log(`  Rate limited while researching ${domain}; returning fallback result`);
      return {
        contacts: contactsToUse.map(c => ({
          name: c.name || 'Unknown',
          title: 'Unknown',
          company: domain,
          linkedin_url: '',
          email: c.email,
        })),
        company: {
          name: domain,
          description: 'Research skipped due to rate limiting',
          hq: 'Unknown',
          size_estimate: 'Unknown',
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
        match_reasoning: 'Skipped due to Anthropic rate limiting',
        best_fit_events: [],
        recommended_products: [],
        national_opportunity: null,
        target_audience: { primary: [], secondary: [], pitch_rationale: '' },
        icebreaker: '',
      };
    }

    log(`  Failed to research ${domain}: ${msg}`);
    return {
      contacts: contactsToUse.map(c => ({
        name: c.name || 'Unknown',
        title: 'Unknown',
        company: domain,
        linkedin_url: '',
        email: c.email,
      })),
      company: {
        name: domain,
        description: 'Research unavailable',
        hq: 'Unknown',
        size_estimate: 'Unknown',
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
      match_reasoning: 'Research data unavailable',
      best_fit_events: [],
      recommended_products: [],
      national_opportunity: null,
      target_audience: { primary: [], secondary: [], pitch_rationale: '' },
      icebreaker: '',
    };
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
      upcomingEvents: getUpcomingEvents(5),
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

    await sleep(90000);
  }

  log(`Researched ${results.length} meetings`);

  const html = generateDigestEmail({
    date: today,
    meetings: results,
    upcomingEvents: getUpcomingEvents(5),
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
