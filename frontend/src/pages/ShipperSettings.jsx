import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/common/DashboardLayout"; // Restored layout wrapper
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';

export default function ShipperSettings() {
  // 1. Hook into your shared application theme engine
  const { isDark, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();

  // 2. Interactive state management mirroring your dashboard modules
  const [settings, setSettings] = useState({
    milestoneAlerts: true,
    erpSync: false,
    weightUnit: "Metric",
    currency: "INR",
    language: user?.preferredLanguage || "en",
  });

  useEffect(() => {
    if (user?.preferredLanguage) {
      setSettings(p => ({ ...p, language: user.preferredLanguage }));
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    if (name === "language") {
      i18n.changeLanguage(value);
      document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { updateProfile } = await import('../services/authService');
      const { data } = await updateProfile(user._id || user.id, { 
        preferredLanguage: settings.language 
      });
      if (data.user && updateUser) {
         updateUser(data.user);
      }
      alert(t('shipperSettings.saveSuccess'));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
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
      title={t('shipperSettings.title')}
      subtitle={t('shipperSettings.subtitle')}
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
                {t('shipperSettings.milestoneAlertsTitle')}
              </p>
              <p className="text-xs text-[#8AA399]">
                {t('shipperSettings.milestoneAlertsDesc')}
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
            {t('shipperSettings.integrationTitle')}
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {t('shipperSettings.erpSync')}
              </p>
              <p className="text-xs text-[#8AA399]">
                {t('shipperSettings.erpSyncDesc')}
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
            {t('shipperSettings.platformTitle')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                {t('shipperSettings.weightUnit')}
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
                <option value="Metric">{t('shipperSettings.metric')}</option>
                <option value="Imperial">{t('shipperSettings.imperial')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                {t('shipperSettings.currency')}
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
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                {t('driverSettings.systemLanguage')}
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 cursor-pointer ${
                  isDark 
                    ? "border-primary/10 bg-[#0c1411] text-white" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="ur">Urdu (اردو)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="or">Odia (ଓଡ଼ିଆ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="as">Assamese (অসমীয়া)</option>
              </select>
            </div>
          </div>

          <div className={`flex items-center justify-between pt-4 border-t ${
            isDark ? "border-primary/10" : "border-gray-100"
          }`}>
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {t('shipperSettings.darkMode')}
              </p>
              <p className="text-xs text-[#8AA399]">
                {t('shipperSettings.darkModeDesc')}
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
            disabled={loading}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? t('driverSettings.saving') : t('shipperSettings.saveSettings')}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}