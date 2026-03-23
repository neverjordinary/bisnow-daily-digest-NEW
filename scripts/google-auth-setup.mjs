#!/usr/bin/env node

// One-time setup to generate a Google OAuth refresh token for calendar access.
//
// Prerequisites:
//   1. Go to https://console.cloud.google.com
//   2. Create a project (or use existing)
//   3. Enable "Google Calendar API"
//   4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
//      - Application type: "Web application"
//      - Authorized redirect URIs: add "http://localhost:3333/callback"
//   5. Copy the Client ID and Client Secret
//
// Usage:
//   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/google-auth-setup.mjs
//
// This will:
//   1. Open a browser for Google sign-in
//   2. Ask for Calendar read-only permission
//   3. Print your GOOGLE_REFRESH_TOKEN to add as a GitHub secret

import http from 'node:http';
import { execSync } from 'node:child_process';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3333/callback';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Usage: GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/google-auth-setup.mjs');
  process.exit(1);
}

// Step 1: Build auth URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('\n=== Google Calendar OAuth Setup ===\n');
console.log('Open this URL in your browser:\n');
console.log(authUrl.toString());
console.log('\nWaiting for callback on http://localhost:3333 ...\n');

// Try to open browser automatically
try {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execSync(`${cmd} "${authUrl.toString()}"`, { stdio: 'ignore' });
} catch {
  // Manual open is fine
}

// Step 2: Listen for the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>Error: ${error}</h1><p>Please try again.</p>`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>No authorization code received</h1>');
    return;
  }

  // Step 3: Exchange code for tokens
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const tokens = await tokenResponse.json();

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1 style="color:green;">Success!</h1>
      <p>Refresh token generated. Check your terminal.</p>
      <p>You can close this tab.</p>
    `);

    console.log('=== SUCCESS ===\n');
    console.log('Add these as GitHub repository secrets:\n');
    console.log(`  GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`  GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`  GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nGo to: Repo Settings → Secrets and variables → Actions → New repository secret\n');

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Error</h1><p>${err.message}</p>`);
    console.error('ERROR:', err.message);
  }

  server.close();
  setTimeout(() => process.exit(0), 500);
});

server.listen(3333);
