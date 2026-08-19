import React from "react";
import { useTheme } from "../../context/ThemeContext"; // Adjust relative path to your context folder

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`global-toggle ${isDark ? "toggle-on" : "toggle-off"} ${className}`}
      aria-label="Toggle Dark Mode"
    >
      <span className="global-toggle-knob" />
    </button>
  );
}