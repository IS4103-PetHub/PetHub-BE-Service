const fs = require("fs");
const PDFDocument = require("pdfkit");
const {
  generatePethubInfo,
  generatePethubImage,
  generateCustomerInfo,
  generateItems,
  generateTotals,
  generateFooter,
  generatePageNumbers,
} = require("./invoice/invoice.js");

class ReportService {
  constructor() {}

  generateInvoice(data, fileName) {
    let doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    // header
    generatePethubInfo(doc);
    generatePethubImage(doc);

    // order summary
    generateCustomerInfo(doc, data);

    // main content
    let yEndPosition = generateItems(doc, data);
    generateTotals(doc, data, yEndPosition + 40);

    // footer
    generateFooter(
      doc,
      "Thank you for choosing PetHub. PetHub is committed to ensuring the best for your furry, feathery, or scaly family member. Here's to many more happy moments together. Stay pawsome!"
    );
    generatePageNumbers(doc);

    doc.end();
    doc.pipe(fs.createWriteStream(fileName)); // Pipe to a file on local first, later can change to pipe to blob for s3
  }
}

module.exports = new ReportService();
