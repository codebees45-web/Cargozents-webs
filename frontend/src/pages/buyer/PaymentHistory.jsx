import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { printInvoice } from "../../utils/printInvoice";

const paymentData = [
  {
    id: "TXN983452",
    orderId: "CGZ-100125",
    amount: 850,
    method: "UPI",
    status: "Success",
    date: "20 Jul 2026",
  },
  {
    id: "TXN983453",
    orderId: "CGZ-100126",
    amount: 620,
    method: "Credit Card",
    status: "Pending",
    date: "19 Jul 2026",
  },
  {
    id: "TXN983454",
    orderId: "CGZ-100127",
    amount: 3400,
    method: "Net Banking",
    status: "Failed",
    date: "18 Jul 2026",
  },
];

// Local status style mapping configuration (High contrast, pure white text)
const statusConfig = {
  Pending: { bg: "#FF9100", text: "#FFFFFF", shadow: "rgba(255, 145, 0, 0.25)" },
  Accepted: { bg: "#00B0FF", text: "#FFFFFF", shadow: "rgba(0, 176, 255, 0.25)" },
  "Driver Assigned": { bg: "#00B0FF", text: "#FFFFFF", shadow: "rgba(0, 176, 255, 0.25)" },
  "In Transit": { bg: "#00B0FF", text: "#FFFFFF", shadow: "rgba(0, 176, 255, 0.25)" },
  Delivered: { bg: "#00E676", text: "#FFFFFF", shadow: "rgba(0, 230, 118, 0.25)" },
  Cancelled: { bg: "#FF3D00", text: "#FFFFFF", shadow: "rgba(255, 61, 0, 0.25)" },
  Failed: { bg: "#FF3D00", text: "#FFFFFF", shadow: "rgba(255, 61, 0, 0.25)" },
  Success: { bg: "#00E676", text: "#FFFFFF", shadow: "rgba(0, 230, 118, 0.25)" },
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPayments(paymentData);
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.id.toLowerCase().includes(search.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  const downloadReceipt = (payment) => {
    const opened = printInvoice({
      heading: "CargoZent Payment Receipt",
      subheading: `Transaction ${payment.id}`,
      rows: [
        ["Transaction ID", payment.id],
        ["Order ID", payment.orderId],
        ["Payment Method", payment.method],
        ["Amount", `₹${payment.amount}`],
        ["Status", payment.status],
        ["Date", payment.date],
      ],
      footer: "Thank you for shipping with CargoZent.",
    });

    if (!opened) {
      alert("Please allow pop-ups for this site to download the invoice.");
    }
  };

  return (
    <DashboardLayout
      title="Payment History"
      subtitle="View all payment transactions."
    >
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Search Input with Premium Dark Overrides */}
        <input
          type="text"
          placeholder="Search Transaction ID or Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 rounded-lg border border-primary/10 bg-secondary/20 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary placeholder-primary/40"
        />

        {/* Main Dark-Matte Card Table Container */}
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-secondary/20 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              
              <thead className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-[#8AA399]">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-primary/10 font-medium text-primary">
                {filteredPayments.map((payment) => {
                  // Select style from local status config
                  const styleConfig = statusConfig[payment.status] || {
                    bg: "#4B5563",
                    text: "#FFFFFF",
                    shadow: "rgba(0, 0, 0, 0.1)",
                  };

                  return (
                    <tr 
                      key={payment.id} 
                      className="transition hover:bg-primary/5"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-bold">
                        {payment.id}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">
                        {payment.orderId}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">
                        {payment.method}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-bold">
                        ₹{payment.amount}
                      </td>

                      {/* Direct Inline Renderer (Bypasses broken external files) */}
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-extrabold uppercase tracking-wider min-w-[90px] text-center select-none"
                          style={{
                            backgroundColor: styleConfig.bg,
                            color: styleConfig.text,
                            boxShadow: `0 4px 10px ${styleConfig.shadow}`,
                          }}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-[#8AA399]">
                        {payment.date}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="rounded-lg border border-[#00E676]/30 bg-[#00E676]/5 px-4 py-1.5 text-xs font-bold text-[#00E676] transition-all duration-200 hover:bg-[#00E676]/10 hover:border-[#00E676]"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="p-10 text-center text-[#8AA399] font-medium">
              No payment records found.
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}