const VEHICLE_PRICING = {
  Bike: { baseFare: 50, perKm: 8, maxWeight: 20 },
  "Mini Truck": { baseFare: 200, perKm: 18, maxWeight: 1500 },
  "Pickup Truck": { baseFare: 350, perKm: 22, maxWeight: 3000 },
  "Container Truck": { baseFare: 800, perKm: 35, maxWeight: 15000 },
  Trailer: { baseFare: 1200, perKm: 50, maxWeight: 30000 },
  "Light Commercial Truck": { baseFare: 500, perKm: 26, maxWeight: 3500 },
};

export function estimatePricing({
  distance,
  vehicleType,
  weight,
  insurance = "Standard",
  deliveryType = "Standard",
  couponDiscount = 0,
}) {
  const vehicle = VEHICLE_PRICING[vehicleType];

  if (!vehicle) {
    throw new Error("Unsupported vehicle type");
  }

  const baseFare = vehicle.baseFare;
  const distanceCharge = Number(distance) * vehicle.perKm;
  const weightCharge =
    Number(weight) > 1000 ? Math.ceil(Number(weight) / 1000) * 50 : 0;
  const fuelSurcharge = Math.round(distanceCharge * 0.08);
  const tollCharge =
    Number(distance) > 100 ? Math.round(Number(distance) * 1.5) : 0;
  const insuranceCharge =
    insurance === "Premium" ? 250 : insurance === "Standard" ? 100 : 0;
  const expressCharge =
    deliveryType === "Express" ? 300 : deliveryType === "Same Day" ? 600 : 0;

  const subtotal =
    baseFare +
    distanceCharge +
    weightCharge +
    fuelSurcharge +
    tollCharge +
    insuranceCharge +
    expressCharge;

  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst - Number(couponDiscount);

  return {
    baseFare,
    distanceCharge,
    weightCharge,
    fuelSurcharge,
    tollCharge,
    insuranceCharge,
    expressCharge,
    gst,
    subtotal,
    total,
  };
}