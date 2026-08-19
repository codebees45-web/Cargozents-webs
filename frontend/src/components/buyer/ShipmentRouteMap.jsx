import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import useTracking from "../../hooks/useTracking";

// Leaflet's default marker icons break when bundled (Vite can't resolve
// the image paths the library expects), so we rebuild them from CDN URLs.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = L.divIcon({
  className: "",
  html: '<div style="background:#1B4D3E;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #1B4D3E;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const deliveryIcon = L.divIcon({
  className: "",
  html: '<div style="background:#EF4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #EF4444;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const truckIcon = L.divIcon({
  className: "",
  html: '<div style="background:#00E676;width:22px;height:22px;border-radius:50%;border:3px solid #1B4D3E;display:flex;align-items:center;justify-content:center;font-size:12px;">🚚</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Refits the map to the current set of points whenever they change, so the
// route stays framed as the driver moves or the addresses change.
const FitBounds = ({ points }) => {
  const map = useMap();
  useMemo(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
};

/**
 * Shows pickup, delivery, and (if available) the live driver position on a
 * free OpenStreetMap/Leaflet map — no API key required. This replaces the
 * previous Google Maps-based implementation, which required a paid
 * VITE_GOOGLE_MAPS_API_KEY that was never configured and so never rendered.
 *
 * pickup / delivery: { lat, lng }
 * orderId: optional — enables live driver-location tracking via socket
 */
export default function ShipmentRouteMap({ pickup, delivery, orderId }) {
  const driverLocation = useTracking(orderId);

  if (!pickup || !delivery) return null;

  const pickupLatLng = [pickup.lat, pickup.lng];
  const deliveryLatLng = [delivery.lat, delivery.lng];
  const driverLatLng = driverLocation ? [driverLocation.lat, driverLocation.lng] : null;

  const points = [pickupLatLng, deliveryLatLng, driverLatLng].filter(Boolean);

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl border border-primary/10">
      <MapContainer center={pickupLatLng} zoom={7} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        <Marker position={pickupLatLng} icon={pickupIcon}>
          <Popup>Pickup</Popup>
        </Marker>

        <Marker position={deliveryLatLng} icon={deliveryIcon}>
          <Popup>Delivery</Popup>
        </Marker>

        <Polyline
          positions={[pickupLatLng, deliveryLatLng]}
          pathOptions={{ color: "#1B4D3E", weight: 3, dashArray: "6 8" }}
        />

        {driverLatLng && (
          <Marker position={driverLatLng} icon={truckIcon}>
            <Popup>Driver location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}