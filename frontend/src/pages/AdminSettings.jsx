import React, { useState } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

export default function AdminSettings() {
  const { isDark, toggleTheme } = useTheme();

  const [platform, setPlatform] = useState({
    newRegistrations: true,
    autoVerifyReturningDrivers: false,
    maintenanceMode: false,
  });

  const [moderation, setModeration] = useState({
    autoEscalateComplaints: true,
    requireDocReviewBeforeDispatch: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: "IST",
    currency: "INR",
  });

  const handlePlatformToggle = (key) => {
    setPlatform((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModerationToggle = (key) => {
    setModeration((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSettings = () => {
    alert("Platform configurations saved successfully!");
  };

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
            checked ? "translate-x-6 bg-[#0A110E]" : "translate-x-0 bg-[#8AA399]"
          }`}
        />
      </button>
    );
  };

  return (
    <DashboardLayout
      title="Admin Settings"
      subtitle="Control platform-wide configuration, moderation rules, and access policies."
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Platform Access
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">New Registrations</p>
                <p className="text-xs text-[#8AA399]">Allow new buyers, shippers, drivers, and agencies to sign up.</p>
              </div>
              <ToggleSwitch
                checked={platform.newRegistrations}
                onChange={() => handlePlatformToggle("newRegistrations")}
                ariaLabel="Toggle New Registrations"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Verify Returning Drivers</p>
                <p className="text-xs text-[#8AA399]">Skip manual document review for drivers who were previously approved.</p>
              </div>
              <ToggleSwitch
                checked={platform.autoVerifyReturningDrivers}
                onChange={() => handlePlatformToggle("autoVerifyReturningDrivers")}
                ariaLabel="Toggle Auto-Verify Returning Drivers"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Maintenance Mode</p>
                <p className="text-xs text-[#8AA399]">Show a maintenance banner and pause new shipment/order matching platform-wide.</p>
              </div>
              <ToggleSwitch
                checked={platform.maintenanceMode}
                onChange={() => handlePlatformToggle("maintenanceMode")}
                ariaLabel="Toggle Maintenance Mode"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Moderation & Verification
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Auto-Escalate Open Complaints</p>
                <p className="text-xs text-[#8AA399]">Flag complaints left open for more than 48 hours for priority review.</p>
              </div>
              <ToggleSwitch
                checked={moderation.autoEscalateComplaints}
                onChange={() => handleModerationToggle("autoEscalateComplaints")}
                ariaLabel="Toggle Auto-Escalate Complaints"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">Require Document Review Before Dispatch</p>
                <p className="text-xs text-[#8AA399]">Block a vehicle from accepting shipments until its documents are admin-verified.</p>
              </div>
              <ToggleSwitch
                checked={moderation.requireDocReviewBeforeDispatch}
                onChange={() => handleModerationToggle("requireDocReviewBeforeDispatch")}
                ariaLabel="Toggle Require Document Review"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Security
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-[#8AA399]">Require a secondary sign-in step for all admin accounts.</p>
            </div>
            <ToggleSwitch
              checked={security.twoFactor}
              onChange={() => handleSecurityToggle("twoFactor")}
              ariaLabel="Toggle Two-Factor Authentication"
            />
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Regional Settings & Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={preferences.timezone}
                onChange={handlePreferenceChange}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                <option value="IST">India Standard Time (IST - UTC +5:30)</option>
                <option value="EST">Eastern Standard Time (EST - UTC -5:00)</option>
                <option value="GMT">Greenwich Mean Time (GMT - UTC +0:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Operating Currency
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
              <p className="text-xs text-[#8AA399]">Switch between bright daylight screen and dark-charcoal mode.</p>
            </div>
            <ToggleSwitch checked={isDark} onChange={toggleTheme} ariaLabel="Toggle Dark Theme" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
          >
            Save Admin Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}