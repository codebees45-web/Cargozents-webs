import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import StarRating from '../components/common/StarRating';
import TripRouteMap from '../components/common/TripRouteMap';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const STATUS_LABEL = {
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const DriverTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState(null);
  const [reviewsByShipment, setReviewsByShipment] = useState({});
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [shipmentsRes, reviewsRes] = await Promise.all([
          api.get('/shipments/assigned-to-me'),
          api.get(`/reviews/user/${user.id}`),
        ]);
        if (cancelled) return;

        const all = shipmentsRes.data.shipments || [];
        setTrips(all.filter((s) => ['delivered', 'rejected', 'cancelled'].includes(s.status)));

        const byShipment = {};
        (reviewsRes.data.reviews || []).forEach((r) => {
          if (r.shipment) byShipment[r.shipment] = r;
        });
        setReviewsByShipment(byShipment);
      } catch {
        if (!cancelled) setError('Could not load your trip history.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <DashboardLayout title="Trip history" subtitle="Your completed and closed-out loads.">
      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      {trips === null ? (
        <TruckLoader fullScreen={false} />
      ) : trips.length === 0 ? (
        <EmptyState title="No trips yet" body="Once you complete a delivery, it'll show up here." />
      ) : (
        <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
          {trips.map((s) => {
            const review = reviewsByShipment[s._id];
            return (
              <li key={s._id} className="px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono-ls text-[11px] text-[#5B7A70]">
                      {s.pickup?.city} → {s.drop?.city}
                    </p>
                    <p className="mt-1 text-sm text-primary">
                      {s.goodsType} · {s.weight}kg · ₹{s.finalPrice ?? s.estimatedPrice ?? 0}
                      {s.isBackhaulMatch && <span className="ml-2 text-success">BACKHAUL MATCH</span>}
                    </p>
                    <p className="mt-1 font-mono-ls text-[10px] text-[#5B7A70]">
                      {new Date(s.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {review && <StarRating value={review.rating} size="text-sm" showValue />}
                    <span
                      className={`font-mono-ls text-[11px] ${
                        s.status === 'delivered' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {STATUS_LABEL[s.status] || s.status?.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === s._id ? null : s._id))}
                      className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/40"
                    >
                      {expandedId === s._id ? 'Hide route' : 'View route'}
                    </button>
                  </div>
                </div>

                {expandedId === s._id && <TripRouteMap shipmentId={s._id} />}
              </li>
            );
          })}
        </ul>
      )}
    </DashboardLayout>
  );
};

export default DriverTrips;