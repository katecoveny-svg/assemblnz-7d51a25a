import jsPDF from "jspdf";

// ── Whenua Palette (RGB) ──
const KOWHAI_GOLD: [number, number, number] = [212, 168, 67];
const POUNAMU_TEAL: [number, number, number] = [58, 125, 110];
const TANGAROA_NAVY: [number, number, number] = [26, 58, 92];
const COSMIC_BG: [number, number, number] = [9, 9, 15];
const SURFACE: [number, number, number] = [15, 15, 26];
const BONE_WHITE: [number, number, number] = [245, 240, 232];
const TEXT_PRIMARY: [number, number, number] = [20, 20, 30];
const TEXT_SECONDARY: [number, number, number] = [90, 90, 100];
const TEXT_MUTED: [number, number, number] = [140, 140, 150];
const DIVIDER: [number, number, number] = [220, 215, 205];

/**
 * Draws the Assembl logo and header branding on a jsPDF document.
 * Returns the Y position after the header.
 *
 * Whenua palette — Kōwhai Gold accent, clean professional layout.
 */
export function drawAssemblPDFHeader(
  doc: jsPDF,
  options: {
    agentName?: string;
    agentDesignation?: string;
    subtitle?: string;
    margin?: number;
    customLogoUrl?: string;
    customBusinessName?: string;
    documentTitle?: string;
    documentVersion?: string;
  } = {}
): number {
  const { agentName, agentDesignation, subtitle, margin = 20, customBusinessName, documentTitle, documentVersion } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Top accent bar — Kōwhai Gold gradient effect (solid gold)
  doc.setFillColor(...KOWHAI_GOLD);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  // Secondary thin line — Pounamu Teal
  doc.setFillColor(...POUNAMU_TEAL);
  doc.rect(0, 2.5, pageWidth, 0.5, "F");

  // Assembl mark — geometric diamond (Whenua-styled)
  const lx = margin;
  const ly = y + 5;
  const diamondSize = 5;

  // Diamond shape using Kōwhai Gold
  doc.setFillColor(...KOWHAI_GOLD);
  doc.setDrawColor(...KOWHAI_GOLD);
  // Draw a diamond (rotated square)
  const pts = [
    { x: lx + diamondSize, y: ly - diamondSize },    // top
    { x: lx + diamondSize * 2, y: ly },               // right
    { x: lx + diamondSize, y: ly + diamondSize },     // bottom
    { x: lx, y: ly },                                  // left
  ];
  doc.setLineWidth(0.5);
  doc.line(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
  doc.line(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
  doc.line(pts[2].x, pts[2].y, pts[3].x, pts[3].y);
  doc.line(pts[3].x, pts[3].y, pts[0].x, pts[0].y);

  // Inner dot — Pounamu Teal
  doc.setFillColor(...POUNAMU_TEAL);
  doc.circle(lx + diamondSize, ly, 1.5, "F");

  // Brand name — ASSEMBL in tracked uppercase
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_PRIMARY);
  const displayName = customBusinessName || "ASSEMBL";
  doc.text(displayName, margin + 14, y + 6);

  // Tagline
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_SECONDARY);
  if (!customBusinessName) {
    doc.text("assembl.co.nz  ·  Business Intelligence Platform  ·  Built in Aotearoa", margin + 14, y + 10);
  }

  // Right-aligned metadata
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
  doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth - margin, y + 3, { align: "right" });
  if (documentVersion) {
    doc.text(`Version: ${documentVersion}`, pageWidth - margin, y + 7, { align: "right" });
  }
  doc.setFontSize(6);
  doc.setTextColor(...KOWHAI_GOLD);
  doc.text("CONFIDENTIAL", pageWidth - margin, y + (documentVersion ? 11 : 7), { align: "right" });

  y += 18;

  // Document title — large, clean
  if (documentTitle) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_PRIMARY);
    const titleLines = doc.splitTextToSize(documentTitle, pageWidth - margin * 2);
    for (const line of titleLines) {
      doc.text(line, margin, y);
      y += 6;
    }
    y += 1;
  }

  // Agent info — Pounamu accent
  if (agentName) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...POUNAMU_TEAL);
    const agentLine = agentDesignation ? `${agentName}  ·  ${agentDesignation}` : agentName;
    doc.text(agentLine, margin, y);
    y += 5;
  }

  // Subtitle
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(subtitle, margin, y);
    y += 5;
  }

  // Divider — subtle Kōwhai Gold tinted line
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  // Gold accent on left portion
  doc.setDrawColor(...KOWHAI_GOLD);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 30, y);
  y += 8;

  return y;
}

