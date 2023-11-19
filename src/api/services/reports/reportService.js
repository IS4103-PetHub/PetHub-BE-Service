const fs = require("fs");
const PDFDocument = require("pdfkit");
const PetOwnerService = require("../user/petOwnerService");
const CustomError = require("../../errors/customError");
const ReportError = require("../../errors/reportError");
const constants = require("../../../constants/transactions");
const s3ServiceInstance = require("../s3Service.js");
const {
  invoiceGeneratePethubInfo,
  invoiceGeneratePetBusinessHeaderInfo,
  invoiceGeneratePetBusinessInfo,
  invoiceGeneratePethubImage,
  invoiceGenerateCustomerInfo,
  invoiceGenerateItems,
  invoiceGeneratePayoutItems,
  invoiceGenerateTotals,
  invoiceGenerateInvoiceTotals,
  invoiceGenerateFooter,
  invoiceGeneratePageNumbers,
} = require("./invoice/invoice.js");
const { pet } = require("../../../../prisma/prisma");
const petBusinessService = require("../user/petBusinessService");

class ReportService {
  constructor() {}

  async generatePayoutInvoice(payoutInvoice, orderItems) {
    try {
      let data = {};
      const petBusiness = await petBusinessService.getUserById(payoutInvoice.userId);

      data.orderItems = JSON.parse(JSON.stringify(orderItems));
      data.payoutInvoice = JSON.parse(JSON.stringify(payoutInvoice));
      data.petBusiness = petBusiness;

      let doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
      // header
      invoiceGeneratePetBusinessHeaderInfo(doc, payoutInvoice.paymentId, data);
      invoiceGeneratePethubImage(doc);

      // order summary
      invoiceGeneratePetBusinessInfo(doc, data);

      // main content
      let yEndPosition = invoiceGeneratePayoutItems(doc, data);
      invoiceGenerateInvoiceTotals(doc, data, yEndPosition + 40);

      // footer
      invoiceGenerateFooter(
        doc,
        "Thank you for choosing PetHub. PetHub is committed to ensuring the best for your furry, feathery, or scaly family member. Here's to many more happy moments together. Stay pawsome!"
      );
      invoiceGeneratePageNumbers(doc);
      // Uncomment to pipe to a file on local for testing
      // doc.end();
      // doc.pipe(fs.createWriteStream(`IN-${payoutInvoice.paymentId}.pdf`));

      // Attempt s3 upload and returns the attachment key and URL from the uploaded file
      return this.uploadReportToS3(
        [
          {
            originalname: `IN-${payoutInvoice.paymentId}.pdf`,
            buffer: await this.docToBuffer(doc),
          },
        ],
        "invoices"
      );
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ReportError(error);
    }
  }

  async generateInvoice(invoice, orderItems, singleItem = false) {
    try {
      let data;
      const petOwner = await PetOwnerService.getUserById(invoice.petOwnerUserId);

      if (singleItem) {
        // deep copy so we don't mess with the original order item (just in case another service passes in an object not to be mutated)
        data = JSON.parse(JSON.stringify(orderItems[0]));
        data.finalTotalPrice = orderItems[0].itemPrice;
      } else {
        data = JSON.parse(JSON.stringify(invoice)); // deep copy so we don't mess with the original invoice
      }
      data.orderItems = orderItems;
      data.petOwner = petOwner;

      let doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
      // header
      invoiceGeneratePethubInfo(doc, invoice.paymentId);
      invoiceGeneratePethubImage(doc);

      // order summary
      invoiceGenerateCustomerInfo(doc, data);

      // main content
      let yEndPosition = invoiceGenerateItems(doc, data, singleItem);
      invoiceGenerateTotals(doc, data, yEndPosition + 40, singleItem);

      // footer
      invoiceGenerateFooter(
        doc,
        "Thank you for choosing PetHub. PetHub is committed to ensuring the best for your furry, feathery, or scaly family member. Here's to many more happy moments together. Stay pawsome!"
      );
      invoiceGeneratePageNumbers(doc);

      // Uncomment to pipe to a file on local for testing
      // doc.end();
      // doc.pipe(fs.createWriteStream(`IN-${paymentId}.pdf`));

      // Attempt s3 upload and returns the attachment key and URL from the uploaded file
      return this.uploadReportToS3(
        [
          {
            originalname: `IN-${invoice.paymentId}.pdf`,
            buffer: await this.docToBuffer(doc),
          },
        ],
        "invoices"
      );
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ReportError(error);
    }
  }

  // Helper function to combine data from a pdfkit doc into a buffer for upload to S3
  docToBuffer(doc) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });
      doc.on("end", () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      doc.on("error", (err) => {
        reject(err);
      });
      doc.end();
    });
  }

  // Helper function to upload to S3 and return attachment keys and URLs
  async uploadReportToS3(files, bucket) {
    try {
      if (files) {
        const attachmentKeys = await s3ServiceInstance.uploadPdfFiles(files, bucket);
        const attachmentURLs = await s3ServiceInstance.getObjectSignedUrl(attachmentKeys);
        if (attachmentKeys.length > 0 && attachmentURLs.length > 0) {
          return {
            attachmentKey: attachmentKeys[0],
            attachmentURL: attachmentURLs[0],
          };
        }
        return {};
      }
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new ReportError(error);
    }
  }
}

module.exports = new ReportService();
