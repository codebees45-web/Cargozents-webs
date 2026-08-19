import React, { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import { useTheme } from "../context/ThemeContext"; // 2 steps back to reach src/context

export default function DriverSettings() {
  // 1. Link to your global theme engine (stays synced with Landing, Buyer, & Agency)
  const { isDark, toggleTheme } = useTheme();

  // 2. Interactive state management for on-road logistics
  const [duty, setDuty] = useState({
    onDuty: true,        // Active Status (Accepting bookings)
    audioAlerts: true,    // Sound notifications for new loads
    autoNavigate: false,  // Auto-open map on accept
  });

  const [security, setSecurity] = useState({
    locationSharing: true, // GPS ping frequency
  });

  const [preferences, setPreferences] = useState({
    distanceUnit: "KM",   // KM or Miles
    language: "English",
  });

  const handleDutyToggle = (key) => {
    setDuty((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = () => {
    alert("Driver profile configurations saved successfully!");
  };

  // ==========================================
  // Premium Reusable Animated Toggle Switch
  // ==========================================
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
      title="Driver Settings"
      subtitle="Control your duty status, custom map navigation units, and road alerts."
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        
        {/* ==========================================
            SECTION 1: DUTY & ALERTS
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            On-Duty & Route Settings
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Active Duty Status</p>
                <p className="text-xs text-[#8AA399]">Toggle on to appear online and accept backhaul cargo matches.</p>
              </div>
              <ToggleSwitch
                checked={duty.onDuty}
                onChange={() => handleDutyToggle("onDuty")}
                ariaLabel="Toggle Active Duty Status"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Audio Load Alerts</p>
                <p className="text-xs text-[#8AA399]">Play a loud ringtone whenever a high-match route is offered.</p>
              </div>
              <ToggleSwitch
                checked={duty.audioAlerts}
                onChange={() => handleDutyToggle("audioAlerts")}
                ariaLabel="Toggle Audio Alerts"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Start Navigation</p>
                <p className="text-xs text-[#8AA399]">Instantly pull up maps right after accepting a cargo load.</p>
              </div>
              <ToggleSwitch
                checked={duty.autoNavigate}
                onChange={() => handleDutyToggle("autoNavigate")}
                ariaLabel="Toggle Auto-Start Navigation"
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            SECTION 2: TRACKING PRIVACY
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Location & Tracking
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Real-Time GPS Sync</p>
              <p className="text-xs text-[#8AA399]">Allow dispatchers and buyers to track your truck location during a job.</p>
            </div>
            <ToggleSwitch
              checked={security.locationSharing}
              onChange={() => handleSecurityToggle("locationSharing")}
              ariaLabel="Toggle Location Sharing"
            />
          </div>
        </div>

        {/* ==========================================
            SECTION 3: UNITS & APP THEME
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            System & Display Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Distance Metrics
              </label>
              <select
                name="distanceUnit"
                value={preferences.distanceUnit}
                onChange={handlePreferenceChange}
                className={`w-full rounded-lg border border-primary/10 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 text-primary cursor-pointer ${
                  isDark ? "bg-[#0c1411]" : "bg-white"
                }`}
              >
                <option value="KM" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Kilometers (km)</option>
                <option value="Miles" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Miles (mi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                System Language
              </label>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePreferenceChange}
                className={`w-full rounded-lg border border-primary/10 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 text-primary cursor-pointer ${
                  isDark ? "bg-[#0c1411]" : "bg-white"
                }`}
              >
                <option value="English" className={isDark ? "bg-[#0c1411]" : "bg-white"}>English</option>
                <option value="Hindi" className={isDark ? "bg-[#0c1411]" : "bg-white"}>हिन्दी (Hindi)</option>
                <option value="Tamil" className={isDark ? "bg-[#0c1411]" : "bg-white"}>தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            <div>
              <p className="text-sm font-bold text-primary">Night Mode</p>
              <p className="text-xs text-[#8AA399]">Switch to a dark-charcoal UI to prevent eye fatigue while driving at night.</p>
            </div>
            {/* 🟢 FULLY INTEGRATED DARK THEME TOGGLE */}
            <ToggleSwitch
              checked={isDark}
              onChange={toggleTheme}
              ariaLabel="Toggle Dark Theme"
            />
          </div>
        </div>

        {/* Action Button Container */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
          >
            Save Settings
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}