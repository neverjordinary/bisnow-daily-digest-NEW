import { ALL_FLORIDA_EVENTS, NATIONAL_EVENTS_SUMMARY } from '../data/events';
import { EVENT_PACKAGES, DIGITAL_PRODUCTS, NATIONAL_BRIEFS, INTERNAL_DOMAINS, TARGET_AUDIENCE_MAP } from '../data/products';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey() {
  return localStorage.getItem('bisnow_anthropic_api_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('bisnow_anthropic_api_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

function getTodayStr() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function buildEventCalendarText() {
  const today = getTodayStr();
  const futureEvents = ALL_FLORIDA_EVENTS.filter(e => e.date >= today);
  return futureEvents
    .map(e => `${e.date} | ${e.name} | ${e.format} | ${e.panels} panels | ${e.venue} | ${e.market}`)
    .join('\n');
}

function buildNationalSummary() {
  return NATIONAL_EVENTS_SUMMARY
    .map(m => `${m.market} (${m.totalEvents} events): ${m.keyEvents.join(', ')}`)
    .join('\n');
}

function buildProductsText() {
  const eventPkgs = EVENT_PACKAGES.map(p => `${p.name}: $${p.price.toLocaleString()} (${p.tickets} tickets) — ${p.inclusions}`).join('\n');
  const digital = [
    `South FL Morning Brief: Takeover $${DIGITAL_PRODUCTS.southFloridaBrief.takeover} | Lead Ad $${DIGITAL_PRODUCTS.southFloridaBrief.leadAd} | Sponsored Link $${DIGITAL_PRODUCTS.southFloridaBrief.sponsoredLink} (${DIGITAL_PRODUCTS.southFloridaBrief.audience.toLocaleString()} subscribers)`,
    `Dedicated Email (SoFL): $${DIGITAL_PRODUCTS.dedicatedEmail.price.toLocaleString()} (${DIGITAL_PRODUCTS.dedicatedEmail.audience.toLocaleString()} audience)`,
    `Post-Event Dedicated Email: $${DIGITAL_PRODUCTS.postEventEmail.price.toLocaleString()}`,
    `Custom Content Article (Studio B): $${DIGITAL_PRODUCTS.customArticle.price.toLocaleString()}`,
    `Website Banner (ROS): $${DIGITAL_PRODUCTS.websiteBannerROS.cpm} CPM | Targeted: $${DIGITAL_PRODUCTS.websiteBannerTargeted.cpm} CPM`,
  ].join('\n');
  const briefs = NATIONAL_BRIEFS.map(b => `${b.name}: ${b.audience.toLocaleString()} subs | Takeover $${(b.takeover || b.weeklyRate || 0).toLocaleString()}${b.weeklyRate ? '/week' : ''}`).join('\n');
  return `EVENT SPONSORSHIP PACKAGES:\n${eventPkgs}\n\nDIGITAL PRODUCTS:\n${digital}\n\nNATIONAL BRIEFS:\n${briefs}`;
}

function buildTargetAudienceText() {
  return Object.entries(TARGET_AUDIENCE_MAP)
    .map(([type, { primary, secondary }]) => `${type}: Primary → ${primary.join(', ')} | Secondary → ${secondary.join(', ')}`)
    .join('\n');
}

async function callAnthropicAPI({ system, userMessage, mcpServers = [], tools = [], maxTokens = 4096 }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key not set');

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMessage }],
  };

  if (mcpServers.length > 0) {
    body.mcp_servers = mcpServers;
  }
  if (tools.length > 0) {
    body.tools = tools;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2025-01-01',
      'anthropic-beta': 'mcp-client-2025-04-04',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  return response.json();
}

