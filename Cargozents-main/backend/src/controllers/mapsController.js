const axios = require("axios");

// Straight-line (haversine) distance in km — used as a last-resort fallback
// if the routing service is unreachable, so the booking flow never gets
// completely stuck just because an external API is down.
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

exports.getDistance = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (
      pickupLat == null ||
      pickupLng == null ||
      deliveryLat == null ||
      deliveryLng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup and delivery coordinates are required.",
      });
    }

    // Uses OSRM's free public routing API — no API key required, so
    // distance/duration keeps working even without a paid Google Maps key.
    // Falls back to a straight-line estimate if the routing service fails.
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${deliveryLng},${deliveryLat}?overview=false`;

      const response = await axios.get(osrmUrl, { timeout: 8000 });
      const route = response.data?.routes?.[0];

      if (!route) {
        throw new Error("No route found");
      }

      const distanceKm = route.distance / 1000;
      const durationSec = route.duration;

      return res.json({
        success: true,
        distance: distanceKm,
        distanceText: `${distanceKm.toFixed(1)} km`,
        duration: durationSec,
        durationText: formatDuration(durationSec),
      });
    } catch (routingErr) {
      console.warn("OSRM routing failed, falling back to straight-line distance:", routingErr.message);

      const distanceKm = haversineDistanceKm(pickupLat, pickupLng, deliveryLat, deliveryLng);
      // Rough estimate: straight-line * 1.3 road-factor, at an assumed 40 km/h average.
      const adjustedKm = distanceKm * 1.3;
      const durationSec = (adjustedKm / 40) * 3600;

      return res.json({
        success: true,
        distance: adjustedKm,
        distanceText: `${adjustedKm.toFixed(1)} km (estimated)`,
        duration: durationSec,
        durationText: formatDuration(durationSec),
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};