#!/usr/bin/env node

// Bisnow Daily Sales Digest — Automated Email Script
// Runs Mon-Fri via GitHub Actions cron or manually via: node scripts/daily-digest.mjs
//
// Required environment variables:
//   ANTHROPIC_API_KEY  — Anthropic API key
//   RESEND_API_KEY     — Resend API key (https://resend.com)
//   DIGEST_EMAIL       — Recipient email address
//   DIGEST_FROM        — (optional) Sender email, default: digest@bisnow.com
//
// Optional:
//   DRY_RUN=true       — Skip sending email, print HTML to stdout

import { callAnthropicAPI, extractText, parseJSON } from './lib/anthropic.mjs';
import { ALL_FLORIDA_EVENTS, EVENT_PACKAGES, DIGITAL_PRODUCTS, INTERNAL_DOMAINS, TARGET_AUDIENCE_MAP } from './lib/data.mjs';
import { generateDigestEmail } from './lib/email-template.mjs';

const API_KEY = process.env.ANTHROPIC_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DIGEST_EMAIL = process.env.DIGEST_EMAIL;
const DIGEST_FROM = process.env.DIGEST_FROM || 'Bisnow Sales Digest <digest@bisnow.com>';
const DRY_RUN = process.env.DRY_RUN === 'true';

function getTodayStr() {
  // Use Eastern Time
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function log(msg) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ${msg}`);
}

// ─── Data helpers (same logic as src/utils/api.js) ───

function buildEventCalendarText() {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS.filter(e => e.date >= today)
    .map(e => `${e.date} | ${e.name} | ${e.format} | ${e.panels} panels | ${e.venue} | ${e.market}`)
    .join('\n');
}

function buildProductsText() {
  const eventPkgs = EVENT_PACKAGES.map(p =>
    `${p.name}: $${p.price.toLocaleString()} (${p.tickets} tickets) — ${p.inclusions}`
  ).join('\n');

  const digital = [
    `South FL Morning Brief: Takeover $${DIGITAL_PRODUCTS.southFloridaBrief.takeover} | Lead Ad $${DIGITAL_PRODUCTS.southFloridaBrief.leadAd} | Sponsored Link $${DIGITAL_PRODUCTS.southFloridaBrief.sponsoredLink} (${DIGITAL_PRODUCTS.southFloridaBrief.audience.toLocaleString()} subscribers)`,
    `Dedicated Email (SoFL): $${DIGITAL_PRODUCTS.dedicatedEmail.price.toLocaleString()} (${DIGITAL_PRODUCTS.dedicatedEmail.audience.toLocaleString()} audience)`,
    `Post-Event Dedicated Email: $${DIGITAL_PRODUCTS.postEventEmail.price.toLocaleString()}`,
    `Custom Content Article (Studio B): $${DIGITAL_PRODUCTS.customArticle.price.toLocaleString()}`,
  ].join('\n');

  return `EVENT SPONSORSHIP PACKAGES:\n${eventPkgs}\n\nDIGITAL PRODUCTS:\n${digital}`;
}

function buildTargetAudienceText() {
  return Object.entries(TARGET_AUDIENCE_MAP)
    .map(([type, { primary, secondary }]) =>
      `${type}: Primary → ${primary.join(', ')} | Secondary → ${secondary.join(', ')}`)
    .join('\n');
}

function classifyContacts(attendees) {
  const internal = [];
  const external = [];
  for (const a of attendees || []) {
    const domain = (a.email || '').split('@')[1]?.toLowerCase();
    if (INTERNAL_DOMAINS.includes(domain)) {
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

// ─── Step 1: Fetch Calendar ───

async function fetchCalendar() {
  log('Fetching Google Calendar events...');
  const today = getTodayStr();

  const system = `Fetch today's events for jordan.hinsch@bisnow.com and return ONLY valid JSON array. Include ALL events that have at least one attendee whose email does NOT end in @bisnow.com, @biscred.com, @selectleaders.com, or @openseasadvisory.com. Internal attendees from those four domains should still be listed — include the FULL attendee list for each event. Structure: [{"title":"...","start_time":"...","end_time":"...","location":"...","description":"...","attendees":[{"email":"...","name":"..."}]}]. JSON only, no markdown.`;

  const userMessage = `Get all events for jordan.hinsch@bisnow.com on ${today}. Return events that have at least one non-Bisnow/BisCred/SelectLeaders/OpenSeasAdvisory attendee. Include the full attendee list for each event. JSON only, no markdown.`;

  const response = await callAnthropicAPI({
    apiKey: API_KEY,
    system,
    userMessage,
    mcpServers: [{ type: 'url', url: 'https://gcal.mcp.claude.com/mcp', name: 'google-calendar' }],
    maxTokens: 2000,
  });

  const text = extractText(response);
  try {
    const events = parseJSON(text);
    log(`Found ${events.length} external meetings`);
    return Array.isArray(events) ? events : [];
  } catch (err) {
    log(`Failed to parse calendar: ${err.message}`);
    log(`Raw response: ${text.slice(0, 500)}`);
    return [];
  }
}

