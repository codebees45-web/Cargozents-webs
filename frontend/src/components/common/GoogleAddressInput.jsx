import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Address autocomplete backed by the CargoZent backend proxy.
 *
 * When GOOGLE_MAPS_API_KEY is set in the backend .env the proxy uses the
 * real Google Places API (full POI data — colleges, hospitals, businesses,
 * landmarks etc). When the key is not set it falls back to OpenStreetMap
 * Nominatim automatically so the feature still works without a key.
 *
 * Props:
 *  - label, placeholder, value, onChange, disabled  — standard input props
 *  - onAddressSelect({ address, latitude, longitude })
 *      Backward-compatible callback called when user picks a suggestion.
 *  - onFullAddress({ address, line1, city, state, pincode, latitude, longitude })
 *      Optional — called with fully-parsed sub-fields so callers can
 *      auto-fill city / state / pincode / coordinates in one go.
 */
export default function GoogleAddressInput({
  label,
  placeholder,
  value,
  onAddressSelect,
  onFullAddress,
  onChange,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  // Session token groups autocomplete + details calls for billing efficiency
  const sessionTokenRef = useRef(crypto.randomUUID());

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close the dropdown when clicking outside the input.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = (text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: text,
          sessiontoken: sessionTokenRef.current,
        });
        const res = await fetch(`${API_BASE}/api/maps/autocomplete?${params}`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data.predictions) ? data.predictions : []);
        setSuggestions((prev) => {
          // Store source so handleSelect knows which path to take
          return (data.predictions || []).map((p) => ({
            ...p,
            _source: data.source,
          }));
        });
        setShowDropdown(true);
      } catch (err) {
        console.error("Address search failed:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange?.(text);
    fetchSuggestions(text);
  };

  /** Parse Nominatim addressdetails into clean sub-fields. */
  const parseNominatimAddress = (place) => {
    const a = place.address || {};
    const line1 =
      [a.house_number, a.road || a.pedestrian || a.footway]
        .filter(Boolean)
        .join(" ") ||
      a.suburb ||
      a.neighbourhood ||
      a.quarter ||
      "";
    const city =
      a.city || a.town || a.village || a.county || a.district || "";
    const state = a.state || a.state_district || "";
    const pincode = a.postcode || "";
    return { line1, city, state, pincode };
  };

  const handleSelect = async (prediction) => {
    setQuery(prediction.description);
    setSuggestions([]);
    setShowDropdown(false);

    if (prediction._source === "google" && prediction.placeId) {
      // ── Google path: fetch exact coordinates from place-details ──────
      try {
        const res = await fetch(
          `${API_BASE}/api/maps/place-details?placeId=${encodeURIComponent(prediction.placeId)}`
        );
        const detail = await res.json();

        if (detail.success) {
          onAddressSelect?.({
            address: detail.formattedAddress || prediction.description,
            latitude: detail.lat,
            longitude: detail.lon,
          });
          if (onFullAddress) {
            onFullAddress({
              address: detail.formattedAddress || prediction.description,
              line1: detail.line1,
              city: detail.city,
              state: detail.state,
              pincode: detail.pincode,
              latitude: detail.lat,
              longitude: detail.lon,
            });
          }
          // Rotate session token after a completed autocomplete→details pair
          sessionTokenRef.current = crypto.randomUUID();
          return;
        }
      } catch (err) {
        console.error("Place details fetch failed:", err);
      }
      // Fall through: use description without coordinates
      onAddressSelect?.({ address: prediction.description, latitude: null, longitude: null });
    } else {
      // ── Nominatim path: coordinates come directly in the prediction ──
      const latitude = prediction.lat ?? null;
      const longitude = prediction.lon ?? null;

      onAddressSelect?.({
        address: prediction.description,
        latitude,
        longitude,
      });

      if (onFullAddress && prediction.nominatimData) {
        const { line1, city, state, pincode } = parseNominatimAddress(
          prediction.nominatimData
        );
        onFullAddress({
          address: prediction.description,
          line1,
          city,
          state,
          pincode,
          latitude,
          longitude,
        });
      }
    }
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-primary/10 bg-white px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        />

        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7A70]">
            {t("bookShipment.googleAddressInput.searching", "Searching...")}
          </span>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-primary/10 bg-white shadow-lg">
            {suggestions.map((prediction, i) => (
              <li key={prediction.placeId || i}>
                <button
                  type="button"
                  onClick={() => handleSelect(prediction)}
                  className="block w-full px-4 py-2.5 text-left hover:bg-secondary/40 transition-colors"
                >
                  <span className="block text-sm font-medium text-primary leading-snug">
                    {prediction.mainText}
                  </span>
                  {prediction.secondaryText && (
                    <span className="block text-xs text-[#5B7A70] mt-0.5 leading-snug">
                      {prediction.secondaryText}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}