const fs = require("fs");
const PDFDocument = require("pdfkit");
const PetOwnerService = require("../user/petOwnerService");
const CustomError = require("../../errors/customError");
const ReportError = require("../../errors/reportError");
const constants = require("../../../constants/transactions");
const s3ServiceInstance = require("../s3Service.js");
const {
  invoiceGeneratePethubInfo,
  invoiceGeneratePethubImage,
  invoiceGenerateCustomerInfo,
  invoiceGenerateItems,
  invoiceGenerateTotals,
  invoiceGenerateFooter,
  invoiceGeneratePageNumbers,
} = require("./invoice/invoice.js");
const { pet } = require("../../../../prisma/prisma");

class ReportService {
  constructor() { }

  async generateInvoice(invoice, orderItems, singleItem = false) {
    try {
      let data;
      const petOwner = await PetOwnerService.getUserById(invoice.petOwnerUserId);

      if (singleItem) {
        // deep copy so we don't mess with the original order item (just in case another service passes in an object not to be mutated)
        data = JSON.parse(JSON.stringify(orderItems[0]));
        // Calculate misc fee and total price
        data.miscCharge = Math.round(orderItems[0].itemPrice * constants.MISC_CHARGE_PCT * 100) / 100;
        data.totalPrice = orderItems[0].itemPrice + data.miscCharge;
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
      let yEndPosition = invoiceGenerateItems(doc, data, singleItem ? true : false);
      invoiceGenerateTotals(doc, data, yEndPosition + 40);

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
