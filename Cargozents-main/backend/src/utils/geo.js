const EARTH_RADIUS_KM = 6371;

/**
 * Great-circle distance between two [lng, lat] points, in kilometers.
 * This is a straight-line approximation (no road network), used as the
 * basis for pricing and matching until a real routing provider (Google
 * Distance Matrix / Mappls) is wired in on the frontend for turn-by-turn
 * ETAs. A 1.3x road-factor is applied by callers where a realistic
 * driving distance is needed.
 */
const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

// Straight-line distance tends to undercount actual road distance;
// 1.3x is a reasonable general-purpose correction for Indian highway/state
// road routing until real routing data replaces it.
const ROAD_FACTOR = 1.3;
const roadDistanceKm = (a, b) => haversineKm(a, b) * ROAD_FACTOR;

module.exports = { haversineKm, roadDistanceKm };
