// Server-side proposal generation using PptxGenJS
// Generates .pptx as a Buffer for email attachment
import PptxGenJS from 'pptxgenjs';

const COLORS = {
  orange: 'F37021',
  charcoal: '1A1A2E',
  darkNavy: '0F1923',
  white: 'FFFFFF',
  darkText: '333333',
  lightGray: 'F5F5F5',
  medGray: 'E0E0E0',
  green: '22C55E',
};

function addSlideNumber(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 8.5, y: 5.2, w: 1.2, h: 0.3,
    fontSize: 9, color: '888888', align: 'right',
  });
}

/**
 * Generate a proposal .pptx for a researched meeting.
 * @param {object} research - The research JSON from Claude
 * @param {string} meetingTitle - The calendar meeting title
 * @returns {{ buffer: Buffer, fileName: string }} - The pptx as a Node buffer + filename
 */
export async function generateProposal(research, meetingTitle) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Bisnow';
  pptx.company = 'Bisnow';
  pptx.subject = `Proposal for ${research.company?.name || 'Prospect'}`;

  const companyName = research.company?.name || 'Prospect';
  const totalSlides = 9;

  // --- Slide 1: Cover ---
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLORS.charcoal };
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange },
  });
  slide1.addText('BISNOW', {
    x: 0.5, y: 0.4, w: 3, h: 0.6,
    fontSize: 28, bold: true, color: COLORS.orange, fontFace: 'Arial Black',
  });
  slide1.addText(companyName, {
    x: 1, y: 1.8, w: 8, h: 1,
    fontSize: 36, bold: true, color: COLORS.white, fontFace: 'Arial Black', align: 'center',
  });
  slide1.addText('Sponsorship & Marketing Proposal', {
    x: 1, y: 2.8, w: 8, h: 0.6,
    fontSize: 20, color: COLORS.orange, fontFace: 'Arial', align: 'center',
  });
  slide1.addText(`Prepared for ${companyName}`, {
    x: 1, y: 3.5, w: 8, h: 0.5,
    fontSize: 14, color: 'AAAAAA', fontFace: 'Arial', align: 'center',
  });
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  slide1.addText(`${today}\nJordan Hinsch | Head of Sales, Florida\njordan.hinsch@bisnow.com`, {
    x: 1, y: 4.4, w: 8, h: 0.9,
    fontSize: 11, color: '888888', fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.3,
  });
  addSlideNumber(slide1, 1, totalSlides);

  // --- Slide 2: About Bisnow ---
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLORS.lightGray };
  slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide2.addText('About Bisnow', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  slide2.addText('The #1 Platform Serving Commercial Real Estate', {
    x: 0.5, y: 1.0, w: 9, h: 0.4,
    fontSize: 16, color: COLORS.orange, fontFace: 'Arial', italic: true,
  });
  const bisnowStats = [
    ['436', 'Events Annually'], ['50+', 'Markets'], ['1.7M', 'Newsletter Subscribers'],
    ['11M', 'Annual Website Readers'], ['100K+', 'Event Attendees'], ['79', 'Email Newsletters'],
  ];
  bisnowStats.forEach((stat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.7 + row * 1.5;
    slide2.addShape(pptx.ShapeType.rect, {
      x, y, w: 2.8, h: 1.2, fill: { color: COLORS.white },
      shadow: { type: 'outer', blur: 4, offset: 2, color: '00000020' }, rectRadius: 0.1,
    });
    slide2.addText(stat[0], {
      x, y: y + 0.1, w: 2.8, h: 0.6,
      fontSize: 28, bold: true, color: COLORS.orange, fontFace: 'Arial Black', align: 'center',
    });
    slide2.addText(stat[1], {
      x, y: y + 0.65, w: 2.8, h: 0.4,
      fontSize: 12, color: COLORS.darkText, fontFace: 'Arial', align: 'center',
    });
  });
  addSlideNumber(slide2, 2, totalSlides);

  // --- Slide 3: Who Attends ---
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLORS.white };
  slide3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide3.addText('Who Attends Bisnow Events', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const attendeeStats = [
    { pct: '42%', label: 'VP or Above' },
    { pct: '15%', label: 'C-Suite' },
    { pct: '27%', label: 'Owners / Operators / Developers / PE / Lenders' },
  ];
  attendeeStats.forEach((s, i) => {
    const x = 0.5 + i * 3.1;
    slide3.addShape(pptx.ShapeType.rect, {
      x, y: 1.3, w: 2.8, h: 1.4, fill: { color: COLORS.charcoal }, rectRadius: 0.1,
    });
    slide3.addText(s.pct, {
      x, y: 1.4, w: 2.8, h: 0.7,
      fontSize: 36, bold: true, color: COLORS.orange, fontFace: 'Arial Black', align: 'center',
    });
    slide3.addText(s.label, {
      x: x + 0.2, y: 2.0, w: 2.4, h: 0.6,
      fontSize: 11, color: COLORS.white, fontFace: 'Arial', align: 'center', wrap: true,
    });
  });
  if (research.target_audience?.pitch_rationale) {
    slide3.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 3.1, w: 9, h: 1.2, fill: { color: 'FFF3E8' }, rectRadius: 0.1,
      line: { color: COLORS.orange, width: 1 },
    });
    slide3.addText(`Audience Match for ${companyName}`, {
      x: 0.7, y: 3.2, w: 8.5, h: 0.35,
      fontSize: 13, bold: true, color: COLORS.orange, fontFace: 'Arial',
    });
    slide3.addText(research.target_audience.pitch_rationale, {
      x: 0.7, y: 3.55, w: 8.5, h: 0.65,
      fontSize: 11, color: COLORS.darkText, fontFace: 'Arial', wrap: true,
    });
  }
  addSlideNumber(slide3, 3, totalSlides);

  // --- Slide 4: Recommended Events ---
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLORS.lightGray };
  slide4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide4.addText('Recommended Events', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const events = (research.best_fit_events || []).slice(0, 3);
  events.forEach((evt, i) => {
    const y = 1.3 + i * 1.3;
    slide4.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 9, h: 1.1, fill: { color: COLORS.white }, rectRadius: 0.1,
      shadow: { type: 'outer', blur: 3, offset: 1, color: '00000015' },
    });
    slide4.addText(evt.event_name, {
      x: 0.7, y: y + 0.05, w: 5.5, h: 0.4,
      fontSize: 16, bold: true, color: COLORS.charcoal, fontFace: 'Arial',
    });
    slide4.addText(`${evt.date} | ${evt.venue || ''} | ${evt.market || ''}`, {
      x: 0.7, y: y + 0.4, w: 5.5, h: 0.3,
      fontSize: 11, color: '888888', fontFace: 'Arial',
    });
    slide4.addText(evt.why || '', {
      x: 0.7, y: y + 0.7, w: 8.5, h: 0.3,
      fontSize: 10, color: COLORS.darkText, fontFace: 'Arial', italic: true,
    });
    slide4.addShape(pptx.ShapeType.rect, {
      x: 7.8, y: y + 0.15, w: 1.5, h: 0.5, fill: { color: COLORS.orange }, rectRadius: 0.25,
    });
    slide4.addText(evt.market || 'FL', {
      x: 7.8, y: y + 0.15, w: 1.5, h: 0.5,
      fontSize: 10, bold: true, color: COLORS.white, fontFace: 'Arial', align: 'center',
    });
  });
  addSlideNumber(slide4, 4, totalSlides);

  // --- Slide 5: Sponsorship Packages ---
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLORS.white };
  slide5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide5.addText('Sponsorship Packages', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const eventProducts = (research.recommended_products || []).filter(p =>
    !p.product?.toLowerCase().includes('brief') &&
    !p.product?.toLowerCase().includes('email') &&
    !p.product?.toLowerCase().includes('article') &&
    !p.product?.toLowerCase().includes('banner') &&
    !p.product?.toLowerCase().includes('website')
  );
  const tableRows = [
    [
      { text: 'Package', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
      { text: 'Price', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
      { text: 'Rationale', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
    ],
    ...eventProducts.map((p, i) => [
      { text: p.product || '', options: { fontSize: 11, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
      { text: p.price || '', options: { fontSize: 11, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
      { text: p.rationale || '', options: { fontSize: 10, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
    ]),
  ];
  if (tableRows.length > 1) {
    slide5.addTable(tableRows, {
      x: 0.5, y: 1.2, w: 9,
      border: { type: 'solid', pt: 0.5, color: COLORS.medGray },
      colW: [3, 1.5, 4.5], rowH: 0.5,
    });
  }
  addSlideNumber(slide5, 5, totalSlides);

  // --- Slide 6: Digital Marketing ---
  const slide6 = pptx.addSlide();
  slide6.background = { color: COLORS.lightGray };
  slide6.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide6.addText('Digital Marketing Add-Ons', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const digitalProducts = (research.recommended_products || []).filter(p =>
    p.product?.toLowerCase().includes('brief') ||
    p.product?.toLowerCase().includes('email') ||
    p.product?.toLowerCase().includes('article') ||
    p.product?.toLowerCase().includes('banner') ||
    p.product?.toLowerCase().includes('website')
  );
  const digitalRows = [
    [
      { text: 'Product', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
      { text: 'Price', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
      { text: 'Rationale', options: { bold: true, color: COLORS.white, fill: { color: COLORS.orange }, fontSize: 12 } },
    ],
    ...digitalProducts.map((p, i) => [
      { text: p.product || '', options: { fontSize: 11, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
      { text: p.price || '', options: { fontSize: 11, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
      { text: p.rationale || '', options: { fontSize: 10, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
    ]),
  ];
  if (digitalRows.length > 1) {
    slide6.addTable(digitalRows, {
      x: 0.5, y: 1.2, w: 9,
      border: { type: 'solid', pt: 0.5, color: COLORS.medGray },
      colW: [3, 1.5, 4.5], rowH: 0.5,
    });
  }
  slide6.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.8, w: 9, h: 0.8, fill: { color: COLORS.white }, rectRadius: 0.08,
  });
  slide6.addText('South Florida Morning Brief: 39,000 subscribers  |  Dedicated Email: 33,426 audience  |  24.8% open rate  |  499 avg clicks', {
    x: 0.7, y: 3.9, w: 8.6, h: 0.6,
    fontSize: 11, color: COLORS.darkText, fontFace: 'Arial', align: 'center',
  });
  addSlideNumber(slide6, 6, totalSlides);

  // --- Slide 7: Investment Summary ---
  const slide7 = pptx.addSlide();
  slide7.background = { color: COLORS.white };
  slide7.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide7.addText('Investment Summary', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const allProducts = research.recommended_products || [];
  let totalValue = 0;
  const summaryRows = [
    [
      { text: 'Product', options: { bold: true, color: COLORS.white, fill: { color: COLORS.charcoal }, fontSize: 12 } },
      { text: 'Investment', options: { bold: true, color: COLORS.white, fill: { color: COLORS.charcoal }, fontSize: 12 } },
    ],
  ];
  allProducts.forEach((p, i) => {
    const priceNum = parseInt((p.price || '0').replace(/[^0-9]/g, ''), 10);
    totalValue += priceNum;
    summaryRows.push([
      { text: p.product || '', options: { fontSize: 12, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white } } },
      { text: p.price || '', options: { fontSize: 12, fill: { color: i % 2 === 0 ? COLORS.lightGray : COLORS.white }, align: 'right' } },
    ]);
  });
  summaryRows.push([
    { text: 'Total Investment', options: { bold: true, fontSize: 14, fill: { color: COLORS.orange }, color: COLORS.white } },
    { text: `$${totalValue.toLocaleString()}`, options: { bold: true, fontSize: 14, fill: { color: COLORS.orange }, color: COLORS.white, align: 'right' } },
  ]);
  slide7.addTable(summaryRows, {
    x: 1.5, y: 1.3, w: 7,
    border: { type: 'solid', pt: 0.5, color: COLORS.medGray },
    colW: [4.5, 2.5], rowH: 0.5,
  });
  if (totalValue > 15000) {
    slide7.addText('Package discount available — ask Jordan for details', {
      x: 1.5, y: 4.2, w: 7, h: 0.4,
      fontSize: 12, italic: true, color: COLORS.orange, fontFace: 'Arial', align: 'center',
    });
  }
  addSlideNumber(slide7, 7, totalSlides);

  // --- Slide 8: Why Bisnow ---
  const slide8 = pptx.addSlide();
  slide8.background = { color: COLORS.charcoal };
  slide8.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide8.addText('Why Bisnow', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.white, fontFace: 'Arial Black',
  });
  const testimonials = [
    '"I continually choose Bisnow because their content and events are always quality and tie together nicely."',
    '"We made some tremendous new connections and renewed many existing ones."',
    '"Bisnow\'s advertising metrics are the best I\'ve seen for any publication."',
  ];
  testimonials.forEach((t, i) => {
    const y = 1.3 + i * 1.2;
    slide8.addShape(pptx.ShapeType.rect, {
      x: 0.8, y, w: 8.4, h: 0.9, fill: { color: '222240' }, rectRadius: 0.08,
    });
    slide8.addText(t, {
      x: 1.0, y: y + 0.05, w: 8, h: 0.8,
      fontSize: 13, italic: true, color: COLORS.white, fontFace: 'Arial', wrap: true,
    });
  });
  slide8.addShape(pptx.ShapeType.rect, {
    x: 3, y: 4.6, w: 4, h: 0.5, fill: { color: COLORS.orange }, rectRadius: 0.25,
  });
  slide8.addText('7 NAREE Awards in 2025', {
    x: 3, y: 4.6, w: 4, h: 0.5,
    fontSize: 13, bold: true, color: COLORS.white, fontFace: 'Arial', align: 'center',
  });
  addSlideNumber(slide8, 8, totalSlides);

  // --- Slide 9: Next Steps ---
  const slide9 = pptx.addSlide();
  slide9.background = { color: COLORS.lightGray };
  slide9.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: COLORS.orange } });
  slide9.addText('Next Steps', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: COLORS.charcoal, fontFace: 'Arial Black',
  });
  const bestEvent = events[0]?.event_name || 'our upcoming events';
  slide9.addText(`Let's discuss how to maximize your\nvisibility at ${bestEvent}`, {
    x: 1, y: 1.5, w: 8, h: 1,
    fontSize: 18, color: COLORS.darkText, fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.5,
  });
  slide9.addShape(pptx.ShapeType.rect, {
    x: 2, y: 2.8, w: 6, h: 2, fill: { color: COLORS.white }, rectRadius: 0.1,
    shadow: { type: 'outer', blur: 4, offset: 2, color: '00000020' },
  });
  slide9.addText('Jordan Hinsch', {
    x: 2.2, y: 2.95, w: 5.6, h: 0.45,
    fontSize: 20, bold: true, color: COLORS.charcoal, fontFace: 'Arial', align: 'center',
  });
  slide9.addText('Head of Sales, Florida', {
    x: 2.2, y: 3.35, w: 5.6, h: 0.35,
    fontSize: 14, color: COLORS.orange, fontFace: 'Arial', align: 'center',
  });
  slide9.addText('jordan.hinsch@bisnow.com', {
    x: 2.2, y: 3.75, w: 5.6, h: 0.35,
    fontSize: 13, color: COLORS.darkText, fontFace: 'Arial', align: 'center',
  });
  slide9.addText('BISNOW', {
    x: 3.5, y: 4.8, w: 3, h: 0.5,
    fontSize: 22, bold: true, color: COLORS.orange, fontFace: 'Arial Black', align: 'center',
  });
  addSlideNumber(slide9, 9, totalSlides);

  // Generate as Node buffer (for email attachment)
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  const fileName = `Bisnow_Proposal_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;

  return { buffer, fileName };
}