function extractTextFromResponse(response) {
  if (!response?.content) return '';
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

function parseJSON(text) {
  // Try to extract JSON from the text (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/) || text.match(/(\[[\s\S]*\])/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }
  return JSON.parse(text.trim());
}

export async function fetchCalendarEvents(onStatus) {
  onStatus?.('Fetching calendar...');
  const today = getTodayStr();

  const system = `Fetch today's events for jordan.hinsch@bisnow.com and return ONLY valid JSON array. Include ALL events that have at least one attendee whose email does NOT end in @bisnow.com, @biscred.com, @selectleaders.com, or @openseasadvisory.com. Internal attendees from those four domains should still be listed — include the FULL attendee list for each event. Structure: [{"title":"...","start_time":"...","end_time":"...","location":"...","description":"...","attendees":[{"email":"...","name":"..."}]}]. JSON only, no markdown.`;

  const userMessage = `Get all events for jordan.hinsch@bisnow.com on ${today}. Return events that have at least one non-Bisnow/BisCred/SelectLeaders/OpenSeasAdvisory attendee. Include the full attendee list for each event. JSON only, no markdown.`;

  const response = await callAnthropicAPI({
    system,
    userMessage,
    mcpServers: [{ type: 'url', url: 'https://gcal.mcp.claude.com/mcp', name: 'google-calendar' }],
    maxTokens: 2000,
  });

  const text = extractTextFromResponse(response);
  try {
    const events = parseJSON(text);
    return Array.isArray(events) ? events : [];
  } catch {
    console.error('Failed to parse calendar response:', text);
    return [];
  }
}

export async function researchMeeting(meeting, externalContacts, onStatus) {
  const contactStr = externalContacts.map(c => `${c.name || 'Unknown'} <${c.email}>`).join(', ');
  onStatus?.(`Researching ${externalContacts[0]?.email?.split('@')[1] || 'contacts'}...`);

  const eventCalendar = buildEventCalendarText();
  const nationalSummary = buildNationalSummary();
  const products = buildProductsText();
  const targetAudience = buildTargetAudienceText();

  const system = `You are a sales intelligence researcher for Bisnow, a CRE media company. Jordan Hinsch is Head of Sales for Florida. Research contacts and companies for his meetings.

BISNOW FLORIDA EVENT CALENDAR (future events only):
${eventCalendar}

BISNOW NATIONAL MARKETS:
${nationalSummary}

BISNOW PRODUCTS & PRICING:
${products}

TARGET AUDIENCE MAPPING:
${targetAudience}

Return ONLY valid JSON (no markdown code blocks):
{
  "contacts": [{"name": "str", "title": "str", "company": "str", "linkedin_url": "str", "email": "str"}],
  "company": {"name": "str", "description": "str", "hq": "str", "size_estimate": "str", "cre_relevance": "str", "florida_presence": "str", "primary_markets": ["str"]},
  "sponsorship_intel": {"past_cre_sponsorships": [{"event": "str", "url": "str"}], "current_sponsorships": [{"event": "str", "url": "str"}], "advertising_evidence": ["str"], "past_bisnow_sponsor": false},
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
    system,
    userMessage,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    mcpServers: [{ type: 'url', url: 'https://mcp.zoominfo.com/mcp', name: 'zoominfo' }],
    maxTokens: 4096,
  });

  const text = extractTextFromResponse(response);
  try {
    return parseJSON(text);
  } catch {
    console.error('Failed to parse research response:', text);
    return {
      contacts: externalContacts.map(c => ({ ...c, title: 'Unknown', company: c.email.split('@')[1], linkedin_url: `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent((c.name || '') + ' ' + c.email.split('@')[1])}` })),
      company: { name: externalContacts[0]?.email?.split('@')[1] || 'Unknown', description: 'Research unavailable', hq: 'Unknown', size_estimate: 'Unknown', cre_relevance: 'Unknown', florida_presence: 'Unknown', primary_markets: [] },
      sponsorship_intel: { past_cre_sponsorships: [], current_sponsorships: [], advertising_evidence: [], past_bisnow_sponsor: false },
      recent_news: [],
      match_score: 0,
      match_reasoning: 'Research data unavailable',
      best_fit_events: [],
      recommended_products: [],
      national_opportunity: null,
      target_audience: { primary: [], secondary: [], pitch_rationale: '' },
      icebreaker: '',
      _raw_response: text,
    };
  }
}

export function classifyContacts(attendees) {
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

export function getUpcomingFloridaEvents(count = 5) {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS.filter(e => e.date >= today).slice(0, count);
}

export function getNextFloridaEvent() {
  const today = getTodayStr();
  return ALL_FLORIDA_EVENTS.find(e => e.date >= today) || null;
}

export function daysBetween(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
