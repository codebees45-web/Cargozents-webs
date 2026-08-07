import React, { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

export default function DriverSupport() {
  const [formData, setFormData] = useState({ subject: '', category: 'Active Trip Emergency', priority: 'High', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false); // 🟢 Changed to showModal

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true); // 🟢 Show the centered popup
      setFormData({ subject: '', category: 'Active Trip Emergency', priority: 'High', message: '' });
    }, 1200);
  };

  return (
    <DashboardLayout title="Driver Support" subtitle="Get help with active trips, payments, or report an issue.">
      <div className="max-w-4xl pb-10 relative">
        
        {/* 🟢 NEW CENTERED POPUP MODAL */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-secondary/10 rounded-xl border border-primary/10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Subject</label>
                <input type="text" name="subject" required value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary" placeholder="e.g. Tire blowout on NH-44" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                    <option value="Active Trip Emergency">Active Trip Emergency</option>
                    <option value="Payment & Wallet Issue">Payment & Wallet Issue</option>
                    <option value="App/Technical Issue">App/Technical Issue</option>
                    <option value="Document Verification">Document Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary">
                    <option value="High">High (Urgent)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">Message</label>
                <textarea name="message" required rows="4" value={formData.message} onChange={handleInputChange} className="w-full px-4 py-3 text-sm rounded-lg border border-primary/10 focus:outline-none focus:border-accent bg-background text-primary resize-none" placeholder="Provide details, order IDs, or vehicle location..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary hover:bg-primary/95 text-secondary font-bold rounded-lg transition-all text-sm shadow-sm">
                {isSubmitting ? 'Sending...' : 'Submit to Dispatch'}
              </button>
            </form>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 h-fit">
            <h3 className="font-bold text-primary text-sm mb-3">24/7 Dispatch Hotline</h3>
            <p className="text-xs text-[#5B7A70] leading-relaxed mb-4">
              For emergencies on an active load or immediate breakdown assistance, call operations directly.
            </p>
            <a href="tel:+918005550000" className="flex items-center justify-center w-full py-2.5 bg-primary text-secondary text-xs font-bold rounded-lg shadow-sm">
              📞 +91 800-555-0000
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}