// ─── Step 2: Research Each Meeting ───

async function researchMeeting(meeting, externalContacts) {
  const contactStr = externalContacts.map(c => `${c.name || 'Unknown'} <${c.email}>`).join(', ');
  const domain = externalContacts[0]?.email?.split('@')[1] || 'unknown';
  log(`Researching ${domain}...`);

  const system = `You are a sales intelligence researcher for Bisnow, a CRE media company. Jordan Hinsch is Head of Sales for Florida. Research contacts and companies for his meetings.

BISNOW FLORIDA EVENT CALENDAR (future events only):
${buildEventCalendarText()}

BISNOW PRODUCTS & PRICING:
${buildProductsText()}

TARGET AUDIENCE MAPPING:
${buildTargetAudienceText()}

Return ONLY valid JSON (no markdown code blocks):
{
  "contacts": [{"name": "str", "title": "str", "company": "str", "linkedin_url": "str", "email": "str"}],
  "company": {"name": "str", "description": "str", "hq": "str", "size_estimate": "str", "cre_relevance": "str", "florida_presence": "str", "primary_markets": ["str"]},
  "sponsorship_intel": {"past_cre_sponsorships": [], "current_sponsorships": [], "advertising_evidence": [], "past_bisnow_sponsor": false},
  "recent_news": [{"headline": "str", "summary": "str", "url": "str", "date": "str", "mapped_bisnow_event": "str or null", "mapped_event_date": "str or null"}],
  "match_score": 0,
  "match_reasoning": "str",
  "best_fit_events": [{"event_name": "str", "date": "str", "venue": "str", "market": "str", "why": "str"}],
  "recommended_products": [{"product": "str", "price": "str", "rationale": "str"}],
  "national_opportunity": "str or null",
  "target_audience": {"primary": ["str"], "secondary": ["str"], "pitch_rationale": "str"},
  "icebreaker": "str"
}`;

  const userMessage = `Research for Bisnow sales meeting:
Meeting: ${meeting.title}
Time: ${meeting.start_time}
Contacts: ${contactStr}

Find: 1) LinkedIn profiles 2) Company overview & CRE relevance 3) Past/current sponsorships/advertising with URLs 4) Recent news (30 days) — MAP each news item to a specific upcoming Bisnow event if relevant 5) Match score 0-100 6) Best-fit Bisnow events (Florida first, then national) 7) 2-3 product recommendations with pricing 8) National cross-sell opportunities 9) WHO THEY WANT TO MEET — determine the prospect's target audience at a Bisnow event based on their company type 10) Specific icebreaker

Return JSON only, no markdown code blocks.`;

  const response = await callAnthropicAPI({
    apiKey: API_KEY,
    system,
    userMessage,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    mcpServers: [{ type: 'url', url: 'https://mcp.zoominfo.com/mcp', name: 'zoominfo' }],
    maxTokens: 4096,
  });

  const text = extractText(response);
  try {
    const result = parseJSON(text);
    log(`  ${domain}: score ${result.match_score}, ${result.recommended_products?.length || 0} products`);
    return result;
  } catch (err) {
    log(`  Failed to parse research for ${domain}: ${err.message}`);
    return {
      contacts: externalContacts.map(c => ({
        name: c.name || 'Unknown', title: 'Unknown', company: domain,
        linkedin_url: '', email: c.email,
      })),
      company: { name: domain, description: 'Research unavailable', hq: 'Unknown', size_estimate: 'Unknown', cre_relevance: 'Unknown', florida_presence: 'Unknown', primary_markets: [] },
      sponsorship_intel: { past_cre_sponsorships: [], current_sponsorships: [], advertising_evidence: [], past_bisnow_sponsor: false },
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

// ─── Step 3: Send Email via Resend ───

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
    weekday: 'short', month: 'short', day: 'numeric',
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

  // Validate env
  if (!API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set');
    process.exit(1);
  }
  if (!RESEND_API_KEY && !DRY_RUN) {
    console.error('ERROR: RESEND_API_KEY not set (use DRY_RUN=true to skip email)');
    process.exit(1);
  }

  // Skip weekends
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    log('Weekend — skipping digest');
    process.exit(0);
  }

  // Step 1: Calendar
  const events = await fetchCalendar();

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

  // Step 2: Research each meeting
  const results = [];
  for (const meeting of events) {
    const { external } = classifyContacts(meeting.attendees);
    if (external.length === 0) continue;

    const research = await researchMeeting(meeting, external);
    results.push({ meeting, research });
  }

  log(`Researched ${results.length} meetings`);

  // Step 3: Generate email
  const html = generateDigestEmail({
    date: today,
    meetings: results,
    upcomingEvents: getUpcomingEvents(5),
    nextEvent: getNextEvent(),
  });

  // Step 4: Send
  await sendEmail(html, today);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`Done in ${elapsed}s`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
