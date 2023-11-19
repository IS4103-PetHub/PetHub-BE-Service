const path = require("path");

const PAGE_MARGIN = 50;
const FIRST_PAGE_MAX_ITEMS = 9;
const SUBSEQUENT_PAGE_MAX_ITEMS = 19;

/* =============================================== Helper functions ============================================ */
function generateHr(doc, y, thick = false, cutRight = false) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(thick ? 3 : 1)
    .moveTo(cutRight ? 390 : PAGE_MARGIN, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
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

function generateTableRow(doc, y, item, itemName, voucherCode, itemPrice) {
  doc
    .fontSize(8)
    .text(item, PAGE_MARGIN, y)
    .text(itemName, 130, y)
    .text(voucherCode, 400, y)
    .text(itemPrice, 445, y, { width: 90, align: "right" });
}

function generatePayoutTableRow(doc, y, item, itemName, quantity, itemPrice, totalPrice) {
  doc
    .fontSize(8)
    .text(item, PAGE_MARGIN, y)
    .text(itemName, 130, y)
    .text(quantity, 300, y)
    .text(itemPrice, 355, y, { width: 90, align: "right" })
    .text(totalPrice, 445, y, { width: 90, align: "right" });
}

function generateTableHeader(doc, baseYValue, removeVoucherCode = false) {
  doc.font("Helvetica-Bold");
  generateTableRow(doc, baseYValue, "Item", "Title", removeVoucherCode ? "" : "Voucher Code", "Price");
  generateHr(doc, baseYValue + 20);
  doc.font("Helvetica");
}

function generatePayoutTableHeader(doc, baseYValue) {
  doc.font("Helvetica-Bold");
  generatePayoutTableRow(doc, baseYValue, "Item", "Title", "Quantity", "Item Price", "Total Price");
  generateHr(doc, baseYValue + 20);
  doc.font("Helvetica");
}
/* =============================================== Header functions ============================================ */

function generatePethubInfo(doc, paymentId) {
  doc.fontSize(20).font("Helvetica-Bold").text("PetHub Pte Ltd").moveDown();
  doc.fillColor("#000000").fontSize(10).text("Payment ID:").font("Helvetica").text(paymentId).moveDown();
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

function generatePetBusinessHeaderInfo(doc, paymentId, data) {
  doc.fontSize(20).font("Helvetica-Bold").text("PetHub Pte Ltd").moveDown();
  doc.fillColor("#000000").fontSize(10).text("Payment ID:").font("Helvetica").text(paymentId).moveDown();
  doc
    .font("Helvetica-Bold")
    .text("Payee:")
    .font("Helvetica")
    .text(`${data.petBusiness.companyName}`)
    .text(`${data.petBusiness.uen}`)
    .text(`${data.petBusiness.websiteURL}`)
    .text(`${data.petBusiness.businessAddresses[0].addressName}`)
    .text(`${data.petBusiness.businessAddresses[0].line1}`)
    .text(data.petBusiness.businessAddresses[0].line2 ? `${data.petBusiness.businessAddresses[0].line2}` : ``)
    .text(`Singapore ${data.petBusiness.businessAddresses[0].postalCode}`)
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
    // .text("Payment ID:", colOneXValue, baseYValue)
    // .text(data.paymentId, colTwoXValue, baseYValue)
    .text("Order Date:", colOneXValue, baseYValue)
    .text(formatDate(new Date()), colTwoXValue, baseYValue)
    .text("Total Paid:", colOneXValue, baseYValue + lineBreakYValue)
    .text(formatCurrency(data.finalTotalPrice), colTwoXValue, baseYValue + lineBreakYValue);

  doc
    .text(`${data.petOwner.firstName} ${data.petOwner.lastName}`, colThreeXValue, baseYValue)
    .text(data.petOwner.user.email, colThreeXValue, baseYValue + lineBreakYValue)
    .text("+65 " + data.petOwner.contactNumber, colThreeXValue, baseYValue + 2 * lineBreakYValue)
    .moveDown();

  generateHr(doc, 310, true);
}

function generatePetBusinessInfo(doc, data) {
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
    .text("Payout Date:", colOneXValue, baseYValue)
    .text(formatDate(new Date()), colTwoXValue, baseYValue)
    .text("Payout Amount:", colOneXValue, baseYValue + lineBreakYValue)
    .text(formatCurrency(data.payoutInvoice.paidOutAmount), colTwoXValue, baseYValue + lineBreakYValue);

  doc
    .text(`${data.petBusiness.companyName}`, colThreeXValue, baseYValue)
    .text(data.petBusiness.user.email, colThreeXValue, baseYValue + lineBreakYValue)
    .text("+65 " + data.petBusiness.contactNumber, colThreeXValue, baseYValue + 2 * lineBreakYValue)
    .moveDown();

  generateHr(doc, 310, true);
}

/* =============================================== Content functions ============================================ */

function generateItems(doc, data, removeVoucherCode = false) {
  let isFirstPage = true;
  let baseYValue = 360;
  let yPosition = baseYValue;
  let pageItemCount = 0;

  generateTableHeader(doc, baseYValue, removeVoucherCode);

  for (let i = 0; i < data.orderItems.length; i++) {
    const item = data.orderItems[i];
    yPosition += 30;
    pageItemCount++;

    // If no more space, move to a new page
    if (
      (isFirstPage && pageItemCount > FIRST_PAGE_MAX_ITEMS) ||
      (!isFirstPage && pageItemCount > SUBSEQUENT_PAGE_MAX_ITEMS)
    ) {
      generateFooter(doc, "~~continues on the next page~~");
      doc.addPage();
      generateTableHeader(doc, PAGE_MARGIN, removeVoucherCode);
      yPosition = PAGE_MARGIN + 30;
      pageItemCount = 1;
      isFirstPage = false;
    }

    generateTableRow(
      doc,
      yPosition,
      i + 1,
      item.itemName,
      removeVoucherCode ? "" : item.voucherCode,
      formatCurrency(item.itemPrice)
    );
    generateHr(doc, yPosition + 20);
  }
  return yPosition;
}

function generatePayoutItems(doc, data) {
  let isFirstPage = true;
  let baseYValue = 360;
  let yPosition = baseYValue;
  let pageItemCount = 0;

  generatePayoutTableHeader(doc, baseYValue);

  const groupedOrderItems = {};
  data.orderItems.forEach((item) => {
    const serviceListingId = item.serviceListingId;

    if (!groupedOrderItems[serviceListingId]) {
      groupedOrderItems[serviceListingId] = [];
    }

    groupedOrderItems[serviceListingId].push(item);
  });

  let i = 0;
  for (const serviceListingId in groupedOrderItems) {
    if (groupedOrderItems.hasOwnProperty(serviceListingId)) {
      yPosition += 30;
      pageItemCount++;

      if (
        (isFirstPage && pageItemCount > FIRST_PAGE_MAX_ITEMS) ||
        (!isFirstPage && pageItemCount > SUBSEQUENT_PAGE_MAX_ITEMS)
      ) {
        generateFooter(doc, "~~continues on the next page~~");
        doc.addPage();
        generatePayoutTableHeader(doc, PAGE_MARGIN);
        yPosition = PAGE_MARGIN + 30;
        pageItemCount = 1;
        isFirstPage = false;
      }

      const orderItems = groupedOrderItems[serviceListingId];
      const serviceListingName = orderItems[0].itemName; // Assuming all items in a group have the same name
      const itemPrice = orderItems[0].itemPrice; // Assuming all items in a group have the same price
      const quantity = orderItems.length;

      generatePayoutTableRow(
        doc,
        yPosition,
        i + 1,
        serviceListingName,
        quantity,
        formatCurrency(itemPrice),
        formatCurrency(itemPrice * quantity)
      );
      generateHr(doc, yPosition + 20);
      i++;
    }
  }
  return yPosition;
}

function generateTotals(doc, data, yStartPosition, isSingleItem) {
  const lineBreakYValue = 20;

  console.log("data", data);

  doc.font("Helvetica-Bold");
  !isSingleItem && generateTableRow(doc, yStartPosition, "", "", "Subtotal", formatCurrency(data.totalPrice));
  !isSingleItem &&
    generateTableRow(
      doc,
      yStartPosition + lineBreakYValue,
      "",
      "",
      "Miscellaneous fee",
      formatCurrency(data.miscCharge)
    );
  !isSingleItem &&
    data.pointsRedeemed !== 0 &&
    generateTableRow(
      doc,
      yStartPosition + 2 * lineBreakYValue,
      "",
      "",
      "Points offset",
      `(${data.pointsRedeemed} points) -${formatCurrency(data.pointsRedeemed / 100)}`
    );

  generateTableRow(
    doc,
    yStartPosition + 3 * lineBreakYValue,
    "",
    "",
    "Amount Paid",
    formatCurrency(data.finalTotalPrice)
  );
  generateHr(doc, yStartPosition + 4 * lineBreakYValue, false, true);
  generateHr(doc, yStartPosition + 4 * lineBreakYValue + 2, false, true);
}

function generatePayoutTotals(doc, data, yStartPosition) {
  const lineBreakYValue = 20;
  doc.font("Helvetica-Bold");
  generateTableRow(doc, yStartPosition, "", "", "Subtotal", formatCurrency(data.payoutInvoice.totalAmount));
  generateTableRow(
    doc,
    yStartPosition + lineBreakYValue,
    "",
    "",
    "Commission Charges",
    formatCurrency(data.payoutInvoice.commissionCharge)
  );
  generateTableRow(
    doc,
    yStartPosition + 2 * lineBreakYValue,
    "",
    "",
    "Paid out amount",
    formatCurrency(data.payoutInvoice.paidOutAmount)
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
  invoiceGeneratePetBusinessHeaderInfo: generatePetBusinessHeaderInfo,
  invoiceGeneratePethubImage: generatePethubImage,
  invoiceGenerateCustomerInfo: generateCustomerInfo,
  invoiceGeneratePetBusinessInfo: generatePetBusinessInfo,
  invoiceGenerateItems: generateItems,
  invoiceGeneratePayoutItems: generatePayoutItems,
  invoiceGenerateInvoiceTotals: generatePayoutTotals,
  invoiceGenerateTotals: generateTotals,
  invoiceGenerateFooter: generateFooter,
  invoiceGeneratePageNumbers: generatePageNumbers,
};
