import React, { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useTheme } from "../../context/ThemeContext"; // Go back two steps to reach context

export default function Settings() {
  // 1. Hook up our global theme engine (instant updates & saves choices)
  const { isDark, toggleTheme } = useTheme();

  // 2. Setup dynamic states for other switches so they are fully interactive
  const [notifications, setNotifications] = useState({
    sms: false,
    push: true, // Defaulting push to true for premium feel
    marketing: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const [preferences, setPreferences] = useState({
    language: "English",
    currency: "INR",
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
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
              ? "translate-x-6 bg-[#0A110E]" // Dark knob when active on green background
              : "translate-x-0 bg-[#8AA399]"  // Grey knob when inactive
          }`}
        />
      </button>
    );
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Configure your platform preferences, security levels, and custom notifications."
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        
        {/* ==========================================
            SECTION 1: NOTIFICATIONS
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Notifications
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">SMS Notifications</p>
                <p className="text-xs text-[#8AA399]">Receive quick SMS alerts about package statuses.</p>
              </div>
              <ToggleSwitch
                checked={notifications.sms}
                onChange={() => handleNotificationToggle("sms")}
                ariaLabel="Toggle SMS Notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Push Notifications</p>
                <p className="text-xs text-[#8AA399]">Get browser push notifications in real-time.</p>
              </div>
              <ToggleSwitch
                checked={notifications.push}
                onChange={() => handleNotificationToggle("push")}
                ariaLabel="Toggle Push Notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Marketing Emails</p>
                <p className="text-xs text-[#8AA399]">Stay updated on system offers and logistics news.</p>
              </div>
              <ToggleSwitch
                checked={notifications.marketing}
                onChange={() => handleNotificationToggle("marketing")}
                ariaLabel="Toggle Marketing Emails"
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            SECTION 2: SECURITY
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Security
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Enable Two-Factor Authentication</p>
              <p className="text-xs text-[#8AA399]">Secure your account transactions with 2FA protection.</p>
            </div>
            <ToggleSwitch
              checked={security.twoFactor}
              onChange={() => handleSecurityToggle("twoFactor")}
              ariaLabel="Toggle Two-Factor Authentication"
            />
          </div>
        </div>

        {/* ==========================================
            SECTION 3: PREFERENCES (LANGUAGE, CURRENCY & DARK MODE)
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Language
              </label>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="Hindi">हिन्दी</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={preferences.currency}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            <div>
              <p className="text-sm font-bold text-primary">Dark Mode</p>
              <p className="text-xs text-[#8AA399]">Switch between bright screen and cozy low-lit modes.</p>
            </div>
            {/* 🟢 THIS NOW CALLS THE GLOBAL THEME TOGGLE FUNCTION */}
            <ToggleSwitch
              checked={isDark}
              onChange={toggleTheme}
              ariaLabel="Toggle Dark Theme"
            />
          </div>
        </div>

        {/* Save Changes Button Container */}
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