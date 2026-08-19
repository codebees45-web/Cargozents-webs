import {
  MapPin,
  Truck,
  Package,
  Weight,
  Clock3,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

export default function ShipmentSummary({
  formData,
  selectedVehicle,
  estimatedPrice = 0,
  distance = 0,
  eta = "--",
}) {
  return (
    <div className="sticky top-6 rounded-xl border border-primary/10 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-primary/10 p-6">

        <h2 className="text-xl font-semibold text-primary">
          Shipment Summary
        </h2>

        <p className="mt-1 text-sm text-[#5B7A70]">
          Review your shipment details before continuing.
        </p>

      </div>

      {/* Body */}

      <div className="space-y-6 p-6">

        {/* Pickup */}

        <Section
          icon={<MapPin size={18} />}
          title="Pickup"
          value={
            formData.pickupAddress ||
            "Not selected"
          }
        />

        {/* Delivery */}

        <Section
          icon={<MapPin size={18} />}
          title="Delivery"
          value={
            formData.deliveryAddress ||
            "Not selected"
          }
        />

        {/* Vehicle */}

        <Section
          icon={<Truck size={18} />}
          title="Vehicle"
          value={
            selectedVehicle?.name ||
            "Not selected"
          }
        />

        {/* Goods */}

        <Section
          icon={<Package size={18} />}
          title="Goods"
          value={
            formData.goodsName ||
            "Not entered"
          }
        />

        {/* Weight */}

        <Section
          icon={<Weight size={18} />}
          title="Weight"
          value={
            formData.weight
              ? `${formData.weight} KG`
              : "--"
          }
        />

        {/* Distance */}

        <Section
          icon={<MapPin size={18} />}
          title="Distance"
          value={`${distance} KM`}
        />

        {/* ETA */}

        <Section
          icon={<Clock3 size={18} />}
          title="Estimated Delivery"
          value={eta}
        />

        {/* Insurance */}

        <Section
          icon={<ShieldCheck size={18} />}
          title="Insurance"
          value={
            formData.insurance ||
            "Standard"
          }
        />

      </div>

      {/* Footer */}

      <div className="border-t border-primary/10 p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <IndianRupee
              size={20}
              className="text-primary"
            />

            <span className="font-medium text-primary">
              Estimated Cost
            </span>

          </div>

          <span className="text-2xl font-bold text-primary">
            ₹ {estimatedPrice}
          </span>

        </div>

        <button
          className="mt-6 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:opacity-90"
        >
          Continue
        </button>

      </div>

    </div>
  );
}

function Section({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-1 text-primary">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-xs uppercase tracking-wide text-[#5B7A70]">
          {title}
        </p>

        <p className="mt-1 font-medium text-primary break-words">
          {value}
        </p>

      </div>

    </div>
  );
}