// backend/utils/pdf.js
const PDFDocument = require("pdfkit");

function safe(s) {
  if (s === null || s === undefined) return "";
  return String(s);
}

function addTitle(doc, title, subtitle = "") {
  doc.fontSize(18).text(title, { bold: true });
  if (subtitle) {
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#666").text(subtitle);
    doc.fillColor("#000");
  }
  doc.moveDown(1);
}

function addSection(doc, title) {
  doc.moveDown(0.5);
  doc.fontSize(13).text(title, { underline: true });
  doc.moveDown(0.5);
}

function addKeyValue(doc, items = []) {
  items.forEach(([k, v]) => {
    doc.fontSize(10).fillColor("#333").text(`${safe(k)}: `, { continued: true });
    doc.fillColor("#000").text(safe(v));
  });
  doc.moveDown(0.5);
}

function addBullets(doc, items = []) {
  items.forEach((t) => {
    doc.fontSize(10).text(`• ${safe(t)}`);
  });
  doc.moveDown(0.5);
}

function addTable(doc, headers = [], rows = []) {
  // Simple table renderer (good enough for summary PDFs)
  const startX = doc.x;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colW = pageWidth / Math.max(headers.length, 1);

  doc.fontSize(10).fillColor("#000");
  headers.forEach((h, i) => doc.text(safe(h), startX + i * colW, doc.y, { width: colW, continued: i !== headers.length - 1 }));
  doc.moveDown(0.4);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.4);

  rows.forEach((r) => {
    headers.forEach((_, i) => {
      doc.text(safe(r[i]), startX + i * colW, doc.y, { width: colW, continued: i !== headers.length - 1 });
    });
    doc.moveDown(0.3);
  });

  doc.moveDown(0.8);
}

function createDoc(res, filename = "report.pdf") {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

module.exports = {
  createDoc,
  addTitle,
  addSection,
  addKeyValue,
  addBullets,
  addTable,
};
