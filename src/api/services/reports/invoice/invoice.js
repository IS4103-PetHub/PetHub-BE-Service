const path = require("path");

const PAGE_MARGIN = 50;
const FIRST_PAGE_MAX_ITEMS = 9;
const SUBSEQUENT_PAGE_MAX_ITEMS = 19;

/* =============================================== Helper functions ============================================ */
function generateHr(doc, y, thick = false, cutRight = false) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(thick ? 3 : 1)
    .moveTo(cutRight ? 410 : PAGE_MARGIN, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function getGSTDetails(cents) {
  return { amount: formatCurrency(cents * 0.08), totalWithout: formatCurrency(cents * 0.92) };
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return day + "/" + month + "/" + year;
}

function generateTableRow(doc, y, item, title, voucher, duration, price) {
  doc
    .fontSize(10)
    .text(item, PAGE_MARGIN, y)
    .text(title, 120, y)
    .text(voucher, 320, y)
    .text(duration, 390, y, { width: 90, align: "right" })
    .text(price, 0, y, { align: "right" });
}

function generateTableHeader(doc, baseYValue) {
  doc.font("Helvetica-Bold");
  generateTableRow(doc, baseYValue, "Item", "Title", "Voucher", "Duration", "Price");
  generateHr(doc, baseYValue + 20);
  doc.font("Helvetica");
}

/* =============================================== Header functions ============================================ */

function generatePethubInfo(doc) {
  doc.fontSize(20).font("Helvetica-Bold").text("PetHub Pte Ltd").moveDown();
  doc
    .fillColor("#000000")
    .fontSize(10)
    .text("Invoice Number:")
    .font("Helvetica")
    .text("IN04102023-1")
    .moveDown();
  doc
    .font("Helvetica-Bold")
    .text("Payee:")
    .font("Helvetica")
    .text("Pethub Pte Ltd")
    .text("25 Grove Street")
    .text("Blueberry Tower 2")
    .text("Singapore 59123")
    .moveDown();
}

function generatePethubImage(doc) {
  const imagePath = path.join(__dirname, "pethublogo.png");
  doc.image(imagePath, 410, 45, { scale: 0.1 });
  doc
    .fillColor("#606060")
    .fontSize(12)
    .font("Helvetica-Oblique")
    .text("Every pet deserves the best", 380, 95, { align: "right" });
}

/* =============================================== Summary functions ============================================ */

function generateCustomerInfo(doc, data) {
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(12).text("Detail Summary", 50, 220);

  generateHr(doc, 245, true);

  const baseYValue = 260;
  const lineBreakYValue = 15;
  const colOneXValue = PAGE_MARGIN;
  const colTwoXValue = 150;
  const colThreeXValue = 300;

  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Order Number:", colOneXValue, baseYValue)
    .text(data.invoice_nr, colTwoXValue, baseYValue)
    .text("Order Date:", colOneXValue, baseYValue + lineBreakYValue)
    .text(formatDate(new Date()), colTwoXValue, baseYValue + lineBreakYValue)
    .text("Total Paid:", colOneXValue, baseYValue + 2 * lineBreakYValue)
    .text(formatCurrency(data.paid), colTwoXValue, baseYValue + 2 * lineBreakYValue);

  doc
    .text(data.customer.name, colThreeXValue, baseYValue)
    .text(data.customer.email, colThreeXValue, baseYValue + lineBreakYValue)
    .text("+65 " + data.customer.contact, colThreeXValue, baseYValue + 2 * lineBreakYValue)
    .moveDown();

  generateHr(doc, 310, true);
}

/* =============================================== Content functions ============================================ */

function generateItems(doc, data) {
  let isFirstPage = true;
  let baseYValue = 360;
  let yPosition = baseYValue;
  let pageItemCount = 0;

  generateTableHeader(doc, baseYValue);

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    yPosition += 30;
    pageItemCount++;

    // If no more space, move to a new page
    if (
      (isFirstPage && pageItemCount > FIRST_PAGE_MAX_ITEMS) ||
      (!isFirstPage && pageItemCount > SUBSEQUENT_PAGE_MAX_ITEMS)
    ) {
      generateFooter(doc, "~~continues on the next page~~");
      doc.addPage();
      generateTableHeader(doc, PAGE_MARGIN);
      yPosition = PAGE_MARGIN + 30;
      pageItemCount = 1;
      isFirstPage = false;
    }

    generateTableRow(
      doc,
      yPosition,
      i + 1,
      item.title,
      "PH-AD145F5X32",
      item.duration + "m",
      formatCurrency(item.basePrice)
    );
    generateHr(doc, yPosition + 20);
  }
  return yPosition;
}

function generateTotals(doc, data, yStartPosition) {
  const lineBreakYValue = 20;
  const gstDetails = getGSTDetails(data.paid);

  doc.font("Helvetica-Bold");
  generateTableRow(doc, yStartPosition, "", "", "", "Subtotal", gstDetails.totalWithout);
  generateTableRow(doc, yStartPosition + lineBreakYValue, "", "", "", "GST (8%)", gstDetails.amount);
  generateTableRow(
    doc,
    yStartPosition + 2 * lineBreakYValue,
    "",
    "",
    "",
    "Amount Paid",
    formatCurrency(data.paid)
  );
  generateHr(doc, yStartPosition + 3 * lineBreakYValue, false, true);
  generateHr(doc, yStartPosition + 3 * lineBreakYValue + 2, false, true);
}

/* =============================================== Footer functions ============================================ */

function generateFooter(doc, text) {
  doc.font("Helvetica-Oblique").fontSize(10).text(text, PAGE_MARGIN, 760, {
    align: "center",
    width: 500,
  });
}

function generatePageNumbers(doc) {
  doc.font("Helvetica-Bold");
  let pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    let oldBottomMargin = doc.page.margins.bottom; // remove and add back margin later
    doc.page.margins.bottom = 0;
    doc.text(
      `Page ${i + 1} of ${pages.count}`,
      PAGE_MARGIN,
      doc.page.height - oldBottomMargin / 2, // Centered vertically
      { align: "center" }
    );
    doc.page.margins.bottom = oldBottomMargin;
  }
}

module.exports = {
  invoiceGeneratePethubInfo: generatePethubInfo,
  invoiceGeneratePethubImage: generatePethubImage,
  invoiceGenerateCustomerInfo: generateCustomerInfo,
  invoiceGenerateItems: generateItems,
  invoiceGenerateTotals: generateTotals,
  invoiceGenerateFooter: generateFooter,
  invoiceGeneratePageNumbers: generatePageNumbers,
};
