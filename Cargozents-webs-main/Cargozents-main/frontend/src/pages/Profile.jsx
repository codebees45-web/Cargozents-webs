import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; // Pulling live user context[cite: 2]

export default function Profile() {
  const { isDark } = useTheme();
  const { user } = useAuth(); // Live logged-in user context object[cite: 2]

  // Initialize with empty strings so it stays clean before the context loads
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "" 
  });

  // Keep state perfectly synchronized with whoever logs in dynamically
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || user.fullName || "User",
        phone: user.phone || "",
        email: user.email || "",
        // Dynamically extract the role from the token/session instead of hardcoding DRIVER
        role: user.role ? user.role.toUpperCase() : "USER"
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert("Profile changes saved successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12 mt-4">
      <p className={`text-sm mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Manage your personal details and account security.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: AVATAR CARD */}
        <div className={`rounded-xl border p-6 text-center flex flex-col items-center justify-center min-h-[300px] transition-colors duration-200 ${
          isDark 
            ? "border-primary/10 bg-[#0A1811] text-white" 
            : "border-gray-200 bg-white text-gray-900 shadow-sm"
        }`}>
          <div className="w-24 h-24 rounded-full border-2 border-[#00E676] flex items-center justify-center bg-transparent mb-4">
            <span className="text-3xl font-bold text-[#00E676]">
              {profile.fullName ? profile.fullName[0].toUpperCase() : "U"}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">{profile.fullName}</h2>
          
          {/* DYNAMIC ROLE BADGE */}
          {profile.role && (
            <span className="mt-2 px-3 py-1 text-xs font-bold tracking-wider rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 uppercase">
              {profile.role}
            </span>
          )}

          <div className="mt-6 w-full px-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Logged in as</p>
            <p className="text-xs font-mono text-[#00E676] break-all max-w-full px-2">
              {profile.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT DETAILS FORM */}
        <div className={`md:col-span-2 rounded-xl border p-6 flex flex-col justify-between transition-colors duration-200 ${
          isDark 
            ? "border-primary/10 bg-[#0A1811]" 
            : "border-gray-200 bg-white shadow-sm"
        }`}>
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div>
              <h3 className={`text-md font-bold tracking-tight border-b pb-3 ${
                isDark ? "text-white border-primary/10" : "text-gray-900 border-gray-100"
              }`}>
                Account Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 ${
                    isDark 
                      ? "border-primary/10 bg-[#050c08] text-white" 
                      : "border-gray-300 bg-gray-50 text-gray-900"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none transition-colors duration-200 ${
                    isDark 
                      ? "border-primary/10 bg-[#050c08] text-white" 
                      : "border-gray-300 bg-gray-50 text-gray-900"
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Registered Email (Cannot Be Changed)
              </label>
              <input
                type="email"
                readOnly
                disabled
                value={profile.email}
                className={`w-full rounded-lg border px-4 py-3 text-sm cursor-not-allowed opacity-75 transition-colors duration-200 ${
                  isDark 
                    ? "border-primary/10 bg-[#050c08]/50 text-gray-400" 
                    : "border-gray-200 bg-gray-100 text-gray-500"
                }`}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="rounded-lg bg-[#00E676] px-8 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}