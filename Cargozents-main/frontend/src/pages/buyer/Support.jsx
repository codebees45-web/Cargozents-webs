import React, { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

export default function Support() {
  const [ticket, setTicket] = useState({
    category: "",
    priority: "Medium",
    orderId: "",
    subject: "",
    description: "",
  });

  const [tickets, setTickets] = useState([
    {
      id: "TKT-1001",
      subject: "Shipment Delay",
      status: "Open",
      createdAt: "20 Jul 2026",
    },
    {
      id: "TKT-1002",
      subject: "Payment Issue",
      status: "Resolved",
      createdAt: "18 Jul 2026",
    },
  ]);

  const [showModal, setShowModal] = useState(false); // 🟢 Added modal state

  const handleChange = (e) => {
    setTicket({
      ...ticket,
      [e.target.name]: e.target.value,
    });
  };

  const submitTicket = (e) => {
    e.preventDefault();

    if (!ticket.category || !ticket.subject || !ticket.description) {
      alert("Please fill in category, subject and description.");
      return;
    }

    const newTicket = {
      id: `TKT-${1000 + tickets.length + 1}`,
      subject: ticket.subject,
      status: "Open",
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setTickets((prev) => [newTicket, ...prev]);

    setTicket({
      category: "",
      priority: "Medium",
      orderId: "",
      subject: "",
      description: "",
    });

    // 🟢 Show the modal instead of the browser alert
    setShowModal(true);
  };

  const statusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-success/10 text-success";
      case "Closed":
        return "bg-primary/10 text-primary";
      default:
        return "bg-warning/10 text-warning";
    }
  };

  return (
    <DashboardLayout
      title="Support Center"
      subtitle="Raise a support request or track existing tickets."
    >
      <div className="relative">
        
        {/* 🟢 CENTERED POPUP MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 mb-5">
                <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-primary mb-2">Ticket Booked!</h3>
              <p className="text-sm text-[#5B7A70] mb-8 leading-relaxed">
                Your ticket is booked. We will take action soon.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-secondary transition-all hover:bg-primary/90 shadow-md"
              >
                Okay
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 pb-10">
          {/* Create Ticket */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-primary/10 shadow-sm p-8">
            <h2 className="text-xl font-semibold text-primary">
              Create Support Ticket
            </h2>
            <form onSubmit={submitTicket} className="mt-6 space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={ticket.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary/10 px-4 py-3 focus:outline-none focus:border-accent"
                >
                  <option value="">Select Category</option>
                  <option>Shipment Delay</option>
                  <option>Payment Issue</option>
                  <option>Driver Complaint</option>
                  <option>Damaged Goods</option>
                  <option>Refund Request</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Order ID</label>
                <input
                  type="text"
                  name="orderId"
                  value={ticket.orderId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary/10 px-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={ticket.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary/10 px-4 py-3 focus:outline-none focus:border-accent"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary/10 px-4 py-3 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  rows="5"
                  name="description"
                  value={ticket.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary/10 px-4 py-3 resize-none focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 transition-all font-bold shadow-sm"
              >
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-primary">
              Recent Tickets
            </h2>
            <div className="mt-6 space-y-4">
              {tickets.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-primary/10 p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-sm">{item.id}</strong>
                    <span
                      className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {item.subject}
                  </p>
                  <p className="mt-1 text-xs text-[#5B7A70]">
                    {item.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}