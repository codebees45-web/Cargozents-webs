import React, { useState } from "react";
import ThemeToggle from '../../components/common/ThemeToggle';
import { useTheme } from "../../context/ThemeContext";

// 1. Inline ToggleSwitch Component (since the file is missing from your folders)
const ToggleSwitch = ({ checked, onChange, ariaLabel }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input 
      type="checkbox" 
      className="sr-only peer" 
      checked={checked} 
      onChange={onChange} 
      aria-label={ariaLabel} 
    />
    <div className="w-11 h-6 bg-secondary/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondary/20 after:border-primary/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
  </label>
);

// 2. Renamed component from AgencySupport to AgencySettings
export default function AgencySettings() {
  // --- ADDED: Missing state for your settings toggles ---
  const [operations, setOperations] = useState({
    autoAssign: false,
  });

  // --- ADDED: Missing handler for the toggle switch ---
  const handleOperationToggle = (key) => {
    setOperations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Support Form State (Kept from your original code)
  const [form, setForm] = useState({
    subject: '',
    category: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setForm({ subject: '', category: 'General Inquiry', message: '' });
    }, 1200);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-xl font-bold text-primary">Agency Settings</h1>
        <p className="mt-1 text-sm text-[#5B7A70]">
          Manage configurations, automatic assignments, dispatch rules, and preferences.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Dispatch & Operations
          </h3>
          <div className="space-y-6">
            
            {/* Toggle Switch Section */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Assign Drivers</p>
                <p className="text-xs text-[#5B7A70]">Automatically match orders to the nearest free fleet vehicle.</p>
              </div>
              <ToggleSwitch
                checked={operations.autoAssign}
                onChange={() => handleOperationToggle("autoAssign")}
                ariaLabel="Toggle Auto-Assign Drivers"
              />
            </div>

            {/* Support Form Section */}
            <div>
              <label className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-2.5 text-sm rounded-lg border border-primary/20 text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition bg-secondary/20"
                >
                  <option value="General Inquiry" className="bg-background text-primary">General Inquiry</option>
                  <option value="Fleet Tracking" className="bg-background text-primary">Fleet Tracking Issues</option>
                  <option value="Payments" className="bg-background text-primary">Payments & Billing</option>
                  <option value="App Bug" className="bg-background text-primary">Report a Bug</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">Message / Details</label>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Describe your problem in detail..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-primary/20 text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition bg-secondary/20 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary hover:opacity-90 text-[#0A110E] text-xs font-bold rounded-lg transition-all shadow-glow disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-secondary/20 rounded-xl border border-primary/10 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Direct Contact</h3>
            <p className="text-xs text-[#5B7A70] leading-relaxed mb-4">Need urgent operational tracking support regarding an active vehicle dispatch?</p>
            <div className="text-xs font-medium text-primary space-y-2 font-mono">
              <div className="flex items-center gap-2"><span>📞</span> +91 99401 79070</div>
              <div className="flex items-center gap-2"><span>✉️</span> support@cargozents.com</div>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-xl border border-primary/5 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-3">Response Time</h3>
            <p className="text-xs text-[#5B7A70] leading-relaxed">
              Standard operational tickets are assigned within <span className="font-semibold text-primary">15-30 minutes</span>. Urgent backhaul assignment updates are handled live via line dispatch.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}