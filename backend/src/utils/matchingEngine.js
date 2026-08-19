const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { roadDistanceKm } = require('./geo');

// How far (km) from the shipment's pickup point we're willing to look for
// a candidate vehicle. Wide enough to catch a truck finishing a nearby
// delivery, narrow enough that "nearby" stays meaningful.
const PICKUP_RADIUS_KM = 60;
const AVG_ROAD_SPEED_KMPH = 38; // used only for a rough ETA estimate

// Weights sum to 1.0 — tune here as real outcome data comes in.
const WEIGHTS = {
  proximity: 0.30,
  backhaul: 0.25,
  routeOverlap: 0.20,
  rating: 0.15,
  capacityFit: 0.10,
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Scores how well a candidate vehicle's "homeward" leg overlaps with the
 * shipment's pickup->drop direction. A vehicle heading roughly the same
 * way as the shipment is a much better backhaul fit than one that would
 * have to backtrack.
 */
const routeOverlapScore = (vehicle, pickupCoords, dropCoords) => {
  if (!vehicle.isOnEmptyReturn || !vehicle.homeBaseLocation?.coordinates) return 0.4; // neutral if not on a return leg

  const vehicleToHome = roadDistanceKm(vehicle.currentLocation.coordinates, vehicle.homeBaseLocation.coordinates);
  const vehicleToPickupToDropToHome =
    roadDistanceKm(vehicle.currentLocation.coordinates, pickupCoords) +
    roadDistanceKm(pickupCoords, dropCoords) +
    roadDistanceKm(dropCoords, vehicle.homeBaseLocation.coordinates);

  if (vehicleToHome === 0) return 0.4;

  // Detour ratio: how much extra distance taking this shipment adds versus
  // driving straight home empty. Lower detour = higher overlap score.
  const detourRatio = vehicleToPickupToDropToHome / vehicleToHome;
  // detourRatio of 1.0-1.2 (barely any detour) scores near 1; 2x+ scores near 0.
  return clamp01(1 - (detourRatio - 1));
};

/**
 * Finds and ranks candidate driver+vehicle pairs for a shipment.
 * Returns an array sorted best-first, each entry carrying its own
 * priorityScore breakdown so the admin UI can show *why* a match ranked
 * where it did, rather than a black-box number.
 */
const findMatches = async (shipment, { limit = 10 } = {}) => {
  const pickupCoords = shipment.pickup.location.coordinates;
  const dropCoords = shipment.drop.location.coordinates;

  const candidates = await Vehicle.find({
    type: shipment.vehicleRequired,
    isVerified: true,
    isActive: true,
    capacityWeight: { $gte: shipment.weight },
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: pickupCoords },
        $maxDistance: PICKUP_RADIUS_KM * 1000,
      },
    },
  })
    .limit(50)
    .populate('driver', 'name phone driverProfile isSuspended isApproved');

  const scored = candidates
    .filter((v) => v.driver && !v.driver.isSuspended && v.driver.isApproved && v.driver.driverProfile?.isAvailable)
    .map((vehicle) => {
      const distanceToPickup = roadDistanceKm(vehicle.currentLocation.coordinates, pickupCoords);
      const proximityScore = clamp01(1 - distanceToPickup / PICKUP_RADIUS_KM);
      const backhaulScore = vehicle.isOnEmptyReturn ? 1 : 0.3;
      const overlapScore = routeOverlapScore(vehicle, pickupCoords, dropCoords);
      const rating = vehicle.driver.driverProfile?.rating ?? 0;
      const ratingScore = clamp01(rating / 5);
      const capacityFitScore = clamp01(shipment.weight / vehicle.capacityWeight); // reward right-sized trucks over wildly oversized ones

      const priorityScore =
        WEIGHTS.proximity * proximityScore +
        WEIGHTS.backhaul * backhaulScore +
        WEIGHTS.routeOverlap * overlapScore +
        WEIGHTS.rating * ratingScore +
        WEIGHTS.capacityFit * capacityFitScore;

      const etaMinutes = Math.round((distanceToPickup / AVG_ROAD_SPEED_KMPH) * 60);

      return {
        vehicle,
        driver: vehicle.driver,
        distanceToPickupKm: Number(distanceToPickup.toFixed(1)),
        etaMinutes,
        isBackhaulMatch: vehicle.isOnEmptyReturn,
        priorityScore: Number((priorityScore * 100).toFixed(1)), // 0-100 for readability
        scoreBreakdown: {
          proximity: Number((proximityScore * 100).toFixed(0)),
          backhaul: Number((backhaulScore * 100).toFixed(0)),
          routeOverlap: Number((overlapScore * 100).toFixed(0)),
          rating: Number((ratingScore * 100).toFixed(0)),
          capacityFit: Number((capacityFitScore * 100).toFixed(0)),
        },
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);

  return scored;
};

module.exports = { findMatches, PICKUP_RADIUS_KM };
