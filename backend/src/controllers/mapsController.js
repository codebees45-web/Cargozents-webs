const axios = require("axios");

// Straight-line (haversine) distance in km — used as a last-resort fallback
// if the routing service is unreachable, so the booking flow never gets
// completely stuck just because an external API is down.
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

exports.getDistance = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (
      pickupLat == null ||
      pickupLng == null ||
      deliveryLat == null ||
      deliveryLng == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup and delivery coordinates are required.",
      });
    }

    // Uses OSRM's free public routing API — no API key required, so
    // distance/duration keeps working even without a paid Google Maps key.
    // Falls back to a straight-line estimate if the routing service fails.
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${deliveryLng},${deliveryLat}?overview=false`;

      const response = await axios.get(osrmUrl, { timeout: 8000 });
      const route = response.data?.routes?.[0];

      if (!route) {
        throw new Error("No route found");
      }

      const distanceKm = route.distance / 1000;
      const durationSec = route.duration;

      return res.json({
        success: true,
        distance: distanceKm,
        distanceText: `${distanceKm.toFixed(1)} km`,
        duration: durationSec,
        durationText: formatDuration(durationSec),
      });
    } catch (routingErr) {
      console.warn("OSRM routing failed, falling back to straight-line distance:", routingErr.message);

      const distanceKm = haversineDistanceKm(pickupLat, pickupLng, deliveryLat, deliveryLng);
      // Rough estimate: straight-line * 1.3 road-factor, at an assumed 40 km/h average.
      const adjustedKm = distanceKm * 1.3;
      const durationSec = (adjustedKm / 40) * 3600;

      return res.json({
        success: true,
        distance: adjustedKm,
        distanceText: `${adjustedKm.toFixed(1)} km (estimated)`,
        duration: durationSec,
        durationText: formatDuration(durationSec),
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/maps/autocomplete?q=<search text>&sessiontoken=<uuid>
 *
 * Proxies Google Places Autocomplete (India only). Falls back to
 * OpenStreetMap Nominatim when GOOGLE_MAPS_API_KEY is not configured.
 */
exports.placesAutocomplete = async (req, res) => {
  const { q, sessiontoken } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ success: true, predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const hasRealKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';

  try {
    if (hasRealKey) {
      // ── Google Places Autocomplete ──────────────────────────────────
      const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
      const { data } = await axios.get(url, {
        params: {
          input: q,
          components: 'country:in',
          key: apiKey,
          sessiontoken: sessiontoken || undefined,
        },
        timeout: 5000,
      });

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places error: ${data.status}`);
      }

      return res.json({
        success: true,
        source: 'google',
        predictions: (data.predictions || []).map((p) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
        })),
      });
    }

    // ── Nominatim fallback ─────────────────────────────────────────────
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', addressdetails: 1, limit: 6, countrycodes: 'in', q },
      headers: { Accept: 'application/json', 'User-Agent': 'CargoZent/1.0' },
      timeout: 5000,
    });

    return res.json({
      success: true,
      source: 'nominatim',
      predictions: (data || []).map((p) => ({
        placeId: null,
        nominatimData: p,
        description: p.display_name,
        mainText: p.display_name.split(',')[0],
        secondaryText: p.display_name.split(',').slice(1).join(',').trim(),
        lat: parseFloat(p.lat),
        lon: parseFloat(p.lon),
        address: p.address,
      })),
    });
  } catch (err) {
    console.error('[MAPS] Autocomplete error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/maps/place-details?placeId=<google_place_id>
 *
 * Returns { lat, lon, formattedAddress, addressComponents } for a Google
 * place_id. Only used when GOOGLE_MAPS_API_KEY is configured.
 */
exports.placeDetails = async (req, res) => {
  const { placeId } = req.query;
  if (!placeId) {
    return res.status(400).json({ success: false, message: 'placeId is required' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return res.status(400).json({ success: false, message: 'Google Maps API key not configured' });
  }

  try {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const { data } = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'geometry,formatted_address,address_components',
        key: apiKey,
      },
      timeout: 5000,
    });

    if (data.status !== 'OK') {
      throw new Error(`Google Places Details error: ${data.status}`);
    }

    const result = data.result;
    const components = result.address_components || [];
    const get = (types) =>
      components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || '';

    return res.json({
      success: true,
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      line1: [get(['street_number']), get(['route'])].filter(Boolean).join(' ') || get(['sublocality_level_1']) || '',
      city: get(['locality', 'administrative_area_level_2']),
      state: get(['administrative_area_level_1']),
      pincode: get(['postal_code']),
      country: get(['country']),
    });
  } catch (err) {
    console.error('[MAPS] Place details error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};