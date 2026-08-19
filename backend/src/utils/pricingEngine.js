const { roadDistanceKm } = require('./geo');

// Per-km and per-kg rates by vehicle class. These are placeholder base
// rates for launch pricing (₹/km, ₹/kg) — intended to be moved into a
// database-backed config once ops has real cost data, but kept as named
// constants (not magic numbers) so that swap is a one-file change.
const VEHICLE_RATE_PER_KM = {
  mini_truck: 18,
  tempo: 22,
  container: 32,
  trailer: 45,
  open_body: 20,
};
const RATE_PER_KG = 0.6;
const BASE_LOADING_CHARGE = 250;
const STATE_TAX_RATE = 0.02; // 2% of freight subtotal, approximates state permit/entry tax
const PERMIT_CHARGE_INTERSTATE = 300;
const WAITING_CHARGE_PER_HOUR = 150;
const TOLL_PER_KM = 1.5; // rough national-highway toll approximation

/**
 * Computes an estimated price for a shipment. All inputs are numeric/plain
 * so this can run both when a shipment is first posted (quote) and again
 * server-side at assignment time (so client-supplied estimates are never
 * trusted for the final charge).
 */
const calculatePrice = ({
  pickupCoordinates,
  dropCoordinates,
  pickupState,
  dropState,
  weight,
  vehicleType,
  insuranceOpted = false,
  isBackhaulMatch = false,
  waitingHours = 0,
}) => {
  const distanceKm = roadDistanceKm(pickupCoordinates, dropCoordinates);
  const ratePerKm = VEHICLE_RATE_PER_KM[vehicleType] ?? VEHICLE_RATE_PER_KM.mini_truck;

  const distanceCharge = distanceKm * ratePerKm;
  const weightCharge = weight * RATE_PER_KG;
  const toll = distanceKm * TOLL_PER_KM;
  const isInterstate = pickupState && dropState && pickupState.trim().toLowerCase() !== dropState.trim().toLowerCase();
  const permitCharge = isInterstate ? PERMIT_CHARGE_INTERSTATE : 0;
  const waitingCharge = waitingHours * WAITING_CHARGE_PER_HOUR;
  const insuranceCharge = insuranceOpted ? Math.max(150, weight * 0.05) : 0;

  const subtotal =
    distanceCharge + weightCharge + BASE_LOADING_CHARGE + toll + permitCharge + waitingCharge + insuranceCharge;
  const stateTax = subtotal * STATE_TAX_RATE;

  let total = subtotal + stateTax;

  // Empty-return-trip discount: a driver already on this route earns net
  // extra revenue at a lower rate than a dedicated trip would cost, so the
  // shipper is passed a discount as the incentive to accept a backhaul
  // match instead of waiting for a dedicated truck.
  const backhaulDiscountRate = 0.15;
  const backhaulDiscount = isBackhaulMatch ? total * backhaulDiscountRate : 0;
  total -= backhaulDiscount;

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    breakdown: {
      distanceCharge: Math.round(distanceCharge),
      weightCharge: Math.round(weightCharge),
      loadingCharge: BASE_LOADING_CHARGE,
      toll: Math.round(toll),
      permitCharge,
      waitingCharge,
      insuranceCharge: Math.round(insuranceCharge),
      stateTax: Math.round(stateTax),
      backhaulDiscount: Math.round(backhaulDiscount),
    },
    estimatedPrice: Math.round(total),
  };
};

module.exports = { calculatePrice, VEHICLE_RATE_PER_KM };
