const fs = require("fs");
const PDFDocument = require("pdfkit");
const InvoiceData = require("./invoiceData.json");
const ReportService = require("../reports/reportService.js");

class InvoiceService {
  constructor() {}

  StubFunction() {
    // Create Invoice item, generate invoice, and store invoice in database
    // ReportService.generateInvoice(InvoiceData, "INVOICE_NUMBER_HERE.pdf");
  }
}

module.exports = new InvoiceService();

// Test invoice generation: in src\api\services\invoices: `node invoiceService.js`
ReportService.generateInvoice(InvoiceData, "TEST_INVOICE.pdf");