/**
 * Draws professional footer with legal disclaimers on all pages.
 * Whenua palette — warm, professional NZ feel.
 */
export function drawAssemblPDFFooter(
  doc: jsPDF,
  options: {
    agentName?: string;
    margin?: number;
    y?: number;
    includePageNumbers?: boolean;
  } = {}
): void {
  const { agentName = "Assembl AI", margin = 20, y: customY, includePageNumbers = true } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const totalPages = doc.getNumberOfPages();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    let y = customY ?? pageHeight - 30;

    // Divider — gold accent left, subtle line right
    doc.setDrawColor(...KOWHAI_GOLD);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 20, y);
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(margin + 20, y, pageWidth - margin, y);
    y += 3.5;

    // AI disclaimer
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `Generated by ${agentName} via Assembl — AI-generated content. Review by a qualified professional before use or reliance. ` +
      `Assembl does not provide legal, financial, tax, medical, or construction advice. Consult a licensed professional for your situation.`,
      margin, y, { maxWidth }
    );
    y += 7;

    // Copyright
    doc.setFontSize(6);
    doc.setTextColor(160, 155, 145);
    doc.text(
      `© ${new Date().getFullYear()} Assembl Ltd, Auckland, New Zealand. All rights reserved. Built in Aotearoa. ` +
      `NZ legislation references are current as at date of generation — verify at legislation.govt.nz.`,
      margin, y, { maxWidth }
    );

    // Page numbers — Pounamu accent
    if (includePageNumbers && totalPages > 1) {
      doc.setFontSize(7);
      doc.setTextColor(...POUNAMU_TEAL);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Bottom accent bars — Kōwhai then Pounamu
    doc.setFillColor(...POUNAMU_TEAL);
    doc.rect(0, pageHeight - 3, pageWidth, 0.5, "F");
    doc.setFillColor(...KOWHAI_GOLD);
    doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, "F");
  }
}

/**
 * Renders markdown content to PDF with proper formatting.
 * Handles headings, bold, bullets, numbered lists, checkboxes, and tables.
 * Whenua-branded heading accents and table styling.
 */
