import { useState } from "react";
import { Calendar, ShieldCheck, TicketPercent, CheckCircle2, XCircle } from "lucide-react";

// No backend coupon endpoint exists yet, so we validate against a small
// local table for now. Swap this for a real API call once one exists.
const COUPON_TABLE = {
  FIRST50: { discount: 50, label: "₹50 off on your first shipment" },
  SAVE100: { discount: 100, label: "₹100 off" },
  CARGO10: { discount: 10, label: "₹10 off" },
};

export default function ShipmentOptions({
  formData,
  handleChange,
  onApplyCoupon,
}) {
  const [couponStatus, setCouponStatus] = useState(null); // { ok: bool, message: string } | null
  const [applying, setApplying] = useState(false);

  const applyCoupon = () => {
    const code = formData.coupon?.trim().toUpperCase();

    if (!code) {
      setCouponStatus({ ok: false, message: "Enter a coupon code first." });
      return;
    }

    setApplying(true);

    // Simulate a lookup so the button gives real feedback instead of
    // resolving instantly (and to leave a clear spot to swap in a real
    // API call later).
    setTimeout(() => {
      const match = COUPON_TABLE[code];

      if (match) {
        onApplyCoupon?.(match.discount, code);
        setCouponStatus({ ok: true, message: `Applied: ${match.label}` });
      } else {
        onApplyCoupon?.(0, "");
        setCouponStatus({ ok: false, message: "Invalid or expired coupon code." });
      }

      setApplying(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary">
        Shipment Options
      </h2>

      <p className="mt-1 text-sm text-[#5B7A70]">
        Configure delivery preferences.
      </p>

      <div className="mt-8 space-y-8">

        {/* Delivery Type */}

        <div>

          <label className="block mb-3 font-medium">
            Delivery Type
          </label>

          <div className="grid md:grid-cols-3 gap-4">

            {[
              "Standard",
              "Express",
              "Same Day",
            ].map((type) => (

              <label
                key={type}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  formData.deliveryType === type
                    ? "border-primary bg-primary/5"
                    : "border-primary/10"
                }`}
              >

                <input
                  hidden
                  type="radio"
                  name="deliveryType"
                  value={type}
                  checked={
                    formData.deliveryType === type
                  }
                  onChange={handleChange}
                />

                <h4 className="font-semibold">
                  {type}
                </h4>

              </label>

            ))}

          </div>

        </div>

        {/* Schedule */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <Calendar size={18} />

            Pickup Schedule

          </label>

          <input
            type="datetime-local"
            name="pickupSchedule"
            value={formData.pickupSchedule}
            onChange={handleChange}
            className="w-full rounded-lg border border-primary/10 px-4 py-3"
          />

        </div>

        {/* Insurance */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <ShieldCheck size={18} />

            Insurance

          </label>

          <select
            name="insurance"
            value={formData.insurance}
            onChange={handleChange}
            className="w-full rounded-lg border border-primary/10 px-4 py-3"
          >

            <option value="None">
              No Insurance
            </option>

            <option value="Standard">
              Standard
            </option>

            <option value="Premium">
              Premium
            </option>

          </select>

        </div>

        {/* Coupon */}

        <div>

          <label className="mb-3 flex items-center gap-2 font-medium">

            <TicketPercent size={18} />

            Coupon Code

          </label>

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Enter coupon"
              name="coupon"
              value={formData.coupon}
              onChange={(e) => {
                handleChange(e);
                setCouponStatus(null);
              }}
              className="flex-1 rounded-lg border border-primary/10 px-4 py-3"
            />

            <button
              type="button"
              onClick={applyCoupon}
              disabled={applying}
              className="rounded-lg bg-primary px-6 text-white disabled:opacity-60"
            >
              {applying ? "Applying..." : "Apply"}
            </button>

          </div>

          {couponStatus && (
            <p
              className={`mt-2 flex items-center gap-1.5 text-sm ${
                couponStatus.ok ? "text-success" : "text-danger"
              }`}
            >
              {couponStatus.ok ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {couponStatus.message}
            </p>
          )}

        </div>

        {/* Notes */}

        <div>

          <label className="block mb-3 font-medium">
            Special Instructions
          </label>

          <textarea
            rows="4"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Handling instructions..."
            className="w-full rounded-lg border border-primary/10 px-4 py-3 resize-none"
          />

        </div>

      </div>

    </div>
  );
}