import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import LoadCard from '../components/common/LoadCard';
import StarRating from '../components/common/StarRating';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const DriverDashboard = () => {
  const { user } = useAuth();
  const [assignedLoads, setAssignedLoads] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.driverProfile?.isAvailable ?? false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/shipments/assigned-to-me')
      .then((res) => !cancelled && setAssignedLoads(res.data.shipments || []))
      .catch(() => !cancelled && setAssignedLoads([]));
    return () => { cancelled = true; };
  }, []);

  const updateShipmentInList = (updated) => {
    setAssignedLoads((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
  };

  const pendingResponse = assignedLoads?.filter((s) => s.status === 'assigned').length ?? 0;
  const activeLoads = assignedLoads?.filter((s) => ['accepted', 'picked_up', 'in_transit'].includes(s.status)).length ?? 0;
  const deliveredLoads = assignedLoads?.filter((s) => s.status === 'delivered').length ?? 0;

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await api.patch('/drivers/availability', { isAvailable: next });
    } catch {
      setIsAvailable(!next); // revert on failure
    }
  };

  return (
    <DashboardLayout title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`} subtitle="Manage your loads and earnings.">
      <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
        <div>
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">AVAILABILITY</p>
          <p className="mt-1 text-sm text-primary">
            {isAvailable ? 'You\u2019re visible for new loads' : 'You\u2019re not accepting loads right now'}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isAvailable ? 'bg-success text-dark' : 'border border-primary/20 text-primary'
          }`}
        >
          {isAvailable ? 'Available' : 'Go available'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatField label="AWAITING RESPONSE" value={assignedLoads === null ? '—' : pendingResponse} />
        <StatField label="ACTIVE LOADS" value={assignedLoads === null ? '—' : activeLoads} />
        <StatField label="DELIVERED" value={assignedLoads === null ? '—' : deliveredLoads} />
        <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
          <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">YOUR RATING</p>
          <div className="mt-2">
            <StarRating value={user?.driverProfile?.rating || 0} size="text-base" showValue />
          </div>
          <p className="mt-1 font-mono-ls text-[10px] text-[#5B7A70]">
            {user?.driverProfile?.reviewsCount || 0} review{user?.driverProfile?.reviewsCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">Assigned loads</h2>
        <div className="mt-4">
          {assignedLoads === null ? (
            <TruckLoader fullScreen={false} />
          ) : assignedLoads.length === 0 ? (
            <EmptyState
              title="No loads assigned yet"
              body="Go available and the admin will match you with a nearby shipment — especially useful for your return leg."
            />
          ) : (
            <div className="space-y-4">
              {assignedLoads.map((s) => (
                <LoadCard key={s._id} shipment={s} onUpdated={updateShipmentInList} />
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default DriverDashboard;