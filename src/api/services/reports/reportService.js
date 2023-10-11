const fs = require("fs");
const PDFDocument = require("pdfkit");
const {
  invoiceGeneratePethubInfo,
  invoiceGeneratePethubImage,
  invoiceGenerateCustomerInfo,
  invoiceGenerateItems,
  invoiceGenerateTotals,
  invoiceGenerateFooter,
  invoiceGeneratePageNumbers,
} = require("./invoice/invoice.js");

class ReportService {
  constructor() {}

  generateInvoice(data, invoiceNumber) {
    let doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    // header
    invoiceGeneratePethubInfo(doc, invoiceNumber);
    invoiceGeneratePethubImage(doc);

    // order summary
    invoiceGenerateCustomerInfo(doc, data);

    // main content
    let yEndPosition = invoiceGenerateItems(doc, data);
    invoiceGenerateTotals(doc, data, yEndPosition + 40);

    // footer
    invoiceGenerateFooter(
      doc,
      "Thank you for choosing PetHub. PetHub is committed to ensuring the best for your furry, feathery, or scaly family member. Here's to many more happy moments together. Stay pawsome!"
    );
    invoiceGeneratePageNumbers(doc);

    doc.end();
    doc.pipe(fs.createWriteStream(invoiceNumber + ".pdf")); // Pipe to a file on local first for testing, later can change to pipe to blob for s3
  }
}

module.exports = new ReportService();
