import React, { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout"; // Restored layout wrapper
import { useTheme } from "../context/ThemeContext";

export default function ShipperSettings() {
  // 1. Hook into your shared application theme engine
  const { isDark, toggleTheme } = useTheme();

  // 2. Interactive state management mirroring your dashboard modules
  const [settings, setSettings] = useState({
    milestoneAlerts: true,
    erpSync: false,
    weightUnit: "Metric",
    currency: "INR",
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    alert("Shipper settings saved successfully!");
  };

  // Premium Reusable Animated Toggle Switch
  const ToggleSwitch = ({ checked, onChange, ariaLabel }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        aria-label={ariaLabel}
        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
          checked 
            ? "bg-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.25)]" 
            : "bg-primary/10 border border-primary/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-300 ease-in-out ${
            checked 
              ? "translate-x-6 bg-[#0A110E]" // Matte dark knob when active
              : "translate-x-0 bg-[#8AA399]"  // Grey knob when inactive
          }`}
        />
      </button>
    );
  };

  return (
    <DashboardLayout
      title="Shipper Settings"
      subtitle="Control your system preferences, API integrations, and display adjustments."
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        
        {/* ==========================================
            SECTION 1: MILESTONE ALERTS
            ========================================== */}
        <div className={`rounded-xl border p-6 shadow-sm transition-colors duration-200 ${
          isDark ? "border-primary/10 bg-[#0A1811]" : "border-gray-200 bg-white"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Milestone Alerts
              </p>
              <p className="text-xs text-[#8AA399]">
                Send real-time alerts whenever custom checks, pickups, or deliveries happen.
              </p>
            </div>
            <ToggleSwitch
              checked={settings.milestoneAlerts}
              onChange={() => handleToggle("milestoneAlerts")}
              ariaLabel="Toggle Milestone Alerts"
            />
          </div>
        </div>

        {/* ==========================================
            SECTION 2: INTEGRATION & SECURITY
            ========================================== */}
        <div className={`rounded-xl border p-6 shadow-sm transition-colors duration-200 ${
          isDark ? "border-primary/10 bg-[#0A1811]" : "border-gray-200 bg-white"
        }`}>
          <h3 className={`text-md font-bold mb-5 tracking-tight border-b pb-3 ${
            isDark ? "text-white border-primary/10" : "text-gray-900 border-gray-100"
          }`}>
            Integration & Security
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                External ERP API Sync
              </p>
              <p className="text-xs text-[#8AA399]">
                Restrict third-party software from fetching invoice and tracking data logs.
              </p>
            </div>
            <ToggleSwitch
              checked={settings.erpSync}
              onChange={() => handleToggle("erpSync")}
              ariaLabel="Toggle External ERP API Sync"
            />
          </div>
        </div>

        {/* ==========================================
            SECTION 3: UNITS, CURRENCY & THEME
            ========================================== */}
        <div className={`rounded-xl border p-6 shadow-sm transition-colors duration-200 ${
          isDark ? "border-primary/10 bg-[#0A1811]" : "border-gray-200 bg-white"
        }`}>
          <h3 className={`text-md font-bold mb-5 tracking-tight border-b pb-3 ${
            isDark ? "text-white border-primary/10" : "text-gray-900 border-gray-100"
          }`}>
            Platform Display Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Logistics Weight & Volume Units
              </label>
              <select
                name="weightUnit"
                value={settings.weightUnit}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 cursor-pointer ${
                  isDark 
                    ? "border-primary/10 bg-[#0c1411] text-white" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="Metric">Metric System (KG, Tons, m³)</option>
                <option value="Imperial">Imperial System (Lbs, Short Tons, ft³)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Settlement Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 cursor-pointer ${
                  isDark 
                    ? "border-primary/10 bg-[#0c1411] text-white" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className={`flex items-center justify-between pt-4 border-t ${
            isDark ? "border-primary/10" : "border-gray-100"
          }`}>
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Dark Mode
              </p>
              <p className="text-xs text-[#8AA399]">
                Switch between standard light screen and cozy dark-room dashboard mode.
              </p>
            </div>
            <ToggleSwitch
              checked={isDark}
              onChange={toggleTheme}
              ariaLabel="Toggle Dark Mode"
            />
          </div>
        </div>

        {/* Action Button Container */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
          >
            Save Shipper Settings
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}