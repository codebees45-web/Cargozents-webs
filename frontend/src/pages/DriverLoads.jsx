import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import LoadCard from '../components/common/LoadCard';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Loads that still need the driver's attention or are actively underway.
// Delivered/rejected loads live on the Trip History page instead.
const ACTIVE_STATUSES = ['assigned', 'accepted', 'picked_up', 'in_transit'];

const DriverLoads = () => {
  const { user, updateUser } = useAuth();
  const [loads, setLoads] = useState(null);
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState(user?.driverProfile?.isAvailable ?? false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    api
      .get('/shipments/assigned-to-me')
      .then((res) => {
        if (cancelled) return;
        const all = res.data.shipments || [];
        setLoads(all.filter((s) => ACTIVE_STATUSES.includes(s.status)));
      })
      .catch(() => !cancelled && setError(t('driverLoads.errorGeneric')));
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLoadInList = (updated) => {
    setLoads((prev) => {
      const next = prev.map((s) => (s._id === updated._id ? updated : s));
      // Delivered/rejected loads roll off this view once their status changes.
      return next.filter((s) => ACTIVE_STATUSES.includes(s.status));
    });
  };

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await api.patch('/drivers/availability', { isAvailable: next });
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
      setIsAvailable(!next);
    }
  };

  const awaitingResponse = loads?.filter((s) => s.status === 'assigned') || [];
  const inProgress = loads?.filter((s) => s.status !== 'assigned') || [];

  return (
    <DashboardLayout title={t('driverLoads.title')} subtitle={t('driverLoads.subtitle')}>
      <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
        <div>
          <p className="font-mono-ls text-[11px] text-[#5B7A70]">{t('driverLoads.availability')}</p>
          <p className="mt-1 text-sm text-primary">
            {isAvailable ? t('driverLoads.visible') : t('driverLoads.notVisible')}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isAvailable ? 'bg-success text-dark' : 'border border-primary/20 text-primary'
          }`}
        >
          {isAvailable ? t('driverLoads.available') : t('driverLoads.goAvailable')}
        </button>
      </div>

      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">{t('driverLoads.awaitingResponseTitle')}</h2>
        <div className="mt-4">
          {loads === null ? (
            <TruckLoader fullScreen={false} />
          ) : awaitingResponse.length === 0 ? (
            <EmptyState
              title={t('driverLoads.nothingWaitingTitle')}
              body={t('driverLoads.nothingWaitingBody')}
            />
          ) : (
            <div className="space-y-4">
              {awaitingResponse.map((s) => (
                <LoadCard key={s._id} shipment={s} onUpdated={updateLoadInList} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">{t('driverLoads.inProgressTitle')}</h2>
        <div className="mt-4">
          {loads === null ? (
            <TruckLoader fullScreen={false} />
          ) : inProgress.length === 0 ? (
            <EmptyState title={t('driverLoads.noActiveLoadsTitle')} body={t('driverLoads.noActiveLoadsBody')} />
          ) : (
            <div className="space-y-4">
              {inProgress.map((s) => (
                <LoadCard key={s._id} shipment={s} onUpdated={updateLoadInList} />
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default DriverLoads;