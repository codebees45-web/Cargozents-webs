// Lightweight, dependency-free "download as PDF" helper.
// Opens a formatted, print-ready document in a new tab and triggers the
// browser's print dialog, where the user can choose "Save as PDF".
// This avoids pulling in a heavy client-side PDF library just to let
// buyers download a receipt/invoice.

const buildRows = (rows) =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <td class="label">${label}</td>
          <td class="value">${value ?? "-"}</td>
        </tr>`
    )
    .join("");

export function printInvoice({ heading, subheading, rows, footer }) {
  const printWindow = window.open("", "_blank", "width=800,height=900");

  if (!printWindow) {
    // Popup blocked - let the caller know so it can show a message.
    return false;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${heading}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, "Segoe UI", Arial, sans-serif;
            color: #0F2E24;
            padding: 48px;
          }
          h1 {
            margin: 0 0 4px;
            font-size: 22px;
            color: #0F2E24;
          }
          p.subheading {
            margin: 0 0 32px;
            color: #5B7A70;
            font-size: 13px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 12px 0;
            border-bottom: 1px solid #E4EDE9;
            font-size: 14px;
          }
          td.label {
            color: #5B7A70;
            width: 40%;
          }
          td.value {
            font-weight: 600;
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #5B7A70;
            text-align: center;
          }
          @media print {
            body { padding: 24px; }
          }
        </style>
      </head>
      <body>
        <h1>${heading}</h1>
        ${subheading ? `<p class="subheading">${subheading}</p>` : ""}
        <table>${buildRows(rows)}</table>
        ${footer ? `<p class="footer">${footer}</p>` : ""}
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Give the new document a tick to render before printing.
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  return true;
}