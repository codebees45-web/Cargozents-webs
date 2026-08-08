import { useCallback, useEffect, useState } from "react";
import { Brain, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../components/common/DashboardLayout";
import TruckLoader from "../components/common/TruckLoader";
import aiPricingService from "../services/aiPricingService";

const dateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    {hint && <p className="mt-1 text-xs text-[#5B7A70]">{hint}</p>}
  </div>
);

// Friendlier labels for the raw feature names the ML engine trains on.
const FEATURE_LABELS = {
  bias: "Base fare",
  distanceKm: "Distance (km)",
  weightKg: "Weight (kg)",
  isInterstate: "Interstate move",
  insuranceOpted: "Insurance opted",
  isBackhaulMatch: "Backhaul match",
};

const vehicleLabel = (name) => {
  const match = name.match(/^vehicle_(.+)$/);
  if (match) {
    return `Vehicle: ${match[1].replace(/_/g, " ")}`;
  }
  return FEATURE_LABELS[name] || name;
};

const AdminAIPricing = () => {
  const [model, setModel] = useState(null); // null = loading, object = loaded
  const [error, setError] = useState("");
  const [retraining, setRetraining] = useState(false);
  const [retrainMessage, setRetrainMessage] = useState("");
  const [retrainError, setRetrainError] = useState("");

  const loadStats = useCallback(() => {
    setError("");
    aiPricingService
      .getModelStats()
      .then((data) => setModel(data))
      .catch(() => setError("Could not load the pricing model status right now."));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMessage("");
    setRetrainError("");
    try {
      const updated = await aiPricingService.retrainModel();
      setModel(updated);
      setRetrainMessage(
        updated.trained
          ? `Model retrained on ${updated.sampleSize} delivered shipments.`
          : `Not enough delivered shipments yet (${updated.sampleSize}/${updated.samplesNeeded}). Kept using the rule-based fallback.`
      );
    } catch (err) {
      setRetrainError(
        err?.response?.data?.message || "Retraining failed. Please try again in a moment."
      );
    } finally {
      setRetraining(false);
    }
  };

  // model.coefficients is a plain array (beta) and model.featureNames is a
  // parallel array of names — they are NOT a keyed object, so we zip them
  // together here rather than doing Object.entries(model.coefficients).
  const namedCoefficients =
    model?.trained && Array.isArray(model.coefficients) && Array.isArray(model.featureNames)
      ? model.featureNames.map((name, i) => [name, model.coefficients[i]])
      : [];
  const biasEntry = namedCoefficients.find(([name]) => name === "bias");
  const coefficientEntries = namedCoefficients.filter(([name]) => name !== "bias");
  const maxAbsCoefficient = coefficientEntries.length
    ? Math.max(...coefficientEntries.map(([, v]) => Math.abs(v)))
    : 0;

  return (
    <DashboardLayout
      title="AI Pricing"
      subtitle="Monitor the freight price predictor model and trigger retraining."
    >
      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      {model === null ? (
        <div className="py-16">
          <TruckLoader fullScreen={false} label="Loading model status…" />
        </div>
      ) : (
        <>
          {/* Status banner */}
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border px-5 py-4 ${
              model.trained
                ? "border-success/30 bg-success/10"
                : "border-warning/30 bg-warning/10"
            }`}
          >
            {model.trained ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
            )}
            <div>
              <p className="font-display font-semibold text-primary">
                {model.trained ? "Model is trained and serving live predictions" : "Model not trained yet"}
              </p>
              <p className="mt-1 text-sm text-[#5B7A70]">
                {model.trained
                  ? `Last trained ${dateTime(model.trainedAt)}. Predictions fall back to the rule-based calculator only when a request is missing required fields.`
                  : `Needs ${model.samplesNeeded} delivered shipments with a recorded price to start training; currently has ${model.sampleSize}. Until then, /api/pricing/predict serves rule-based estimates.`}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="STATUS"
              value={model.trained ? "Trained" : "Warming up"}
            />
            <StatCard
              label="TRAINING SAMPLES"
              value={model.trained ? model.sampleSize : `${model.sampleSize} / ${model.samplesNeeded}`}
              hint="Delivered shipments with finalPrice"
            />
            <StatCard
              label="R² (FIT QUALITY)"
              value={model.trained ? model.rSquared.toFixed(3) : "—"}
              hint={model.trained ? "Closer to 1.0 is a better fit" : undefined}
            />
            <StatCard label="LAST TRAINED" value={model.trained ? dateTime(model.trainedAt) : "—"} />
          </div>

          {/* Retrain action */}
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${retraining ? "animate-spin" : ""}`} />
              {retraining ? "Retraining…" : "Retrain model now"}
            </button>
            <p className="text-xs text-[#5B7A70]">
              Pulls the latest delivered shipments and refits the ridge-regression model. Runs
              automatically at most every 30 minutes; use this to force an immediate refresh.
            </p>
          </div>
          {retrainMessage && <p className="mt-3 text-sm text-success">{retrainMessage}</p>}
          {retrainError && <p className="mt-3 text-sm text-danger">{retrainError}</p>}

          {/* Coefficients */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
              <Brain className="h-5 w-5" />
              Feature weights
            </h2>
            <p className="mt-1 text-sm text-[#5B7A70]">
              How much each factor pushes the predicted price up or down, relative to the base fare.
            </p>

            <div className="mt-4 rounded-xl border border-primary/10 bg-secondary/10 p-5">
              {!model.trained ? (
                <p className="text-sm text-[#5B7A70]">
                  No trained coefficients yet — feature weights will appear here once the model has
                  enough delivered shipments to train on.
                </p>
              ) : coefficientEntries.length === 0 ? (
                <p className="text-sm text-[#5B7A70]">No feature data available.</p>
              ) : (
                <div className="space-y-3">
                  {biasEntry && (
                    <div className="flex items-center justify-between border-b border-primary/10 pb-3 text-sm">
                      <span className="font-mono-ls text-xs tracking-wide text-primary">BASE FARE</span>
                      <span className="font-semibold text-primary">
                        ₹{Number(biasEntry[1]).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  )}
                  {coefficientEntries.map(([name, value]) => {
                    const pct = maxAbsCoefficient > 0 ? (Math.abs(value) / maxAbsCoefficient) * 100 : 0;
                    const positive = value >= 0;
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono-ls tracking-wide text-primary">
                            {vehicleLabel(name).toUpperCase()}
                          </span>
                          <span className={positive ? "text-success" : "text-danger"}>
                            {positive ? "+" : "−"}₹
                            {Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                          <div
                            className={`h-full rounded-full ${positive ? "bg-success" : "bg-danger"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Explainer */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
              <TrendingUp className="h-5 w-5" />
              How this works
            </h2>
            <div className="mt-4 rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4 text-sm text-[#5B7A70]">
              <p>
                The predictor is a ridge-regularized linear regression trained on your own delivered
                shipment history (distance, weight, vehicle type, interstate flag, insurance, and
                backhaul matching). It is used by buyers while booking, alongside the standard
                rule-based calculator for comparison, and automatically falls back to the rule-based
                estimate whenever there isn't enough training data or a prediction looks out of range.
              </p>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminAIPricing;