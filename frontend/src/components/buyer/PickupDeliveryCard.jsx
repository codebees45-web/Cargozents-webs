import { useState } from "react";
import { ArrowLeftRight, Navigation, Loader2 } from "lucide-react";
import GoogleAddressInput from "../common/GoogleAddressInput";
import { useTranslation } from "react-i18next";

export default function PickupDeliveryCard({
  formData,
  swapLocations,
  onPickupSelect,
  onDeliverySelect,
  distance,
  duration,
  loadingDistance,
}) {
  const { t } = useTranslation();
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    setLocateError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
          });
          const data = await res.json();

          onPickupSelect({
            address: data.display_name || `${latitude}, ${longitude}`,
            latitude,
            longitude,
          });
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          // Still set the coordinates even if we can't resolve an address.
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
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please enable it in your browser settings."
            : "Could not detect your location."
        );
        setLocating(false);
      }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary mb-6">
        {t("bookShipment.pickupDelivery.title", "Pickup & Delivery")}
      </h2>

      <div className="space-y-6">

        {/* Pickup */}

        <div>

          <label className="block text-sm font-medium mb-2">
            {t("bookShipment.pickupDelivery.pickupAddress", "Pickup Address")}
          </label>

          <GoogleAddressInput
            label=""
            value={formData.pickupAddress}
            placeholder={t("bookShipment.pickupDelivery.searchPickup", "Search pickup location")}
            onAddressSelect={onPickupSelect}
          />

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="mt-3 flex items-center gap-2 text-primary text-sm disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {locating ? t("bookShipment.pickupDelivery.locating", "Locating...") : t("bookShipment.pickupDelivery.useCurrentLocation", "Use Current Location")}
          </button>

          {locateError && (
            <p className="mt-1 text-xs text-danger">{locateError}</p>
          )}

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
            {t("bookShipment.pickupDelivery.deliveryAddress", "Delivery Address")}
          </label>

          <GoogleAddressInput
            label=""
            value={formData.deliveryAddress}
            placeholder={t("bookShipment.pickupDelivery.searchDelivery", "Search delivery location")}
            onAddressSelect={onDeliverySelect}
          />

        </div>

        {/* Distance */}

        <div className="rounded-lg bg-background border border-primary/10 p-4">

          <div className="flex justify-between">

            <span className="text-[#5B7A70]">
              {t("bookShipment.pickupDelivery.estimatedDistance", "Estimated Distance")}
            </span>

            <strong>
              {loadingDistance
                ? t("bookShipment.pickupDelivery.calculating", "Calculating...")
                : distance
                ? `${distance.toFixed(1)} KM`
                : "-- KM"}
            </strong>

          </div>

          <div className="mt-3 flex justify-between">

            <span className="text-[#5B7A70]">
              {t("bookShipment.pickupDelivery.estimatedTime", "Estimated Travel Time")}
            </span>

            <strong>
              {loadingDistance
                ? t("bookShipment.pickupDelivery.calculating", "Calculating...")
                : duration || "--"}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}