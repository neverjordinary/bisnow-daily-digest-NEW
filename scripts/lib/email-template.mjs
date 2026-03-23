// HTML email template for the daily sales digest

function scoreColor(score) {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 40) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function scoreBadge(score) {
  const color = scoreColor(score);
  return `<span style="display:inline-block;background:${color};color:#fff;padding:2px 10px;border-radius:12px;font-weight:bold;font-size:14px;">${score}/100</span>`;
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

function renderMeetingCard(meeting, research) {
  const score = research.match_score || 0;
  const company = research.company || {};
  const contacts = research.contacts || [];
  const news = research.recent_news || [];
  const products = research.recommended_products || [];
  const events = research.best_fit_events || [];
  const sponsorship = research.sponsorship_intel || {};

  const contactRows = contacts.map(c => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">
        ${c.linkedin_url ? `<a href="${c.linkedin_url}" style="color:#2563eb;text-decoration:none;">${c.name || 'Unknown'}</a>` : (c.name || 'Unknown')}
      </td>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${c.title || ''}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${c.company || ''}</td>
    </tr>
  `).join('');

  const newsRows = news.map(n => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">
        ${n.url ? `<a href="${n.url}" style="color:#2563eb;text-decoration:none;">${n.headline}</a>` : n.headline}
      </td>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${n.mapped_bisnow_event || '—'}</td>
    </tr>
  `).join('');

  const productRows = products.map(p => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;">${p.product}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${p.price}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${p.rationale}</td>
    </tr>
  `).join('');

  const totalPipeline = products.reduce((sum, p) => {
    const num = parseInt(String(p.price).replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const sponsorBadge = sponsorship.past_bisnow_sponsor
    ? '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:8px;font-size:11px;">Past Bisnow Sponsor</span>'
    : '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:8px;font-size:11px;">Greenfield Opportunity</span>';

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;overflow:hidden;">
      <!-- Header -->
      <div style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="color:#6b7280;font-size:13px;">${formatTime(meeting.start_time)}</span>
            <span style="font-size:18px;font-weight:700;margin-left:8px;">${meeting.title}</span>
            ${meeting.location ? `<span style="color:#6b7280;font-size:13px;margin-left:8px;">@ ${meeting.location}</span>` : ''}
          </div>
          <div>${scoreBadge(score)}</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:20px;">
        <!-- Company Overview -->
        <div style="margin-bottom:16px;">
          <h3 style="margin:0 0 4px;font-size:16px;color:#111827;">${company.name || 'Unknown Company'}</h3>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.5;">${company.description || ''}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">
            HQ: ${company.hq || 'Unknown'} | Size: ${company.size_estimate || 'Unknown'} | CRE Relevance: ${company.cre_relevance || 'Unknown'}
          </p>
          <div style="margin-top:6px;">${sponsorBadge}</div>
        </div>

        <!-- Icebreaker -->
        ${research.icebreaker ? `
        <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;margin-bottom:16px;border-radius:0 8px 8px 0;">
          <strong style="font-size:12px;text-transform:uppercase;color:#3b82f6;">Icebreaker</strong>
          <p style="margin:4px 0 0;font-size:14px;color:#1e40af;">"${research.icebreaker}"</p>
        </div>
        ` : ''}

        <!-- Contacts -->
        ${contacts.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Contacts</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Name</th>
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Title</th>
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Company</th>
            </tr></thead>
            <tbody>${contactRows}</tbody>
          </table>
        </div>
        ` : ''}

        <!-- Recent News -->
        ${news.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Recent News &rarr; Event Mapping</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Headline</th>
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Mapped Event</th>
            </tr></thead>
            <tbody>${newsRows}</tbody>
          </table>
        </div>
        ` : ''}

        <!-- Recommended Products -->
        ${products.length > 0 ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Recommended Products</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Product</th>
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Price</th>
              <th style="padding:4px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Rationale</th>
            </tr></thead>
            <tbody>${productRows}</tbody>
          </table>
          <p style="margin:8px 0 0;font-size:13px;font-weight:700;color:#111827;">Pipeline: $${totalPipeline.toLocaleString()}</p>
        </div>
        ` : ''}

        <!-- Best Fit Events -->
        ${events.length > 0 ? `
        <div style="margin-bottom:8px;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#374151;">Best-Fit Bisnow Events</h4>
          ${events.map(e => `
            <div style="font-size:13px;margin-bottom:4px;">
              <strong>${e.event_name}</strong> (${e.date}) — ${e.why}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- National Opportunity -->
        ${research.national_opportunity ? `
        <div style="background:#fefce8;border-left:4px solid #eab308;padding:8px 12px;border-radius:0 8px 8px 0;font-size:13px;">
          <strong>National Cross-Sell:</strong> ${research.national_opportunity}
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function generateDigestEmail({ date, meetings, upcomingEvents, nextEvent }) {
  const totalPipeline = meetings.reduce((sum, { research }) => {
    const products = research?.recommended_products || [];
    return sum + products.reduce((s, p) => {
      const num = parseInt(String(p.price).replace(/[^0-9]/g, ''), 10);
      return s + (isNaN(num) ? 0 : num);
    }, 0);
  }, 0);

  const topScore = Math.max(...meetings.map(m => m.research?.match_score || 0), 0);
  const externalCount = meetings.length;

  const meetingCards = meetings
    .sort((a, b) => (b.research?.match_score || 0) - (a.research?.match_score || 0))
    .map(m => renderMeetingCard(m.meeting, m.research))
    .join('');

  const eventRows = (upcomingEvents || []).map(e => {
    const days = daysBetween(e.date);
    return `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;">${e.date}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${e.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${e.format}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:${days <= 14 ? '#ef4444' : '#6b7280'};">${days}d</td>
      </tr>
    `;
  }).join('');

  const nextEventBanner = nextEvent ? `
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:14px;">
      <strong>NEXT UP:</strong> ${nextEvent.name} &mdash; ${nextEvent.date} @ ${nextEvent.venue}
      <strong style="color:#d97706;">(${daysBetween(nextEvent.date)} days away)</strong>
    </div>
  ` : '';

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bisnow Daily Sales Digest</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:720px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b,#334155);color:#fff;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h1 style="margin:0 0 4px;font-size:24px;">BISNOW DAILY SALES DIGEST</h1>
      <p style="margin:0;color:#94a3b8;font-size:14px;">${formattedDate} | Jordan Hinsch | Head of Sales, Florida</p>
      <div style="margin-top:16px;display:flex;gap:24px;">
        <div>
          <span style="font-size:28px;font-weight:700;">${externalCount}</span>
          <span style="color:#94a3b8;font-size:13px;margin-left:4px;">External Meetings</span>
        </div>
        <div>
          <span style="font-size:28px;font-weight:700;">${topScore}</span>
          <span style="color:#94a3b8;font-size:13px;margin-left:4px;">Top Score</span>
        </div>
        <div>
          <span style="font-size:28px;font-weight:700;">$${totalPipeline.toLocaleString()}</span>
          <span style="color:#94a3b8;font-size:13px;margin-left:4px;">Pipeline</span>
        </div>
      </div>
    </div>

    ${nextEventBanner}

    <!-- Meeting Cards -->
    ${meetingCards}

    <!-- Upcoming Events -->
    ${upcomingEvents && upcomingEvents.length > 0 ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">Upcoming Florida Events</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f9fafb;">
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Date</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Event</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Format</th>
          <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e5e7eb;">Days</th>
        </tr></thead>
        <tbody>${eventRows}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align:center;color:#9ca3af;font-size:12px;padding:16px 0;">
      Powered by Bisnow Sales Intelligence | Generated at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })} ET
    </div>
  </div>
</body>
</html>`;
}
