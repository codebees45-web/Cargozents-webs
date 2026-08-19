import React from "react";

const statusConfig = {
  Pending: {
    bg: "#FF9100",      // Decent Orange
    text: "#FFFFFF",    // White text
    shadow: "rgba(255, 145, 0, 0.25)",
  },
  Accepted: {
    bg: "#00B0FF",      // High-visibility Blue
    text: "#FFFFFF",    // White text
    shadow: "rgba(0, 176, 255, 0.25)",
  },
  "Driver Assigned": {
    bg: "#00B0FF",
    text: "#FFFFFF",
    shadow: "rgba(0, 176, 255, 0.25)",
  },
  "In Transit": {
    bg: "#00B0FF",
    text: "#FFFFFF",
    shadow: "rgba(0, 176, 255, 0.25)",
  },
  Delivered: {
    bg: "#00E676",      // Light Bright Green
    text: "#FFFFFF",    // White text
    shadow: "rgba(0, 230, 118, 0.25)",
  },
  Cancelled: {
    bg: "#FF3D00",      // Crimson Red
    text: "#FFFFFF",    // White text
    shadow: "rgba(255, 61, 0, 0.25)",
  },
  Failed: {
    bg: "#FF3D00",      // Crimson Red
    text: "#FFFFFF",    // White text
    shadow: "rgba(255, 61, 0, 0.25)",
  },
  Success: {
    bg: "#00E676",      // Light Bright Green
    text: "#FFFFFF",    // White text
    shadow: "rgba(0, 230, 118, 0.25)",
  },
};

export default function StatusBadge({ status, className = "" }) {
  // Grab configuration or use a dark gray fallback if status doesn't match
  const config = statusConfig[status] || {
    bg: "#4B5563",
    text: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.1)",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-md
        px-3
        py-1
        text-xs
        font-extrabold
        uppercase
        tracking-wider
        min-w-[90px]
        text-center
        select-none
        ${className}
      `}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        boxShadow: `0 4px 10px ${config.shadow}`,
      }}
    >
      {status}
    </span>
  );
}