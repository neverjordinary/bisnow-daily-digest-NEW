// HTML email template for the daily sales digest
// Full-featured template matching the legendary preview format

function scoreColor(score) {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 40) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function scoreLabel(score) {
  if (score >= 70) return 'Green';
  if (score >= 40) return 'Yellow';
  return 'Red';
}

function scoreBadge(score) {
  const color = scoreColor(score);
  return `<span style="display:inline-block;background:${color};color:#fff;padding:3px 12px;border-radius:12px;font-weight:bold;font-size:14px;">${score}/100 (${scoreLabel(score)})</span>`;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
  } catch {
    return timeStr;
  }
}

function daysBetween(dateStr) {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildProposalUrl(baseUrl, research) {
  if (!baseUrl) return '';
  try {
    // Encode minimal proposal data into URL hash
    const proposalData = {
      company: research.company,
      recommended_products: research.recommended_products,
      best_fit_events: research.best_fit_events,
      target_audience: research.target_audience,
      match_score: research.match_score,
    };
    const json = JSON.stringify(proposalData);
    const encoded = Buffer.from(encodeURIComponent(json)).toString('base64');
    return `${baseUrl}/proposal.html#${encoded}`;
  } catch {
    return '';
  }
}

function renderMeetingCard(meeting, research, proposalBaseUrl) {
  const score = research.match_score || 0;
  const company = research.company || {};
  const contacts = research.contacts || [];
  const news = research.recent_news || [];
  const products = research.recommended_products || [];
  const events = research.best_fit_events || [];
  const sponsorship = research.sponsorship_intel || {};
  const targetAudience = research.target_audience || {};

  // ─── Contacts Section with Bios ───
  const contactItems = contacts.map(c => {
    const linkedinLink = c.linkedin_url
      ? `<a href="${escapeHtml(c.linkedin_url)}" style="color:#2563eb;text-decoration:none;font-size:12px;">LinkedIn</a>`
      : '<span style="color:#9ca3af;font-size:12px;">LinkedIn not found</span>';
    const bio = c.bio ? `<div style="color:#6b7280;font-size:12px;margin-top:2px;line-height:1.4;">${escapeHtml(c.bio)}</div>` : '';
    return `
      <div style="margin-bottom:10px;padding:8px 12px;background:#f9fafb;border-radius:6px;">
        <div style="font-weight:600;font-size:14px;">${escapeHtml(c.name || 'Unknown')}</div>
        <div style="color:#4b5563;font-size:13px;">${escapeHtml(c.title || '')} — ${escapeHtml(c.company || '')}</div>
        <div style="margin-top:3px;">${linkedinLink}</div>
        ${bio}
      </div>
    `;
  }).join('');

  // ─── News → Event Mapping ───
  const newsItems = news.map(n => {
    const headline = n.url
      ? `<a href="${escapeHtml(n.url)}" style="color:#2563eb;text-decoration:none;font-weight:600;">"${escapeHtml(n.headline)}"</a>`
      : `<strong>"${escapeHtml(n.headline)}"</strong>`;
    const summary = n.summary ? `<div style="color:#4b5563;font-size:12px;margin:2px 0;">${escapeHtml(n.summary)}</div>` : '';
    const eventMapping = n.mapped_bisnow_event
      ? `<div style="margin-top:4px;padding:4px 8px;background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 4px 4px 0;font-size:12px;">
           <span style="color:#3b82f6;">&rarr;</span> <strong>${escapeHtml(n.mapped_bisnow_event)}</strong>
           ${n.event_rationale ? ` — <span style="color:#6b7280;">${escapeHtml(n.event_rationale)}</span>` : ''}
         </div>`
      : '';
    return `<div style="margin-bottom:10px;">${headline}${summary}${eventMapping}</div>`;
  }).join('');

  // ─── Sponsorship & Advertising Intel ───
  const pastSponsors = sponsorship.past_cre_sponsorships || [];
  const currentSponsors = sponsorship.current_sponsorships || [];
  const adEvidence = sponsorship.advertising_evidence || [];
  const hasAnySponsorshipData = pastSponsors.length > 0 || currentSponsors.length > 0 || adEvidence.length > 0;

  let sponsorshipSection = '';
  if (hasAnySponsorshipData) {
    const items = [];
    if (pastSponsors.length > 0) items.push(`<div style="margin-bottom:4px;"><strong style="font-size:12px;color:#374151;">Past CRE Sponsorships:</strong> <span style="font-size:12px;">${pastSponsors.map(escapeHtml).join(' | ')}</span></div>`);
    if (currentSponsors.length > 0) items.push(`<div style="margin-bottom:4px;"><strong style="font-size:12px;color:#374151;">Current Sponsorships:</strong> <span style="font-size:12px;">${currentSponsors.map(escapeHtml).join(' | ')}</span></div>`);
    if (adEvidence.length > 0) items.push(`<div style="margin-bottom:4px;"><strong style="font-size:12px;color:#374151;">Advertising Evidence:</strong> <span style="font-size:12px;">${adEvidence.map(escapeHtml).join(' | ')}</span></div>`);
    sponsorshipSection = `
      <div style="margin-bottom:16px;">
        <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Sponsorship &amp; Advertising Intel</h4>
        <div style="padding:8px 12px;background:#fefce8;border-radius:6px;">${items.join('')}</div>
      </div>`;
  }

  // ─── Sponsor Badge ───
  const sponsorBadge = sponsorship.past_bisnow_sponsor
    ? '<span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:600;">Past Bisnow Sponsor</span>'
    : '<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:600;">Greenfield Opportunity</span>';

  // ─── Recommended Products Table with Prices ───
  const productRows = products.map(p => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:13px;">${escapeHtml(p.product)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:13px;white-space:nowrap;">${escapeHtml(p.price)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${escapeHtml(p.rationale)}</td>
    </tr>
  `).join('');

  const totalPipeline = products.reduce((sum, p) => {
    const num = parseInt(String(p.price).replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // ─── Best Fit Events ───
  const eventCards = events.map(e => `
    <div style="margin-bottom:8px;padding:8px 12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:0 6px 6px 0;">
      <div style="font-weight:600;font-size:13px;">${escapeHtml(e.event_name)}</div>
      <div style="font-size:12px;color:#6b7280;">${escapeHtml(e.date)}${e.venue ? ` @ ${escapeHtml(e.venue)}` : ''} | ${escapeHtml(e.market || '')}</div>
      <div style="font-size:12px;color:#374151;margin-top:2px;">${escapeHtml(e.why)}</div>
    </div>
  `).join('');

  // ─── Who They Want to Meet ───
  const primaryTags = (targetAudience.primary || []).map(t =>
    `<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:12px;font-size:11px;margin:2px;">${escapeHtml(t)}</span>`
  ).join('');
  const secondaryTags = (targetAudience.secondary || []).map(t =>
    `<span style="display:inline-block;background:#f3e8ff;color:#7c3aed;padding:2px 8px;border-radius:12px;font-size:11px;margin:2px;">${escapeHtml(t)}</span>`
  ).join('');

  // ─── National Cross-Sell ───
  const nationalSection = research.national_opportunity ? `
    <div style="margin-bottom:16px;">
      <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">National / Cross-Sell Opportunity</h4>
      <div style="background:#fefce8;border-left:4px solid #eab308;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.5;">
        ${escapeHtml(research.national_opportunity)}
      </div>
    </div>
  ` : '';

  // ─── Marketing Contact ───
  const mktg = research.marketing_contact;
  const marketingSection = mktg?.name ? `
    <div style="margin-bottom:16px;">
      <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Suggested Marketing Contact</h4>
      <div style="padding:10px 14px;background:#fdf4ff;border-left:4px solid #a855f7;border-radius:0 8px 8px 0;">
        <div style="font-weight:600;font-size:14px;color:#7c3aed;">${escapeHtml(mktg.name)}</div>
        <div style="font-size:13px;color:#4b5563;">${escapeHtml(mktg.title || '')}</div>
        ${mktg.linkedin_url ? `<div style="margin-top:3px;"><a href="${escapeHtml(mktg.linkedin_url)}" style="color:#2563eb;text-decoration:none;font-size:12px;">LinkedIn</a></div>` : ''}
        ${mktg.rationale ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${escapeHtml(mktg.rationale)}</div>` : ''}
      </div>
    </div>
  ` : '';

  // ─── Proposal Link ───
  const proposalUrl = proposalBaseUrl ? buildProposalUrl(proposalBaseUrl, research) : '';
  const proposalSection = proposalUrl && score >= 40 ? `
    <div style="margin-top:16px;text-align:center;">
      <a href="${proposalUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#F37021,#e05a10);color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Generate Proposal (.pptx)
      </a>
    </div>
  ` : '';

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <span style="color:#6b7280;font-size:13px;">${formatTime(meeting.start_time)}</span>
              <span style="font-size:13px;color:#6b7280;"> — </span>
              <span style="font-size:13px;color:#6b7280;font-style:italic;">"${escapeHtml(meeting.title)}"</span>
              ${meeting.location ? `<span style="color:#6b7280;font-size:13px;"> @ ${escapeHtml(meeting.location)}</span>` : ''}
            </td>
            <td style="text-align:right;vertical-align:top;white-space:nowrap;">
              ${scoreBadge(score)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding:20px;">
        <!-- Company Overview -->
        <div style="margin-bottom:16px;">
          <h3 style="margin:0 0 6px;font-size:17px;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(company.name || 'Unknown Company')}</h3>
          <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">${escapeHtml(company.description || '')}</p>
          <table style="font-size:12px;color:#6b7280;border-collapse:collapse;">
            ${company.hq ? `<tr><td style="padding:1px 8px 1px 0;font-weight:600;">HQ:</td><td>${escapeHtml(company.hq)}</td></tr>` : ''}
            ${company.size_estimate ? `<tr><td style="padding:1px 8px 1px 0;font-weight:600;">Size:</td><td>${escapeHtml(company.size_estimate)}</td></tr>` : ''}
            ${company.revenue ? `<tr><td style="padding:1px 8px 1px 0;font-weight:600;">Revenue/AUM:</td><td>${escapeHtml(company.revenue)}</td></tr>` : ''}
            ${company.cre_relevance ? `<tr><td style="padding:1px 8px 1px 0;font-weight:600;">CRE Relevance:</td><td>${escapeHtml(company.cre_relevance)}</td></tr>` : ''}
            ${company.florida_presence ? `<tr><td style="padding:1px 8px 1px 0;font-weight:600;">Florida:</td><td>${escapeHtml(company.florida_presence)}</td></tr>` : ''}
          </table>
          <div style="margin-top:8px;">${sponsorBadge}</div>
        </div>

        <!-- Icebreaker -->
        ${research.icebreaker ? `
        <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;margin-bottom:16px;border-radius:0 8px 8px 0;">
          <strong style="font-size:11px;text-transform:uppercase;color:#3b82f6;letter-spacing:0.5px;">Icebreaker</strong>
          <p style="margin:4px 0 0;font-size:14px;color:#1e40af;line-height:1.5;">"${escapeHtml(research.icebreaker)}"</p>
        </div>
        ` : ''}

        <!-- Contacts with Bios -->
        ${contacts.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Contacts</h4>
          ${contactItems}
        </div>
        ` : ''}

        <!-- News & Event Mapping -->
        ${news.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">News &amp; Event Mapping</h4>
          ${newsItems}
        </div>
        ` : ''}

        <!-- Sponsorship & Advertising Intel -->
        ${sponsorshipSection || `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Sponsorship &amp; Advertising Intel</h4>
          <div style="padding:8px 12px;background:#dcfce7;border-radius:6px;font-size:13px;color:#166534;">
            No prior Bisnow sponsorship or CRE advertising found — <strong>Greenfield opportunity</strong>
          </div>
        </div>`}

        <!-- Who They Want to Meet -->
        ${(targetAudience.primary?.length > 0 || targetAudience.secondary?.length > 0) ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Who They Want to Meet</h4>
          ${primaryTags ? `<div style="margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#6b7280;">Primary:</span> ${primaryTags}</div>` : ''}
          ${secondaryTags ? `<div style="margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#6b7280;">Secondary:</span> ${secondaryTags}</div>` : ''}
          ${targetAudience.pitch_rationale ? `<p style="margin:6px 0 0;font-size:12px;color:#4b5563;line-height:1.4;">${escapeHtml(targetAudience.pitch_rationale)}</p>` : ''}
        </div>
        ` : ''}

        <!-- Best Fit Events -->
        ${events.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Best-Fit Bisnow Events</h4>
          ${eventCards}
        </div>
        ` : ''}

        <!-- Recommended Pitch / Products with Prices -->
        ${products.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Recommended Pitch</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <thead><tr style="background:#1e293b;color:#fff;">
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Product</th>
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Price</th>
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Rationale</th>
            </tr></thead>
            <tbody>${productRows}</tbody>
          </table>
          <div style="margin-top:10px;padding:10px 14px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:8px;color:#fff;">
            <span style="font-size:13px;">Total Pipeline:</span>
            <span style="font-size:20px;font-weight:700;margin-left:8px;">$${totalPipeline.toLocaleString()}</span>
          </div>
        </div>
        ` : ''}

        <!-- National Cross-Sell -->
        ${nationalSection}

        <!-- Marketing Contact -->
        ${marketingSection}

        <!-- Generate Proposal -->
        ${proposalSection}
      </div>
    </div>
  `;
}

export function generateDigestEmail({ date, meetings, upcomingEvents, nextEvent, proposalBaseUrl }) {
  const totalPipeline = meetings.reduce((sum, { research }) => {
    const products = research?.recommended_products || [];
    return sum + products.reduce((s, p) => {
      const num = parseInt(String(p.price).replace(/[^0-9]/g, ''), 10);
      return s + (isNaN(num) ? 0 : num);
    }, 0);
  }, 0);

  const topScore = Math.max(...meetings.map(m => m.research?.match_score || 0), 0);
  const externalCount = meetings.length;
  const greenCount = meetings.filter(m => (m.research?.match_score || 0) >= 70).length;

  const meetingCards = meetings
    .sort((a, b) => (b.research?.match_score || 0) - (a.research?.match_score || 0))
    .map(m => renderMeetingCard(m.meeting, m.research, proposalBaseUrl))
    .join('');

  const eventRows = (upcomingEvents || []).map(e => {
    const days = daysBetween(e.date);
    const urgencyColor = days <= 14 ? '#ef4444' : days <= 30 ? '#eab308' : '#6b7280';
    return `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:13px;">${e.date}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${escapeHtml(e.name)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${e.format}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${escapeHtml(e.venue)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:${urgencyColor};">${days}d</td>
      </tr>
    `;
  }).join('');

  const nextEventBanner = nextEvent ? (() => {
    const days = daysBetween(nextEvent.date);
    const urgency = days <= 14 ? 'background:#fef2f2;border-color:#ef4444;' : 'background:#fef3c7;border-color:#fbbf24;';
    return `
      <div style="${urgency}border:1px solid;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:14px;">
        <strong>NEXT UP:</strong> ${escapeHtml(nextEvent.name)} &mdash; ${nextEvent.date} @ ${escapeHtml(nextEvent.venue)}
        <strong style="color:${days <= 14 ? '#ef4444' : '#d97706'};">(${days} days away)</strong>
      </div>
    `;
  })() : '';

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const noMeetingsMessage = meetings.length === 0 ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <h3 style="margin:0 0 8px;color:#6b7280;">No External Meetings Today</h3>
      <p style="margin:0;color:#9ca3af;font-size:14px;">Use this time for prospecting. Check the upcoming events below for sponsorship opportunities to pitch.</p>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bisnow Daily Sales Digest</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:760px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#fff;border-radius:12px;padding:28px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;margin-bottom:4px;">
        <h1 style="margin:0;font-size:22px;letter-spacing:1px;">BISNOW DAILY SALES DIGEST</h1>
      </div>
      <p style="margin:0;color:#94a3b8;font-size:14px;">${formattedDate} | Jordan Hinsch | Head of Sales, Florida</p>
      <table style="margin-top:20px;border-collapse:collapse;">
        <tr>
          <td style="padding-right:32px;">
            <div style="font-size:32px;font-weight:700;color:#fff;">${externalCount}</div>
            <div style="color:#94a3b8;font-size:12px;">External Meetings</div>
          </td>
          <td style="padding-right:32px;">
            <div style="font-size:32px;font-weight:700;color:${scoreColor(topScore)};">${topScore}</div>
            <div style="color:#94a3b8;font-size:12px;">Top Score</div>
          </td>
          <td style="padding-right:32px;">
            <div style="font-size:32px;font-weight:700;color:#22c55e;">${greenCount}</div>
            <div style="color:#94a3b8;font-size:12px;">Green Matches</div>
          </td>
          <td>
            <div style="font-size:32px;font-weight:700;color:#f97316;">$${totalPipeline.toLocaleString()}</div>
            <div style="color:#94a3b8;font-size:12px;">Total Pipeline</div>
          </td>
        </tr>
      </table>
    </div>

    ${nextEventBanner}

    ${noMeetingsMessage}

    <!-- Meeting Cards -->
    ${meetingCards}

    <!-- Upcoming Florida Events -->
    ${upcomingEvents && upcomingEvents.length > 0 ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">Upcoming Florida Events</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;">
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Date</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Event</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Format</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Venue</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Days</th>
        </tr></thead>
        <tbody>${eventRows}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align:center;color:#9ca3af;font-size:12px;padding:16px 0;">
      Powered by Bisnow Sales Intelligence v${SCRIPT_VERSION_FOOTER} | Generated at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} ET
    </div>
  </div>
</body>
</html>`;
}

const SCRIPT_VERSION_FOOTER = '7';
