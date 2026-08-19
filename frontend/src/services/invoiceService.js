const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {

    const invoiceNo =
      "CZ-" +
      Date.now();

    // NOTE: deliberately NOT under uploads/ — that directory is served
    // publicly and statically by express.static in server.js. Invoices
    // contain customer names, addresses and order amounts, and the old
    // filename scheme (CZ-<timestamp>) was guessable, so they must only
    // be reachable through the authenticated /api/orders/:id/invoice
    // route (see orderController.getOrderInvoice), not a raw file URL.
    const folder = path.join(
      __dirname,
      "../../private/invoices"
    );

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(
      folder,
      `${invoiceNo}.pdf`
    );

    const doc = new PDFDocument();

    const stream =
      fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22)
      .text("CargoZent Invoice", {
        align: "center",
      });

    doc.moveDown();

    doc.fontSize(14);

    doc.text(`Invoice : ${invoiceNo}`);
    doc.text(`Order : ${order.orderId}`);
    doc.text(`Customer : ${order.delivery.contactName}`);
    doc.text(`Pickup : ${order.pickup.address}`);
    doc.text(`Delivery : ${order.delivery.address}`);
    doc.text(`Vehicle : ${order.vehicle.name}`);
    doc.text(`Amount : ₹${order.pricing.totalAmount}`);
    doc.text(`Payment : Paid`);
    doc.text(`Date : ${new Date().toLocaleString()}`);

    doc.moveDown();

    doc.text(
      "Thank you for choosing CargoZent.",
      { align: "center" }
    );

    doc.end();

    stream.on("finish", () => {
      resolve({ invoiceNo, filePath });
    });

    stream.on("error", reject);
  });
};

module.exports = {
  generateInvoice,
};