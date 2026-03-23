import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchCalendarEvents,
  researchMeeting,
  classifyContacts,
  getUpcomingFloridaEvents,
  getNextFloridaEvent,
  daysBetween,
  setApiKey,
  hasApiKey,
} from './utils/api';
import { generateProposal } from './utils/proposal';

// ─── Helpers ───────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' });
  } catch {
    return timeStr;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function scoreColor(score) {
  if (score >= 70) return 'score-green';
  if (score >= 40) return 'score-yellow';
  return 'score-red';
}

function parsePriceNum(priceStr) {
  if (!priceStr) return 0;
  return parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10) || 0;
}

function formatCurrency(num) {
  return '$' + num.toLocaleString();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── API Key Setup ─────────────────────────────────────

function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1><span>Bisnow</span> Daily Sales Digest</h1>
        <p>Enter your Anthropic API key to get started. Your key is stored locally in the browser and never sent to any server other than the Anthropic API.</p>
        <input
          type="password"
          className="setup-input"
          placeholder="sk-ant-..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && key.trim() && onSave(key.trim())}
        />
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => key.trim() && onSave(key.trim())}>
          Start Digest
        </button>
      </div>
    </div>
  );
}

// ─── Meeting Card ──────────────────────────────────────

function MeetingCard({ meeting, research, onGenerateProposal }) {
  const [expanded, setExpanded] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const score = research?.match_score || 0;
  const company = research?.company;
  const contacts = research?.contacts || [];
  const news = research?.recent_news || [];
  const intel = research?.sponsorship_intel;
  const recs = research?.recommended_products || [];
  const audience = research?.target_audience;
  const icebreaker = research?.icebreaker;
  const bestEvents = research?.best_fit_events || [];
  const nationalOpp = research?.national_opportunity;

  const totalPipeline = recs.reduce((sum, r) => sum + parsePriceNum(r.price), 0);

  const handleProposal = async () => {
    setProposalLoading(true);
    try {
      await generateProposal(research, meeting.title);
    } catch (err) {
      console.error('Proposal generation failed:', err);
      alert('Failed to generate proposal: ' + err.message);
    }
    setProposalLoading(false);
  };

  const buildPitchNotes = () => {
    let text = `MEETING: ${meeting.title}\nTIME: ${formatTime(meeting.start_time)}\n`;
    if (company) text += `COMPANY: ${company.name}\n${company.description}\n`;
    if (icebreaker) text += `\nICEBREAKER: ${icebreaker}\n`;
    contacts.forEach(c => {
      text += `\nCONTACT: ${c.name} — ${c.title}\n`;
      if (c.linkedin_url) text += `LinkedIn: ${c.linkedin_url}\n`;
    });
    if (news.length) {
      text += '\nNEWS:\n';
      news.forEach(n => {
        text += `• ${n.headline}${n.mapped_bisnow_event ? ` → ${n.mapped_bisnow_event}` : ''}\n`;
      });
    }
    if (recs.length) {
      text += '\nRECOMMENDED PITCH:\n';
      recs.forEach(r => {
        text += `• ${r.product} — ${r.price}\n`;
      });
      text += `Total: ${formatCurrency(totalPipeline)}\n`;
    }
    return text;
  };

  const handleCopyNotes = () => {
    copyToClipboard(buildPitchNotes());
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const hasIntel = intel && (
    (intel.past_cre_sponsorships?.length > 0) ||
    (intel.current_sponsorships?.length > 0) ||
    (intel.advertising_evidence?.length > 0) ||
    intel.past_bisnow_sponsor
  );

  return (
    <div className="meeting-card">
      <div className="meeting-header" onClick={() => setExpanded(!expanded)}>
        <div className="meeting-time">{formatTime(meeting.start_time)}</div>
        <div className="meeting-info">
          <div className="meeting-title">{meeting.title}</div>
          {company && <div className="company-name">{company.name}</div>}
          {company && <div className="company-desc">{company.description?.slice(0, 200)}{company.description?.length > 200 ? '...' : ''}</div>}
        </div>
        <div className={`score-badge ${scoreColor(score)}`}>{score}</div>
        <div className={`expand-icon ${expanded ? 'open' : ''}`}>&#9660;</div>
      </div>

      {expanded && (
        <div className="meeting-body">
          {/* Icebreaker */}
          {icebreaker && (
            <div className="icebreaker">
              <div className="icebreaker-label">Icebreaker</div>
              <div className="icebreaker-text">"{icebreaker}"</div>
            </div>
          )}

          {/* Contacts */}
          {contacts.length > 0 && (
            <div className="contacts-section">
              <div className="section-label">Contacts</div>
              {contacts.map((c, i) => (
                <div key={i} className="contact-card">
                  <div className="contact-avatar">{getInitials(c.name)}</div>
                  <div className="contact-details">
                    <div className="contact-name">{c.name}</div>
                    <div className="contact-title">{c.title} — {c.company}</div>
                  </div>
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="contact-linkedin">
                      LinkedIn &#8599;
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* News & Event Mapping */}
          {news.length > 0 && (
            <div className="news-section">
              <div className="section-label">News & Event Mapping</div>
              {news.map((n, i) => (
                <div key={i} className="news-item">
                  <div className="news-headline">{n.headline}</div>
                  {n.summary && <div className="news-summary">{n.summary}</div>}
                  {n.mapped_bisnow_event && (
                    <div className="news-event-map">
                      &#127919; {n.mapped_bisnow_event}{n.mapped_event_date ? ` (${n.mapped_event_date})` : ''}
                    </div>
                  )}
                  {n.url && <div style={{ marginTop: 4 }}><a href={n.url} target="_blank" rel="noopener noreferrer" className="news-link">{n.url}</a></div>}
                </div>
              ))}
            </div>
          )}

          {/* Sponsorship/Ad Intel */}
          <div className="intel-section">
            <div className="section-label">Sponsorship & Advertising Intel</div>
            {hasIntel ? (
              <>
                {intel.past_bisnow_sponsor && (
                  <div className="intel-item">Previously sponsored Bisnow events</div>
                )}
                {(intel.past_cre_sponsorships || []).map((s, i) => (
                  <div key={`past-${i}`} className="intel-item">
                    {s.event}
                    {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="intel-link">{s.url}</a>}
                  </div>
                ))}
                {(intel.current_sponsorships || []).map((s, i) => (
                  <div key={`cur-${i}`} className="intel-item">
                    {s.event}
                    {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="intel-link">{s.url}</a>}
                  </div>
                ))}
                {(intel.advertising_evidence || []).map((a, i) => (
                  <div key={`ad-${i}`} className="intel-item">{a}</div>
                ))}
              </>
            ) : (
              <div className="greenfield">No sponsorship intel found — greenfield opportunity</div>
            )}
          </div>

          {/* Best Fit Events */}
          {bestEvents.length > 0 && (
            <div className="recs-section">
              <div className="section-label">Recommended Events to Sponsor</div>
              {bestEvents.map((evt, i) => (
                <div key={i} className="rec-item">
                  <div>
                    <div className="rec-product">{i + 1}. {evt.event_name}</div>
                    <div className="rec-rationale">{evt.date} | {evt.venue} | {evt.market} — {evt.why}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Target Audience */}
          {audience && (audience.primary?.length > 0 || audience.secondary?.length > 0) && (
            <div className="audience-section">
              <div className="audience-label">Who They Want to Meet</div>
              <div className="audience-list">
                {(audience.primary || []).map((a, i) => (
                  <span key={i} className="audience-tag">{a}</span>
                ))}
                {(audience.secondary || []).map((a, i) => (
                  <span key={i} className="audience-tag secondary">{a}</span>
                ))}
              </div>
              {audience.pitch_rationale && (
                <div className="audience-rationale">{audience.pitch_rationale}</div>
              )}
            </div>
          )}

          {/* Recommended Pitch */}
          {recs.length > 0 && (
            <div className="recs-section">
              <div className="section-label">Recommended Pitch</div>
              {recs.map((r, i) => (
                <div key={i} className="rec-item">
                  <div>
                    <div className="rec-product">{r.product}</div>
                    {r.rationale && <div className="rec-rationale">{r.rationale}</div>}
                  </div>
                  <div className="rec-price">{r.price}</div>
                </div>
              ))}
              <div className="rec-total">
                <div className="rec-total-label">Total Pipeline</div>
                <div className="rec-total-value">{formatCurrency(totalPipeline)}</div>
              </div>
            </div>
          )}

          {/* National Cross-Sell */}
          {nationalOpp && (
            <div className="national-flag">
              <div className="national-flag-label">National / Cross-Sell Opportunity</div>
              {nationalOpp}
            </div>
          )}

          {/* Actions */}
          <div className="card-actions">
            <button className="btn btn-sm" onClick={handleCopyNotes}>
              &#128203; Copy Pitch Notes
            </button>
            {score >= 40 && (
              <button
                className="btn-proposal"
                onClick={handleProposal}
                disabled={proposalLoading}
              >
                {proposalLoading ? 'Building proposal...' : '📄 Generate Proposal'}
              </button>
            )}
          </div>
        </div>
      )}
      {copyToast && <div className="copy-toast">Pitch notes copied!</div>}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────

export default function App() {
  const [apiKeyReady, setApiKeyReady] = useState(hasApiKey());
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [researchData, setResearchData] = useState({});
  const [sortBy, setSortBy] = useState('time');
  const [copyAllToast, setCopyAllToast] = useState(false);
  const fetchedRef = useRef(false);

  const handleApiKeySave = (key) => {
    setApiKey(key);
    setApiKeyReady(true);
  };

  const loadDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMeetings([]);
    setResearchData({});

    try {
      // Step 1: Fetch calendar
      setLoadingStatus('Fetching calendar...');
      setLoadingStep('Pulling today\'s events from Google Calendar');
      const events = await fetchCalendarEvents(setLoadingStatus);

      if (!events.length) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      // Filter to meetings with external attendees
      const externalMeetings = events.map(evt => {
        const { internal, external } = classifyContacts(evt.attendees);
        return { ...evt, internal, external };
      }).filter(evt => evt.external.length > 0);

      setMeetings(externalMeetings);

      if (!externalMeetings.length) {
        setLoading(false);
        return;
      }

      // Step 2: Research each meeting (with small delays to avoid rate limits)
      setLoadingStatus('Researching contacts...');
      const researchResults = {};

      for (let i = 0; i < externalMeetings.length; i++) {
        const mtg = externalMeetings[i];
        const domain = mtg.external[0]?.email?.split('@')[1] || 'company';
        setLoadingStep(`Researching ${domain} (${i + 1}/${externalMeetings.length})`);

        try {
          const result = await researchMeeting(mtg, mtg.external, setLoadingStatus);
          researchResults[i] = result;
          setResearchData(prev => ({ ...prev, [i]: result }));
        } catch (err) {
          console.error(`Research failed for meeting ${i}:`, err);
          researchResults[i] = null;
        }

        // Small delay between API calls
        if (i < externalMeetings.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      setLoadingStatus('');
    } catch (err) {
      console.error('Digest load error:', err);
      setError(err.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (apiKeyReady && !fetchedRef.current) {
      fetchedRef.current = true;
      loadDigest();
    }
  }, [apiKeyReady, loadDigest]);

  // Sorted meetings
  const sortedMeetings = [...meetings].sort((a, b) => {
    if (sortBy === 'score') {
      const sa = researchData[meetings.indexOf(a)]?.match_score || 0;
      const sb = researchData[meetings.indexOf(b)]?.match_score || 0;
      return sb - sa;
    }
    return (a.start_time || '').localeCompare(b.start_time || '');
  });

  // Computed values
  const topScore = Math.max(0, ...Object.values(researchData).map(r => r?.match_score || 0));
  const totalPipeline = Object.values(researchData).reduce((sum, r) => {
    if (!r?.recommended_products) return sum;
    return sum + r.recommended_products.reduce((s, p) => s + parsePriceNum(p.price), 0);
  }, 0);

  const nextEvent = getNextFloridaEvent();
  const upcomingEvents = getUpcomingFloridaEvents(5);
  const nextEventDays = nextEvent ? daysBetween(nextEvent.date) : null;

  const handleCopyAll = () => {
    let text = `BISNOW DAILY SALES DIGEST\n${formatFullDate()} | Jordan Hinsch\n\n`;
    sortedMeetings.forEach((mtg, idx) => {
      const origIdx = meetings.indexOf(mtg);
      const research = researchData[origIdx];
      text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `${formatTime(mtg.start_time)} — ${mtg.title}\n`;
      if (research?.company) text += `Company: ${research.company.name} (Score: ${research.match_score}/100)\n`;
      if (research?.icebreaker) text += `Icebreaker: ${research.icebreaker}\n`;
      (research?.contacts || []).forEach(c => {
        text += `Contact: ${c.name} — ${c.title}\n`;
      });
      (research?.recommended_products || []).forEach(r => {
        text += `Pitch: ${r.product} — ${r.price}\n`;
      });
      text += '\n';
    });
    text += `Total Pipeline: ${formatCurrency(totalPipeline)}\n`;
    copyToClipboard(text);
    setCopyAllToast(true);
    setTimeout(() => setCopyAllToast(false), 2000);
  };

  if (!apiKeyReady) {
    return <ApiKeySetup onSave={handleApiKeySave} />;
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <h1><span>Bisnow</span> Daily Sales Digest</h1>
            <div className="header-actions">
              <button className="btn" onClick={handleCopyAll} disabled={loading || !meetings.length}>
                &#128203; Copy All Notes
              </button>
              <button className="btn btn-primary" onClick={() => { fetchedRef.current = false; loadDigest(); }} disabled={loading}>
                &#8635; Refresh
              </button>
            </div>
          </div>
          <div className="header-date">{formatFullDate()} &middot; Jordan Hinsch &middot; Head of Sales, Florida</div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            &#9888; {error}
            <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { fetchedRef.current = false; loadDigest(); }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-status">{loadingStatus}</div>
            <div className="loading-step">{loadingStep}</div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Summary Bar */}
            {meetings.length > 0 && (
              <div className="summary-bar">
                <div className="summary-card">
                  <div className="summary-label">External Meetings</div>
                  <div className="summary-value">{meetings.length}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Top Match Score</div>
                  <div className="summary-value">{topScore}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Pipeline Value</div>
                  <div className="summary-value summary-value-sm">{formatCurrency(totalPipeline)}</div>
                </div>
              </div>
            )}

            {/* Next Up */}
            {nextEvent && (
              <div className="next-up">
                <div>
                  <div className="next-up-label">Next Up</div>
                  <div className="next-up-event">{nextEvent.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatDate(nextEvent.date)} @ {nextEvent.venue}
                  </div>
                </div>
                <div className="next-up-days">
                  {nextEventDays === 0 ? 'Today!' : nextEventDays === 1 ? 'Tomorrow' : `${nextEventDays} days away`}
                </div>
              </div>
            )}

            {/* Sort/Filter */}
            {meetings.length > 0 && (
              <div className="controls">
                <select className="control-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="time">Sort by Time</option>
                  <option value="score">Sort by Score</option>
                </select>
              </div>
            )}

            {/* Meeting Cards */}
            {sortedMeetings.map((mtg, idx) => {
              const origIdx = meetings.indexOf(mtg);
              return (
                <MeetingCard
                  key={origIdx}
                  meeting={mtg}
                  research={researchData[origIdx]}
                />
              );
            })}

            {/* Empty State */}
            {!loading && meetings.length === 0 && !error && (
              <div className="empty-state">
                <h2>No External Meetings Today</h2>
                <p>Good day to prospect! Check upcoming events that need sponsors.</p>
                {upcomingEvents.length > 0 && (
                  <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 500, margin: '24px auto' }}>
                    <div className="section-label">Upcoming Events Needing Sponsors</div>
                    {upcomingEvents.map((evt, i) => (
                      <div key={i} className="sidebar-event">
                        <div className="sidebar-event-date">{formatDate(evt.date)}</div>
                        <div className="sidebar-event-name">{evt.name}</div>
                        <div className="sidebar-event-meta">{evt.format} | {evt.panels} panels | {evt.venue}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {meetings.length > 0 && (
              <div className="footer">
                <div className="footer-pipeline">
                  <div className="footer-pipeline-label">Total Pipeline Value</div>
                  <div className="footer-pipeline-value">{formatCurrency(totalPipeline)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  All times Eastern (ET) &middot; Bisnow Daily Sales Digest
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">Upcoming Florida Events</div>
        {upcomingEvents.map((evt, i) => {
          const days = daysBetween(evt.date);
          const isLimited = days < 21 && days > 0;
          return (
            <div key={i} className="sidebar-event">
              <div className="sidebar-event-date">
                {formatDate(evt.date)}
                {isLimited && <span style={{ color: 'var(--red)', marginLeft: 8, fontSize: 10, fontWeight: 600 }}>LIMITED AVAIL</span>}
                {evt.format === 'Full Day' && <span style={{ color: 'var(--orange)', marginLeft: 8, fontSize: 10, fontWeight: 600 }}>FULL DAY</span>}
              </div>
              <div className="sidebar-event-name">{evt.name}</div>
              <div className="sidebar-event-meta">
                {evt.format} | {evt.panels} panels | {evt.venue}
              </div>
              <div className="sidebar-event-days">
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days away`}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 32 }}>
          <div className="sidebar-title">Bisnow at a Glance</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div>436 events annually</div>
            <div>50+ markets worldwide</div>
            <div>1.7M newsletter subscribers</div>
            <div>11M annual readers</div>
            <div>79 email newsletters</div>
            <div>100K+ event attendees</div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div className="sidebar-title">Quick Actions</div>
          <button
            className="btn"
            style={{ width: '100%', marginBottom: 8 }}
            onClick={() => { setApiKey(''); setApiKeyReady(false); }}
          >
            Change API Key
          </button>
        </div>
      </div>

      {copyAllToast && <div className="copy-toast">All notes copied!</div>}
    </div>
  );
}
