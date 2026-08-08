const RouteDiagram = () => {
  return (
    <div className="w-full max-w-md">
      <svg viewBox="0 0 400 180" className="w-full h-auto" aria-hidden="true">
        {/* Outbound leg: pickup -> drop, always solid */}
        <line x1="40" y1="50" x2="360" y2="50" stroke="#10B981" strokeWidth="2" />
        <circle cx="40" cy="50" r="5" fill="#10B981" />
        <circle cx="360" cy="50" r="5" fill="#10B981" />
        <text x="40" y="30" fill="#5B7A70" fontSize="11" fontFamily="JetBrains Mono, monospace">
          PICKUP
        </text>
        <text x="322" y="30" fill="#5B7A70" fontSize="11" fontFamily="JetBrains Mono, monospace">
          DROP
        </text>

        {/* Truck driving the return leg, right to left — the empty leg
            picking up someone else's shipment on the way back. */}
        <g className="route-return-truck" transform="translate(346, 118)">
          <rect x="0" y="0" width="20" height="11" rx="2" fill="#1B4D3E" />
          <rect x="16" y="2" width="7" height="9" rx="1.5" fill="#1B4D3E" />
          <circle cx="5" cy="12" r="2.5" fill="#1B4D3E" />
          <circle cx="18" cy="12" r="2.5" fill="#1B4D3E" />
        </g>

        {/* Return leg: animates from dashed/grey (empty) to solid/cyan (matched) */}
        <line
          x1="360"
          y1="130"
          x2="40"
          y2="130"
          stroke="#C7D6CE"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="route-return-leg"
        />
        <circle cx="360" cy="130" r="5" fill="#00E676" />
        <circle cx="40" cy="130" r="5" fill="#00E676" />

        <line x1="40" y1="50" x2="40" y2="130" stroke="#DCE7E1" strokeWidth="1" />
        <line x1="360" y1="50" x2="360" y2="130" stroke="#DCE7E1" strokeWidth="1" />

        <text x="150" y="155" fill="#5B7A70" fontSize="11" fontFamily="JetBrains Mono, monospace">
          RETURN LEG
        </text>
      </svg>
    </div>
  );
};

export default RouteDiagram;
