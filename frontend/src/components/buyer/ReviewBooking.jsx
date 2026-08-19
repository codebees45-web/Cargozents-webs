import { Truck, MapPin, Package, User, IndianRupee } from "lucide-react";

export default function ReviewBooking({
  formData,
  selectedVehicle,
  estimatedPrice,
  onConfirm,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-2xl font-semibold text-primary">
        Review Booking
      </h2>

      <p className="mt-2 text-[#5B7A70]">
        Verify all shipment details before confirming your booking.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-8">

        {/* Pickup */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <MapPin className="text-primary" size={20} />

            <h3 className="font-semibold">
              Pickup Address
            </h3>

          </div>

          <p className="mt-3">
            {formData.pickupAddress}
          </p>

        </div>

        {/* Delivery */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <MapPin className="text-primary" size={20} />

            <h3 className="font-semibold">
              Delivery Address
            </h3>

          </div>

          <p className="mt-3">
            {formData.deliveryAddress}
          </p>

        </div>

        {/* Goods */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <Package className="text-primary" size={20} />

            <h3 className="font-semibold">
              Goods
            </h3>

          </div>

          <div className="mt-3 space-y-2">

            <p>Name : {formData.goodsName}</p>

            <p>Category : {formData.goodsCategory}</p>

            <p>Weight : {formData.weight} KG</p>

            <p>Quantity : {formData.quantity}</p>

          </div>

        </div>

        {/* Vehicle */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <Truck className="text-primary" size={20} />

            <h3 className="font-semibold">
              Selected Vehicle
            </h3>

          </div>

          <div className="mt-3">

            <p>{selectedVehicle?.name || "Not Selected"}</p>

          </div>

        </div>

        {/* Receiver */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <User className="text-primary" size={20} />

            <h3 className="font-semibold">
              Receiver
            </h3>

          </div>

          <div className="mt-3 space-y-2">

            <p>{formData.receiverName}</p>

            <p>{formData.receiverPhone}</p>

          </div>

        </div>

        {/* Price */}

        <div className="rounded-lg border border-primary/10 p-5">

          <div className="flex items-center gap-3">

            <IndianRupee className="text-primary" size={20} />

            <h3 className="font-semibold">
              Estimated Price
            </h3>

          </div>

          <h2 className="mt-4 text-3xl font-bold text-primary">
            ₹ {estimatedPrice}
          </h2>

        </div>

      </div>

      <div className="mt-8">

        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full rounded-lg bg-primary py-4 text-white text-lg font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Placing Order..." : "Confirm Booking"}
        </button>

      </div>

    </div>
  );
}