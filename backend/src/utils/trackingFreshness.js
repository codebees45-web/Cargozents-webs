// Turns a tracked vehicle's locationUpdatedAt/isSharingLocation into a
// short human-readable freshness message + tailwind color class. Shared
// by every live-tracking view (agency/shipper TruckTracking, buyer order
// tracking) so they all describe "stale" the same way.
export const formatLocationFreshness = (vehicle) => {
  if (!vehicle) return null;
  if (!vehicle.locationUpdatedAt) {
    return { text: "Driver hasn't started sharing location yet", tone: 'text-gray-400' };
  }
  const seconds = Math.round((Date.now() - new Date(vehicle.locationUpdatedAt).getTime()) / 1000);
  const ago = seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`;

  if (!vehicle.isSharingLocation) {
    return { text: `Driver turned off live sharing · last seen ${ago}`, tone: 'text-amber-600' };
  }
  if (vehicle.locationSource === 'manual') {
    // Set by hand via agencyController.setVehicleLocation for a driver
    // with no smartphone — never call this "live", however fresh it is.
    return { text: `Updated by agency · ${ago}`, tone: 'text-blue-600' };
  }
  if (seconds > 90) {
    return { text: `Signal lost · last update ${ago}`, tone: 'text-amber-600' };
  }
  return { text: `Live · updated ${ago}`, tone: 'text-emerald-600' };
};