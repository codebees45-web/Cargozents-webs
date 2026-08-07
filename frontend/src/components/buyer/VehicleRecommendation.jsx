import { useMemo } from "react";
import {
  Truck,
  Package,
  ShieldCheck,
  Clock3,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

const vehicleDatabase = [
  {
    id: 1,
    name: "Pickup Truck",
    capacity: 750,
    maxVolume: 80,
    pricePerKm: 14,
    eta: "35 mins",
    insurance: true,
  },
  {
    id: 2,
    name: "Mini Truck",
    capacity: 1500,
    maxVolume: 180,
    pricePerKm: 18,
    eta: "28 mins",
    insurance: true,
  },
  {
    id: 3,
    name: "Light Commercial Truck",
    capacity: 3500,
    maxVolume: 450,
    pricePerKm: 26,
    eta: "32 mins",
    insurance: true,
  },
  {
    id: 4,
    name: "Container Truck",
    capacity: 12000,
    maxVolume: 1200,
    pricePerKm: 40,
    eta: "45 mins",
    insurance: true,
  },
];

export default function VehicleRecommendation({
  formData,
  distance = 0,
  onSelectVehicle,
}) {
  const recommendation = useMemo(() => {
    const weight = Number(formData.weight || 0);

    const length = Number(formData.length || 0);
    const width = Number(formData.width || 0);
    const height = Number(formData.height || 0);

    const volume = (length * width * height) / 1000;

    let vehicle =
      vehicleDatabase.find(
        (item) =>
          item.capacity >= weight &&
          item.maxVolume >= volume
      ) || vehicleDatabase[vehicleDatabase.length - 1];

    const estimatedPrice = Math.round(
      vehicle.pricePerKm * Math.max(distance, 25)
    );

    return {
      vehicle,
      volume,
      estimatedPrice,
    };
  }, [formData, distance]);

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold text-primary">
            AI Vehicle Recommendation
          </h2>

          <p className="text-sm text-[#5B7A70] mt-1">
            Based on cargo dimensions, weight and distance.
          </p>

        </div>

        <div className="rounded-full bg-success/10 px-4 py-2 text-success text-sm font-semibold">
          Recommended
        </div>

      </div>

      <div className="mt-8">

        <div className="rounded-xl border border-primary/10 p-6">

          <div className="flex items-center gap-4">

            <div className="rounded-full bg-primary/10 p-4">

              <Truck
                className="text-primary"
                size={30}
              />

            </div>

            <div>

              <h3 className="text-xl font-semibold text-primary">
                {recommendation.vehicle.name}
              </h3>

              <p className="text-[#5B7A70]">
                Best suitable vehicle for this shipment.
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-8">

            <InfoCard
              icon={<Package size={18} />}
              title="Capacity"
              value={`${recommendation.vehicle.capacity} KG`}
            />

            <InfoCard
              icon={<Clock3 size={18} />}
              title="Estimated Arrival"
              value={recommendation.vehicle.eta}
            />

            <InfoCard
              icon={<IndianRupee size={18} />}
              title="Estimated Cost"
              value={`₹ ${recommendation.estimatedPrice}`}
            />

            <InfoCard
              icon={<ShieldCheck size={18} />}
              title="Insurance"
              value={
                recommendation.vehicle.insurance
                  ? "Included"
                  : "Unavailable"
              }
            />

          </div>

          <div className="mt-8 rounded-lg bg-background border border-primary/10 p-5">

            <h4 className="font-semibold text-primary mb-4">
              Recommendation Reason
            </h4>

            <div className="space-y-3">

              <Reason text="Cargo fits safely within capacity." />

              <Reason text="Lowest estimated transportation cost." />

              <Reason text="Available nearby with minimum waiting time." />

              <Reason text="Suitable for shipment dimensions." />

            </div>

          </div>

          <button
            onClick={() =>
              onSelectVehicle(recommendation.vehicle)
            }
            className="mt-8 w-full rounded-lg bg-primary py-3 text-white font-medium hover:opacity-90 transition"
          >
            Select This Vehicle
          </button>

        </div>

      </div>

    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-lg border border-primary/10 p-4">

      <div className="flex items-center gap-3">

        <div className="text-primary">
          {icon}
        </div>

        <div>

          <p className="text-xs text-[#5B7A70]">
            {title}
          </p>

          <h4 className="font-semibold text-primary">
            {value}
          </h4>

        </div>

      </div>

    </div>
  );
}

function Reason({ text }) {
  return (
    <div className="flex items-center gap-3">

      <CheckCircle2
        size={18}
        className="text-success"
      />

      <span>{text}</span>

    </div>
  );
}