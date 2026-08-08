import { useMemo } from "react";
import { ReceiptIndianRupee } from "lucide-react";

export default function PriceBreakdown({
  distance = 0,
  selectedVehicle,
  insurance = "Standard",
  couponDiscount = 0,
  onContinue,
}) {
  const pricing = useMemo(() => {
    const km = Number(distance || 0);

    const baseFare = 150;

    const distanceCharge =
      km * (selectedVehicle?.pricePerKm || 15);

    const fuelSurcharge = Math.round(distanceCharge * 0.08);

    const tollCharges =
      km > 80 ? Math.round(km * 1.5) : 0;

    const insuranceCharge =
      insurance === "Premium"
        ? 250
        : insurance === "Standard"
        ? 100
        : 0;

    const platformFee = 50;

    const subtotal =
      baseFare +
      distanceCharge +
      fuelSurcharge +
      tollCharges +
      insuranceCharge +
      platformFee;

    const gst = Math.round(subtotal * 0.18);

    const total =
      subtotal + gst - couponDiscount;

    return {
      baseFare,
      distanceCharge,
      fuelSurcharge,
      tollCharges,
      insuranceCharge,
      platformFee,
      gst,
      total,
    };
  }, [distance, selectedVehicle, insurance, couponDiscount]);

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">

      <span className="text-[#5B7A70]">
        {label}
      </span>

      <span className="font-medium">
        ₹ {value}
      </span>

    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <div className="flex items-center gap-3">

        <ReceiptIndianRupee
          className="text-primary"
          size={24}
        />

        <div>

          <h2 className="font-semibold text-xl text-primary">
            Price Breakdown
          </h2>

          <p className="text-sm text-[#5B7A70]">
            Estimated logistics charges
          </p>

        </div>

      </div>

      <div className="mt-8 space-y-1">

        <Row
          label="Base Fare"
          value={pricing.baseFare}
        />

        <Row
          label="Distance Charge"
          value={pricing.distanceCharge}
        />

        <Row
          label="Fuel Surcharge"
          value={pricing.fuelSurcharge}
        />

        <Row
          label="Toll Charges"
          value={pricing.tollCharges}
        />

        <Row
          label="Insurance"
          value={pricing.insuranceCharge}
        />

        <Row
          label="Platform Fee"
          value={pricing.platformFee}
        />

        <Row
          label="GST (18%)"
          value={pricing.gst}
        />

        {couponDiscount > 0 && (

          <div className="flex justify-between py-2 text-success">

            <span>Coupon Discount</span>

            <span>
              - ₹ {couponDiscount}
            </span>

          </div>

        )}

      </div>

      <hr className="my-5 border-primary/10" />

      <div className="flex justify-between items-center">

        <h3 className="text-lg font-semibold text-primary">
          Total Amount
        </h3>

        <h3 className="text-2xl font-bold text-primary">
          ₹ {pricing.total}
        </h3>

      </div>

      {onContinue && (
        <div className="mt-6">

          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-lg bg-primary py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Continue Booking
          </button>

        </div>
      )}

    </div>
  );
}