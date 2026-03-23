// Anthropic API client for server-side usage
// Uses web_search built-in tool (no MCP servers needed)
// Includes retry logic for rate limits (429 errors)

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 15000; // 15s base delay for rate limit retries

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callAnthropicAPI({ apiKey, system, userMessage, tools = [], maxTokens = 3000 }) {
  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMessage }],
  };

  if (tools.length > 0) {
    body.tools = tools;
  }

  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };

  if (tools.some(t => t.type?.startsWith('web_search'))) {
    headers['anthropic-beta'] = 'web-search-2025-03-05';
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return response.json();
    }

    const errText = await response.text();

    // Retry on rate limit (429) or server error (529 overloaded)
    if ((response.status === 429 || response.status === 529) && attempt < MAX_RETRIES) {
      const retryAfter = response.headers.get('retry-after');
      const delayMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : BASE_DELAY_MS * Math.pow(2, attempt); // 15s, 30s, 60s, 120s
      const delaySec = (delayMs / 1000).toFixed(0);
      console.error(`[Rate limit] ${response.status} on attempt ${attempt + 1}/${MAX_RETRIES + 1}. Retrying in ${delaySec}s...`);
      await sleep(delayMs);
      continue;
    }

    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }
}

export function extractText(response) {
  if (!response?.content) return '';
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

export function parseJSON(text) {
  const candidates = [
    text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1],
    text.match(/(\{[\s\S]*\})/)?.[1],
    text.match(/(\[[\s\S]*\])/)?.[1],
    text,
  ].filter(Boolean);

  for (let candidate of candidates) {
    try {
      return JSON.parse(candidate.trim());
    } catch {
      try {
        const cleaned = candidate
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2018\u2019]/g, "'")
          .trim();
        return JSON.parse(cleaned);
      } catch {
      }
    }
  }

  throw new Error('Unable to parse JSON response from Anthropic');
}
