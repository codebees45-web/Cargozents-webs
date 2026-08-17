import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/common/DashboardLayout";
import { useTheme } from "../context/ThemeContext"; // 2 steps back to reach src/context
import { useAuth } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';

export default function DriverSettings() {
  // 1. Link to your global theme engine (stays synced with Landing, Buyer, & Agency)
  const { isDark, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();

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
    language: user?.preferredLanguage || "en",
  });

  useEffect(() => {
    if (user?.preferredLanguage) {
      setPreferences(p => ({ ...p, language: user.preferredLanguage }));
    }
  }, [user]);

  const handleDutyToggle = (key) => {
    setDuty((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
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
        preferredLanguage: preferences.language 
      });
      if (data.user && updateUser) {
         updateUser(data.user);
      }
      alert(t('driverSettings.saveSuccess'));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('driverSettings.saveError'));
    } finally {
      setLoading(false);
    }
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
      title={t('driverSettings.title')}
      subtitle={t('driverSettings.subtitle')}
    >
      <div className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
        
        {/* ==========================================
            SECTION 1: DUTY & ALERTS
            ========================================== */}
        <div className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            {t('driverSettings.onDutyTitle')}
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">{t('driverSettings.activeDuty')}</p>
                <p className="text-xs text-[#8AA399]">{t('driverSettings.activeDutyDesc')}</p>
              </div>
              <ToggleSwitch
                checked={duty.onDuty}
                onChange={() => handleDutyToggle("onDuty")}
                ariaLabel="Toggle Active Duty Status"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">{t('driverSettings.audioAlerts')}</p>
                <p className="text-xs text-[#8AA399]">{t('driverSettings.audioAlertsDesc')}</p>
              </div>
              <ToggleSwitch
                checked={duty.audioAlerts}
                onChange={() => handleDutyToggle("audioAlerts")}
                ariaLabel="Toggle Audio Alerts"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">{t('driverSettings.autoNavigate')}</p>
                <p className="text-xs text-[#8AA399]">{t('driverSettings.autoNavigateDesc')}</p>
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
            {t('driverSettings.trackingTitle')}
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{t('driverSettings.gpsSync')}</p>
              <p className="text-xs text-[#8AA399]">{t('driverSettings.gpsSyncDesc')}</p>
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
            {t('driverSettings.systemTitle')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                {t('driverSettings.distanceMetrics')}
              </label>
              <select
                name="distanceUnit"
                value={preferences.distanceUnit}
                onChange={handlePreferenceChange}
                className={`w-full rounded-lg border border-primary/10 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 text-primary cursor-pointer ${
                  isDark ? "bg-[#0c1411]" : "bg-white"
                }`}
              >
                <option value="KM" className={isDark ? "bg-[#0c1411]" : "bg-white"}>{t('driverSettings.kilometers')}</option>
                <option value="Miles" className={isDark ? "bg-[#0c1411]" : "bg-white"}>{t('driverSettings.miles')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                {t('driverSettings.systemLanguage')}
              </label>
              <select
                name="language"
                value={preferences.language}
                onChange={handlePreferenceChange}
                className={`w-full rounded-lg border border-primary/10 px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 text-primary cursor-pointer ${
                  isDark ? "bg-[#0c1411]" : "bg-white"
                }`}
              >
                <option value="en" className={isDark ? "bg-[#0c1411]" : "bg-white"}>English</option>
                <option value="hi" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Hindi (हिन्दी)</option>
                <option value="bn" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Bengali (বাংলা)</option>
                <option value="te" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Telugu (తెలుగు)</option>
                <option value="mr" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Marathi (मराठी)</option>
                <option value="ta" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Tamil (தமிழ்)</option>
                <option value="ur" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Urdu (اردو)</option>
                <option value="gu" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Gujarati (ગુજરાતી)</option>
                <option value="kn" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Kannada (ಕನ್ನಡ)</option>
                <option value="or" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Odia (ଓଡ଼ିଆ)</option>
                <option value="ml" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Malayalam (മലയാളം)</option>
                <option value="pa" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="as" className={isDark ? "bg-[#0c1411]" : "bg-white"}>Assamese (অসমীয়া)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            <div>
              <p className="text-sm font-bold text-primary">{t('driverSettings.nightMode')}</p>
              <p className="text-xs text-[#8AA399]">{t('driverSettings.nightModeDesc')}</p>
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
            disabled={loading}
            className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? t('driverSettings.saving') : t('driverSettings.saveSettings')}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}