import { useEffect, useRef, useState } from "react";

/**
 * Free, key-less address autocomplete backed by OpenStreetMap's Nominatim
 * search API. This replaces the old Google Places Autocomplete integration,
 * which silently did nothing whenever `window.google` wasn't loaded (i.e.
 * whenever no valid VITE_GOOGLE_MAPS_API_KEY was configured) — leaving the
 * pickup/delivery fields impossible to fill in, which cascaded into the
 * route map and distance/price never showing up.
 */
export default function GoogleAddressInput({
  label,
  placeholder,
  value,
  onAddressSelect,
  onChange,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

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

    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(
          text
        )}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Address search failed:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange?.(text);
    fetchSuggestions(text);
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    onAddressSelect({
      address: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
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
          className="w-full rounded-lg border border-primary/10 bg-white px-4 py-3 outline-none transition focus:border-primary"
        />

        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7A70]">
            Searching...
          </span>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-primary/10 bg-white shadow-lg">
            {suggestions.map((place) => (
              <li key={place.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-secondary/40"
                >
                  {place.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}