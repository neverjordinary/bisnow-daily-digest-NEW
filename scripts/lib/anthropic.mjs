// Anthropic API client for server-side usage
// Uses web_search built-in tool (no MCP servers needed)

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function callAnthropicAPI({ apiKey, system, userMessage, tools = [], maxTokens = 4096 }) {
  const body = {
    model: 'claude-sonnet-4-20250514',
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

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }

  return response.json();
}

export function extractText(response) {
  if (!response?.content) return '';
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');
}

export function parseJSON(text) {
  const jsonMatch =
    text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    text.match(/(\{[\s\S]*\})/) ||
    text.match(/(\[[\s\S]*\])/);

  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }
  return JSON.parse(text.trim());
}
