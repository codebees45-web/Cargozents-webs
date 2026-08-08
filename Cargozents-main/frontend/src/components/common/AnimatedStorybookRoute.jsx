/**
 * AnimatedStorybookRoute
 * The branded truck drives a winding path through 4 numbered, titled stops,
 * pausing at each one as its badge lights up from gray to primary green.
 * The traveled portion of the road fills in solid green behind the truck.
 */
const STOPS = [
  { x: 70, y: 60, title: 'THE WAREHOUSE', subtitle: 'Journey begins', keyTimes: '0;0.02;0.08;1' },
  { x: 90, y: 220, title: 'VILLAGE STOP', subtitle: 'Small parcel drop', keyTimes: '0;0.26;0.32;1' },
  { x: 210, y: 400, title: 'CANYON PASS', subtitle: 'Tough terrain', keyTimes: '0;0.5;0.56;1' },
  { x: 130, y: 560, title: 'PORT ARRIVAL', subtitle: 'Delivered safely', keyTimes: '0;0.74;0.8;1' },
];

const ROAD_D = 'M70,60 Q220,90 90,220 Q-40,330 210,400 Q340,440 130,560 Q20,620 100,700';

const StopIcon = ({ index }) => {
  switch (index) {
    case 0:
      return (
        <>
          <rect x="-9" y="-27" width="18" height="12" fill="#1B2321" />
          <rect x="-11" y="-16" width="22" height="4" fill="#1B2321" />
        </>
      );
    case 1:
      return (
        <>
          <rect x="-14" y="-8" width="10" height="12" fill="#00E676" />
          <polygon points="-14,-8 -9,-16 -4,-8" fill="#00E676" />
          <rect x="4" y="-12" width="10" height="16" fill="#00E676" />
          <polygon points="4,-12 9,-19 14,-12" fill="#00E676" />
        </>
      );
    case 2:
  return (
    <path
      d="M-16,-4 L-9,-20 L-2,-8 L5,-22 L16,-4"
      stroke="#5B7A70"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
    case 3:
      return (
        <>
          <rect x="-16" y="-8" width="9" height="18" fill="#5B7A70" />
          <rect x="-2" y="-16" width="9" height="26" fill="#5B7A70" />
          <rect x="12" y="-4" width="9" height="14" fill="#5B7A70" />
        </>
      );
    default:
      return null;
  }
};

const AnimatedStorybookRoute = () => (
 <svg viewBox="0 0 380 780" className="h-[620px] w-auto sm:h-[760px]">
    {/* faint dashed full route, always visible */}
    <path
      id="storybook-road"
      d={ROAD_D}
      fill="none"
      stroke="#1B4D3E"
      strokeWidth="2"
      strokeDasharray="1 10"
      opacity="0.28"
    />

    {/* solid green trail revealing itself in sync with the truck's progress */}
    <path
      d={ROAD_D}
      fill="none"
      stroke="#00E676"
      strokeWidth="3"
      strokeLinecap="round"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset="1"
    >
      <animate
        attributeName="stroke-dashoffset"
        values="1;1;0.92;0.68;0.68;0.5;0.44;0.2;0.2;0.02;0;0"
        keyTimes="0;0.02;0.08;0.26;0.32;0.5;0.56;0.74;0.8;0.98;1;1"
        dur="8s"
        repeatCount="indefinite"
      />
    </path>

    {STOPS.map((stop, i) => (
      <g key={stop.title}>
        <g transform={`translate(${stop.x},${stop.y})`}>
          <circle r="15" fill="#B4B2A9">
            <animate
              attributeName="fill"
              values="#B4B2A9;#B4B2A9;#1B4D3E;#1B4D3E"
              keyTimes={stop.keyTimes}
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
          <text y="5" textAnchor="middle" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#FFFFFF">
            {i + 1}
          </text>
          <StopIcon index={i} />
        </g>
        <text x={stop.x + 35} y={stop.y - 5} fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#1B4D3E">
          {stop.title}
        </text>
        <text x={stop.x + 35} y={stop.y + 12} fontFamily="monospace" fontSize="11" fill="#5B7A70">
          {stop.subtitle}
        </text>
      </g>
    ))}

    {/* truck — bigger, detailed version, stays level, drives the route */}
    <g transform="translate(-30,-20) scale(1.35)">
      <circle cx="6" cy="30" r="3" fill="#1B4D3E" opacity="0.2">
        <animate attributeName="r" values="1;5" dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="6" cy="30" r="3" fill="#1B4D3E" opacity="0.2">
        <animate attributeName="r" values="1;5" dur="1s" begin="0.35s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="1s" begin="0.35s" repeatCount="indefinite" />
      </circle>
      <rect x="10" y="12" width="62" height="30" rx="4" fill="#1B4D3E" />
      <rect x="16" y="18" width="50" height="4" rx="2" fill="#00E676" opacity="0.7" />
      <rect x="16" y="26" width="50" height="4" rx="2" fill="#00E676" opacity="0.4" />
      <path d="M74 24 H98 a5 5 0 0 1 5 5 v9 a4 4 0 0 1 -4 4 H74 Z" fill="#1B4D3E" />
      <path d="M79 27 H93 a4 4 0 0 1 4 4 v3 H79 Z" fill="#EEF4F1" />
      <rect x="98" y="36" width="5" height="5" rx="1" fill="#00E676" />
      <rect x="8" y="42" width="96" height="3" rx="1.5" fill="#1B4D3E" opacity="0.7" />
      <g><circle cx="24" cy="46" r="7" fill="#1B2321" /><circle cx="24" cy="46" r="3" fill="#EEF4F1" /></g>
      <g><circle cx="56" cy="46" r="7" fill="#1B2321" /><circle cx="56" cy="46" r="3" fill="#EEF4F1" /></g>
      <g><circle cx="90" cy="46" r="7" fill="#1B2321" /><circle cx="90" cy="46" r="3" fill="#EEF4F1" /></g>

      <animateMotion
        dur="8s"
        repeatCount="indefinite"
        keyPoints="0;0;0.08;0.26;0.32;0.5;0.56;0.74;0.8;0.98;1;1"
        keyTimes="0;0.02;0.08;0.26;0.32;0.5;0.56;0.74;0.8;0.98;1;1"
      >
        <mpath href="#storybook-road" />
      </animateMotion>
    </g>

    <g transform="translate(100,700)">
      <circle r="10" fill="#00E676" />
      <path d="M-4,0 L-1,3 L5,-4" stroke="#1B4D3E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <text x="118" y="705" fontFamily="monospace" fontSize="12" fill="#5B7A70">
      Route complete
    </text>
  </svg>
);

export default AnimatedStorybookRoute;