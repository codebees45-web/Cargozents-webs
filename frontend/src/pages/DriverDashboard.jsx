import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import LoadCard from '../components/common/LoadCard';
import StarRating from '../components/common/StarRating';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const DriverDashboard = () => {
  const { user, updateUser } = useAuth();
  const [assignedLoads, setAssignedLoads] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.driverProfile?.isAvailable ?? false);
  const { t } = useTranslation();

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
      // Update global context so the state persists across page changes
      if (updateUser && user) {
        updateUser({
          ...user,
          driverProfile: {
            ...user.driverProfile,
            isAvailable: next,
          },
        });
      }
    } catch {
      setIsAvailable(!next); // revert on failure
    }
  };

  return (
    <DashboardLayout title={t('driverDashboard.title', { name: user?.name?.split(' ')[0] || '' })} subtitle={t('driverDashboard.subtitle')}>
      <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
        <div>
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">{t('driverDashboard.availability')}</p>
          <p className="mt-1 text-sm text-primary">
            {isAvailable ? t('driverDashboard.visible') : t('driverDashboard.notVisible')}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isAvailable ? 'bg-success text-dark' : 'border border-primary/20 text-primary'
          }`}
        >
          {isAvailable ? t('driverDashboard.available') : t('driverDashboard.goAvailable')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatField label={t('driverDashboard.awaitingResponse')} value={assignedLoads === null ? '—' : pendingResponse} />
        <StatField label={t('driverDashboard.activeLoads')} value={assignedLoads === null ? '—' : activeLoads} />
        <StatField label={t('driverDashboard.delivered')} value={assignedLoads === null ? '—' : deliveredLoads} />
        <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
          <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{t('driverDashboard.yourRating')}</p>
          <div className="mt-2">
            <StarRating value={user?.driverProfile?.rating || 0} size="text-base" showValue />
          </div>
          <p className="mt-1 font-mono-ls text-[10px] text-[#5B7A70]">
            {user?.driverProfile?.reviewsCount || 0} {user?.driverProfile?.reviewsCount === 1 ? t('driverDashboard.review') : t('driverDashboard.reviews')}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">{t('driverDashboard.assignedLoads')}</h2>
        <div className="mt-4">
          {assignedLoads === null ? (
            <TruckLoader fullScreen={false} />
          ) : assignedLoads.length === 0 ? (
            <EmptyState
              title={t('driverDashboard.noLoadsTitle')}
              body={t('driverDashboard.noLoadsBody')}
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