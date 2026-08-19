import { useState } from "react";
import { ArrowLeftRight, Navigation, Loader2 } from "lucide-react";
import GoogleAddressInput from "../common/GoogleAddressInput";

export default function PickupDeliveryCard({
  formData,
  swapLocations,
  onPickupSelect,
  onDeliverySelect,
  distance,
  duration,
  loadingDistance,
}) {
  const [locating, setLocating] = useState(false);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation isn't supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } }
          );
          const data = await res.json();
          onPickupSelect({
            address: data?.display_name || `${latitude}, ${longitude}`,
            latitude,
            longitude,
          });
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          onPickupSelect({
            address: `${latitude}, ${longitude}`,
            latitude,
            longitude,
          });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation failed:", err);
        alert("Couldn't get your current location. Please allow location access and try again.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary mb-6">
        Pickup & Delivery
      </h2>

      <div className="space-y-6">

        {/* Pickup */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Pickup Address
          </label>

          <GoogleAddressInput
            label=""
            value={formData.pickupAddress}
            placeholder="Search pickup location"
            onAddressSelect={onPickupSelect}
          />

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="mt-3 flex items-center gap-2 text-primary text-sm disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {locating ? "Locating..." : "Use Current Location"}
          </button>

        </div>

        {/* Swap */}

        <div className="flex justify-center">

          <button
            type="button"
            onClick={swapLocations}
            className="rounded-full border border-primary/10 p-3 hover:bg-primary/5 transition"
          >
            <ArrowLeftRight size={20} />
          </button>

        </div>

        {/* Delivery */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Delivery Address
          </label>

          <GoogleAddressInput
            label=""
            value={formData.deliveryAddress}
            placeholder="Search delivery location"
            onAddressSelect={onDeliverySelect}
          />

        </div>

        {/* Distance */}

        <div className="rounded-lg bg-background border border-primary/10 p-4">

          <div className="flex justify-between">

            <span className="text-[#5B7A70]">
              Estimated Distance
            </span>

            <strong>
              {loadingDistance
                ? "Calculating..."
                : distance
                ? `${distance.toFixed(1)} KM`
                : "-- KM"}
            </strong>

          </div>

          <div className="mt-3 flex justify-between">

            <span className="text-[#5B7A70]">
              Estimated Travel Time
            </span>

            <strong>
              {loadingDistance
                ? "Calculating..."
                : duration || "--"}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}