// Turns a Vehicle's raw location fields (currentLocation, locationUpdatedAt,
// isSharingLocation, locationSource — see backend/src/models/Vehicle.js)
// into a single human-readable badge: { text, tone }.
//
// `tone` is a Tailwind text-color utility class meant to be interpolated
// straight into a className, e.g. `<span className={freshness.tone}>`.

const LIVE_WINDOW_MS = 2 * 60 * 1000; // still counts as "live"
const STALE_WINDOW_MS = 10 * 60 * 1000; // beyond this, call it stale

const isRealPoint = (coords) =>
  Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

// "just now" / "3m ago" / "2h ago" / "5d ago"
const timeAgo = (date) => {
  const ms = Date.now() - new Date(date).getTime();
  if (ms < 0) return 'just now';

  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * @param {object} vehicle - a Vehicle (or the `tracking.vehicle` shape
 *   returned by GET /api/shipments/:id/track), expected to carry
 *   currentLocation, locationUpdatedAt, isSharingLocation, locationSource.
 * @returns {{ text: string, tone: string }}
 */
export const formatLocationFreshness = (vehicle) => {
  if (!vehicle) {
    return { text: 'No location yet', tone: 'text-gray-400' };
  }

  const coords = vehicle.currentLocation?.coordinates;
  const updatedAt = vehicle.locationUpdatedAt;

  if (!isRealPoint(coords) || !updatedAt) {
    return { text: 'No location yet', tone: 'text-gray-400' };
  }

  // Manual pins (agency staff clicked a position in for a driver with no
  // smartphone) never claim to be live GPS — say so plainly.
  if (vehicle.locationSource === 'manual') {
    return { text: `Set by agency · ${timeAgo(updatedAt)}`, tone: 'text-gray-500' };
  }

  if (!vehicle.isSharingLocation) {
    return { text: `Sharing turned off · last seen ${timeAgo(updatedAt)}`, tone: 'text-amber-600' };
  }

  const ageMs = Date.now() - new Date(updatedAt).getTime();

  if (ageMs <= LIVE_WINDOW_MS) {
    return { text: 'Live', tone: 'text-emerald-600' };
  }

  if (ageMs <= STALE_WINDOW_MS) {
    return { text: `Updated ${timeAgo(updatedAt)}`, tone: 'text-amber-600' };
  }

  return { text: `Stale · last seen ${timeAgo(updatedAt)}`, tone: 'text-red-500' };
};