import React from 'react';
import { MapContainer, GeoJSON, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import indiaGeoData from '../../data/india.json';

const customPickupIcon = L.divIcon({
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
       <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #0A261D; position: absolute; top: -22px; white-space: nowrap;">PICKUP</div>
       <div style="position: absolute; top: 12px; left: 12px; transform: translate(-50%, -50%); width: 36px; height: 36px; background: rgba(0,200,83,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
       <div style="position: absolute; top: 12px; left: 12px; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #00C853; border-radius: 50%; box-shadow: 0 0 10px rgba(0,200,83,0.5); z-index: 3;"></div>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="#00C853" style="position: relative; z-index: 2; filter: drop-shadow(0 0 4px rgba(0,0,0,0.1));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5-1.12 2.5-2.5 2.5z"/></svg>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const customDropIcon = L.divIcon({
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
       <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #0A261D; position: absolute; top: -22px; white-space: nowrap;">DROP</div>
       <div style="position: absolute; top: 12px; left: 12px; transform: translate(-50%, -50%); width: 36px; height: 36px; background: rgba(0,200,83,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: 1s;"></div>
       <div style="position: absolute; top: 12px; left: 12px; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #00C853; border-radius: 50%; box-shadow: 0 0 10px rgba(0,200,83,0.5); z-index: 3;"></div>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="#00C853" style="position: relative; z-index: 2; filter: drop-shadow(0 0 4px rgba(0,0,0,0.1));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5-1.12 2.5-2.5 2.5z"/></svg>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const truckIcon = L.divIcon({
  html: `
    <div style="background: white; border: 2px solid #00C853; border-radius: 50%; padding: 4px; box-shadow: 0 0 12px rgba(0,200,83,0.3); animation: bounce-pulse 2s infinite ease-in-out;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C853" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
    </div>
  `,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const RouteDiagram = () => {
  const pickup = [28.6139, 77.2090]; // Delhi
  const drop = [13.0827, 80.2707]; // Chennai

  const outboundRoute = [
    [28.6139, 77.2090],
    [27.1767, 78.0081],
    [26.2183, 78.1828],
    [23.2599, 77.4126],
    [21.1458, 79.0882],
    [17.3850, 78.4867],
    [15.8281, 78.0373],
    [13.0827, 80.2707]
  ];

  const returnRoute = [
    [13.0827, 80.2707],
    [12.9716, 77.5946],
    [15.3173, 75.7139],
    [18.5204, 73.8567],
    [19.0760, 72.8777], // Truck location
    [21.1702, 72.8311],
    [23.0225, 72.5714],
    [24.5854, 73.7125],
    [26.9124, 75.7873],
    [28.6139, 77.2090]
  ];

  const currentTruckPos = [19.0760, 72.8777];

  return (
    <div className="w-full relative h-full bg-transparent overflow-visible">
       
       <MapContainer 
         center={[21.5, 79.5]} 
         zoom={4.2} 
         zoomControl={false} 
         dragging={false} 
         scrollWheelZoom={false}
         doubleClickZoom={false}
         className="w-full h-full z-10 relative"
         style={{ background: 'transparent' }}
       >
         {indiaGeoData && (
           <GeoJSON 
             data={indiaGeoData} 
             style={() => ({
               color: '#DCE7E1', // Subtle grey outline
               weight: 1.5,
               fillColor: '#FFFFFF', // Clean white landmass
               fillOpacity: 1,
             })}
           />
         )}
         
         {/* Glowing Outbound Route (Soft glow for light bg) */}
         <Polyline 
           positions={outboundRoute} 
           color="#00C853" 
           weight={4} 
           opacity={1}
           pathOptions={{ className: 'glowing-route', lineCap: 'round', lineJoin: 'round' }}
         />
         
         {/* Marching Ants Return Route */}
         <Polyline 
           positions={returnRoute} 
           color="#10B981" 
           weight={3}
           dashArray="8, 12"
           pathOptions={{ className: 'animate-marching-ants', lineCap: 'round', lineJoin: 'round' }}
         />
         
         <Marker position={pickup} icon={customPickupIcon} />
         <Marker position={drop} icon={customDropIcon} />
         <Marker position={currentTruckPos} icon={truckIcon} />
       </MapContainer>
       
       <style>{`
          @keyframes marching-ants {
            to { stroke-dashoffset: -40; }
          }
          @keyframes bounce-pulse {
            0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 0 12px rgba(0,200,83,0.3); }
            50% { transform: translateY(-3px) scale(1.05); box-shadow: 0 0 20px rgba(0,200,83,0.6); }
          }
          .animate-marching-ants {
            animation: marching-ants 1.5s linear infinite;
            filter: drop-shadow(0 0 4px rgba(52,211,153,0.3));
          }
          .glowing-route {
            filter: drop-shadow(0 0 6px rgba(0,200,83,0.4));
          }
          .leaflet-container {
            font-family: inherit;
            background: transparent !important;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
          .leaflet-pane {
             z-index: 10;
          }
       `}</style>
    </div>
  );
};

export default RouteDiagram;