export function renderMarkdownToPDF(
  doc: jsPDF,
  content: string,
  options: {
    startY: number;
    margin?: number;
    maxWidth?: number;
    senderLabel?: string;
    senderColor?: [number, number, number];
  }
): number {
  const margin = options.margin ?? 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = options.maxWidth ?? pageWidth - margin * 2;
  let y = options.startY;

  const checkPage = (needed: number) => {
    if (y + needed > 260) {
      doc.addPage();
      y = 20;
    }
  };

  // Sender label
  if (options.senderLabel) {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const [r, g, b] = options.senderColor || TEXT_PRIMARY;
    doc.setTextColor(r, g, b);
    doc.text(options.senderLabel, margin, y);
    // Accent underline — Kōwhai Gold
    const w = doc.getTextWidth(options.senderLabel);
    doc.setDrawColor(...KOWHAI_GOLD);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1, margin + w, y + 1);
    y += 7;
  }

  const lines = content.split("\n");
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const cols = tableRows[0].length;
    const colWidth = maxWidth / cols;
    
    // Header row — Tangaroa tint
    checkPage(8);
    doc.setFillColor(240, 238, 232);
    doc.rect(margin, y - 3, maxWidth, 7, "F");
    // Left accent on header
    doc.setFillColor(...KOWHAI_GOLD);
    doc.rect(margin, y - 3, 1.5, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 55);
    for (let c = 0; c < cols; c++) {
      const text = (tableRows[0][c] || "").trim();
      doc.text(text, margin + c * colWidth + 4, y + 1, { maxWidth: colWidth - 6 });
    }
    y += 6;
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 1, margin + maxWidth, y - 1);

    // Data rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 60);
    for (let r = 1; r < tableRows.length; r++) {
      checkPage(6);
      // Alternating row shading
      if (r % 2 === 0) {
        doc.setFillColor(250, 248, 244);
        doc.rect(margin, y - 2.5, maxWidth, 5, "F");
      }
      for (let c = 0; c < cols; c++) {
        const text = (tableRows[r][c] || "").trim();
        doc.text(text, margin + c * colWidth + 4, y + 1, { maxWidth: colWidth - 6 });
      }
      y += 5;
      if (r < tableRows.length - 1) {
        doc.setDrawColor(235, 230, 220);
        doc.setLineWidth(0.15);
        doc.line(margin, y - 1.5, margin + maxWidth, y - 1.5);
      }
    }
    y += 3;
    tableRows = [];
    inTable = false;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|[\s\-:]+\|/.test(trimmed) && trimmed.replace(/[\s|:\-]/g, "") === "") {
        inTable = true;
        continue;
      }
      const cells = trimmed.split("|").filter((_, i, a) => i > 0 && i < a.length - 1);
      tableRows.push(cells);
      inTable = true;
      continue;
    }

    if (inTable) flushTable();

    if (!trimmed) { y += 3; continue; }

    const h1 = trimmed.match(/^#\s+(.*)/);
    const h2 = trimmed.match(/^##\s+(.*)/);
    const h3 = trimmed.match(/^###\s+(.*)/);
    const h4 = trimmed.match(/^####\s+(.*)/);

    if (h1) {
      checkPage(12);
      y += 4;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_PRIMARY);
      const wrapped = doc.splitTextToSize(h1[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 6.5; }
      // Gold accent underline for h1
      doc.setDrawColor(...KOWHAI_GOLD);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 2, margin + 40, y - 2);
      y += 2;
    } else if (h2) {
      checkPage(10);
      y += 3;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(35, 35, 50);
      const wrapped = doc.splitTextToSize(h2[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 6; }
      // Pounamu accent
      doc.setDrawColor(...POUNAMU_TEAL);
      doc.setLineWidth(0.3);
      doc.line(margin, y - 1, margin + 25, y - 1);
      y += 2;
    } else if (h3) {
      checkPage(8);
      y += 2;
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 65);
      const wrapped = doc.splitTextToSize(h3[1].replace(/\*+/g, ""), maxWidth);
      for (const wl of wrapped) { doc.text(wl, margin, y); y += 5.5; }
      y += 1;
    } else if (h4) {
      checkPage(7);
      y += 1;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 75);
      doc.text(h4[1].replace(/\*+/g, ""), margin, y);
      y += 5;
    } else {
      // Regular text, bullets, numbered lists, checkboxes
      let text = trimmed
        .replace(/^#+\s*/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1");

      // Checkbox
      const checkbox = text.match(/^[-*]\s*\[([ xX])\]\s*(.*)/);
      if (checkbox) {
        const checked = checkbox[1].trim() !== "";
        text = `${checked ? "☑" : "☐"}  ${checkbox[2]}`;
      } else {
        // Bullet — use gold dot
        text = text.replace(/^[-*]\s+/g, "•  ");
      }

      const isBullet = text.startsWith("•") || text.startsWith("☑") || text.startsWith("☐");
      const isNumbered = /^\d+[\.\)]\s/.test(text);
      const indent = (isBullet || isNumbered) ? margin + 4 : margin;
      const textMaxWidth = (isBullet || isNumbered) ? maxWidth - 4 : maxWidth;

      const hasBold = /\*\*/.test(rawLine);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", hasBold ? "bold" : "normal");
      doc.setTextColor(40, 40, 50);

      // Bullet dot colour — Kōwhai Gold
      if (isBullet && text.startsWith("•")) {
        checkPage(5);
        doc.setTextColor(...KOWHAI_GOLD);
        doc.text("•", indent - 3, y);
        doc.setTextColor(40, 40, 50);
        const restText = text.substring(3);
        const wrapped = doc.splitTextToSize(restText, textMaxWidth);
        for (const wLine of wrapped) {
          checkPage(5);
          doc.text(wLine, indent, y);
          y += 4.5;
        }
        y += 1;
      } else {
        const wrapped = doc.splitTextToSize(text, textMaxWidth);
        for (const wLine of wrapped) {
          checkPage(5);
          doc.text(wLine, indent, y);
          y += 4.5;
        }
        y += 1;
      }
    }
  }

  if (inTable) flushTable();

  return y;
}

/**
 * Adds page numbers to all pages — Pounamu Teal accent
 */
export function addPageNumbers(doc: jsPDF, margin = 20): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...POUNAMU_TEAL);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }
}
