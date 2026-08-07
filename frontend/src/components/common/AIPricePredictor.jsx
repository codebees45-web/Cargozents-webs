import { useEffect, useState, useCallback } from "react";
import { Sparkles, TrendingUp, Info, RefreshCw } from "lucide-react";
import aiPricingService from "../../services/aiPricingService";

/**
 * Drop-in AI price estimate widget. Pass it the same fields you already
 * collect for a shipment/booking form; it debounces and calls
 * POST /api/pricing/predict, then shows either an ML-backed estimate with
 * a confidence badge + range, or a clearly-labeled fallback estimate while
 * the model is still warming up (cold start).
 */
export default function AIPricePredictor({
  pickupCoordinates,
  dropCoordinates,
  pickupState,
  dropState,
  weight,
  vehicleType,
  insuranceOpted = false,
  isBackhaulMatch = false,
}) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasValidInputs =
    Array.isArray(pickupCoordinates) &&
    Array.isArray(dropCoordinates) &&
    Number(pickupCoordinates[0]) &&
    Number(pickupCoordinates[1]) &&
    Number(dropCoordinates[0]) &&
    Number(dropCoordinates[1]) &&
    Number(weight) > 0 &&
    !!vehicleType;

  const fetchPrediction = useCallback(async () => {
    if (!hasValidInputs) {
      setPrediction(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await aiPricingService.predict({
        pickupCoordinates: pickupCoordinates.map(Number),
        dropCoordinates: dropCoordinates.map(Number),
        pickupState,
        dropState,
        weight: Number(weight),
        vehicleType,
        insuranceOpted,
        isBackhaulMatch,
      });
      setPrediction(result);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't get an AI estimate right now.");
      setPrediction(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasValidInputs,
    JSON.stringify(pickupCoordinates),
    JSON.stringify(dropCoordinates),
    pickupState,
    dropState,
    weight,
    vehicleType,
    insuranceOpted,
    isBackhaulMatch,
  ]);

  useEffect(() => {
    const t = setTimeout(fetchPrediction, 600);
    return () => clearTimeout(t);
  }, [fetchPrediction]);

  if (!hasValidInputs) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-sm text-[#5B7A70]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span>Fill in pickup, drop, weight and vehicle type to see an AI price estimate.</span>
        </div>
      </div>
    );
  }

  if (loading && !prediction) {
    return (
      <div className="rounded-xl border border-primary/10 bg-white p-4 text-sm text-[#5B7A70] animate-pulse">
        Calculating AI price estimate...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center justify-between">
        <span>{error}</span>
        <button type="button" onClick={fetchPrediction} className="flex items-center gap-1 font-medium hover:underline">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (!prediction) return null;

  const isML = prediction.method === "ml";

  return (
    <div className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="font-semibold text-primary">AI Price Estimate</h3>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin text-primary/50" />}
        {isML && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <TrendingUp size={12} /> {prediction.confidence}% confidence
          </span>
        )}
        {!isML && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            Warming up
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold text-primary">
          ₹{prediction.predictedPrice.toLocaleString("en-IN")}
        </span>
        <span className="text-sm text-[#5B7A70] mb-1">
          (₹{prediction.priceRange.low.toLocaleString("en-IN")} – ₹
          {prediction.priceRange.high.toLocaleString("en-IN")})
        </span>
      </div>

      <p className="mt-1 text-xs text-[#5B7A70]">
        {prediction.distanceKm} km · {isML ? "Learned from your platform's delivered shipment history" : "Rule-based estimate"}
      </p>

      {isML && prediction.heuristicComparison && (
        <p className="mt-1 text-xs text-[#5B7A70]">
          Standard calculator estimate for comparison: ₹{prediction.heuristicComparison.toLocaleString("en-IN")}
        </p>
      )}

      {!isML && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>{prediction.modelInfo.reason}</span>
        </div>
      )}
    </div>
  );
}