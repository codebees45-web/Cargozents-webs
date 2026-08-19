import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { printInvoice } from "../../utils/printInvoice";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // buyerService.getInvoices()
    setInvoices([
      {
        invoiceNo: "INV-2026001",
        orderId: "CGZ-100125",
        amount: 850,
        date: "20 Jul 2026",
        status: "Paid",
      },
      {
        invoiceNo: "INV-2026002",
        orderId: "CGZ-100126",
        amount: 1200,
        date: "18 Jul 2026",
        status: "Paid",
      },
    ]);
  }, []);

  const downloadInvoice = (invoice) => {
    const opened = printInvoice({
      heading: "CargoZent Invoice",
      subheading: `Invoice ${invoice.invoiceNo}`,
      rows: [
        ["Invoice No", invoice.invoiceNo],
        ["Order ID", invoice.orderId],
        ["Amount", `₹${invoice.amount}`],
        ["Date", invoice.date],
        ["Status", invoice.status],
      ],
      footer: "Thank you for shipping with CargoZent.",
    });

    if (!opened) {
      alert(
        "Please allow pop-ups for this site to download the invoice."
      );
    }
  };

  return (
    <DashboardLayout
      title="Invoices"
      subtitle="Download invoices for completed shipments."
    >
      <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-secondary/20">

            <tr>

              <th className="text-left px-6 py-4">Invoice No</th>
              <th className="text-left px-6 py-4">Order ID</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Action</th>

            </tr>

          </thead>

          <tbody>

            {invoices.map((invoice) => (

              <tr
                key={invoice.invoiceNo}
                className="border-t border-primary/10"
              >

                <td className="px-6 py-4">
                  {invoice.invoiceNo}
                </td>

                <td className="px-6 py-4">
                  {invoice.orderId}
                </td>

                <td className="px-6 py-4">
                  ₹{invoice.amount}
                </td>

                <td className="px-6 py-4">
                  {invoice.date}
                </td>

                <td className="px-6 py-4">

                  <span className="bg-success/10 text-success rounded-md px-3 py-1 text-sm">
                    {invoice.status}
                  </span>

                </td>

                <td className="px-6 py-4">

                  <button
                    onClick={() => downloadInvoice(invoice)}
                    className="rounded-lg border border-primary/20 px-4 py-2 text-primary hover:bg-primary/5"
                  >
                    Download PDF
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </DashboardLayout>
  );
}