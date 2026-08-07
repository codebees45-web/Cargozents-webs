import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import AddTruckModal from '../components/common/AddTruckModal';
import MapView from '../components/common/MapView';
import { getAgencyTrucks, addAgencyTruck, updateAgencyTruck, deleteAgencyTruck } from '../services/agencyService';
import { useTranslation } from 'react-i18next';

const isRealPoint = (coords) =>
  Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);

const TYPE_LABELS = {
  mini_truck: 'Mini Truck',
  tempo: 'Tempo',
  container: 'Container (20ft)',
  trailer: 'Trailer',
  open_body: 'Open Half Body',
  refrigerated: 'Refrigerated',
};

const AvailableTrucks = () => {
  const [trucks, setTrucks] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { t } = useTranslation();

  const load = () => {
    getAgencyTrucks()
      .then(({ data }) => setTrucks(data.trucks || []))
      .catch(() => setError(t('availableTrucks.errorGeneric')));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (payload) => {
    try {
      const { data } = await addAgencyTruck(payload);
      setTrucks((prev) => [data.truck, ...(prev || [])]);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || t('availableTrucks.errorAdd'));
    }
  };

  const handleToggleActive = async (truck) => {
    setBusyId(truck._id);
    try {
      const { data } = await updateAgencyTruck(truck._id, { isActive: !truck.isActive });
      setTrucks((prev) => prev.map((t) => (t._id === truck._id ? data.truck : t)));
    } catch {
      setError(t('availableTrucks.errorUpdate'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (truckId) => {
    setBusyId(truckId);
    try {
      await deleteAgencyTruck(truckId);
      setTrucks((prev) => prev.filter((t) => t._id !== truckId));
    } catch {
      setError(t('availableTrucks.errorRemove'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Integrated Header and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-primary/10 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary font-display">{t('availableTrucks.title')}</h1>
          <p className="text-sm text-[#5B7A70] mt-1">
            {t('availableTrucks.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-primary transition hover:shadow-glow self-start md:self-auto"
        >
          {t('availableTrucks.addNewTruck')}
        </button>
      </div>

      {/* Fleet overview map */}
      {trucks && trucks.length > 0 && (
        <div className="mb-6 rounded-xl border border-primary/10 bg-secondary/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono-ls text-[11px] tracking-wide text-primary">{t('availableTrucks.fleetMap')}</h2>
            <Link
              to="/agency/fleet-locations"
              className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
            >
              {t('availableTrucks.setLocations')}
            </Link>
          </div>
          {(() => {
            const located = trucks.filter((t) => isRealPoint(t.currentLocation?.coordinates));
            if (located.length === 0) {
              return (
                <p className="mt-3 text-sm text-[#5B7A70]">
                  {t('availableTrucks.noLocations')}
                </p>
              );
            }
            return (
              <>
                <p className="mt-1 mb-3 text-xs text-[#5B7A70]">
                  {t('availableTrucks.locationsCount', { count: located.length, total: trucks.length })}
                </p>
                <MapView
                  markers={located.map((t) => ({
                    id: t._id,
                    lat: t.currentLocation.coordinates[1],
                    lng: t.currentLocation.coordinates[0],
                    label: `${t.registrationNumber} · ${TYPE_LABELS[t.type] || t.type} · ${t.isActive ? t('availableTrucks.available') : t('availableTrucks.unavailable')}`,
                    isVehicle: true,
                  }))}
                  height="320px"
                />
              </>
            );
          })()}
        </div>
      )}

      {/* Grid and Empty States */}
      <div className="mt-6">
        {trucks === null ? (
          <p className="text-sm text-[#5B7A70]">{t('availableTrucks.loading')}</p>
        ) : error && !trucks.length ? (
          <p className="text-sm text-danger">{error}</p>
        ) : trucks.length === 0 ? (
          <EmptyState
            title={t('availableTrucks.noTrucks')}
            body={t('availableTrucks.noTrucksBody')}
            actionLabel={t('availableTrucks.addTruck')}
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trucks.map((truck) => (
              <div key={truck._id} className="rounded-xl border border-primary/10 bg-secondary/20 p-5">
                {truck.photos?.[0] && (
                  <img
                    src={truck.photos[0]}
                    alt={truck.registrationNumber}
                    className="mb-4 h-32 w-full rounded-lg border border-primary/10 object-cover"
                  />
                )}
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-bold text-primary">{truck.registrationNumber}</h3>
                  <span
                    title={truck.isActive ? t('availableTrucks.available') : t('availableTrucks.unavailable')}
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full ${truck.isActive ? 'bg-success' : 'bg-danger'}`}
                  />
                </div>
                <p className="mt-3 text-sm text-[#5B7A70]">
                  <span className="font-semibold text-primary">{t('availableTrucks.type')}</span> {TYPE_LABELS[truck.type] || truck.type}
                </p>
                <p className="mt-1 text-sm text-[#5B7A70]">
                  <span className="font-semibold text-primary">{t('availableTrucks.capacity')}</span> {truck.capacityWeight} {t('availableTrucks.tons')}
                </p>
                <p className="mt-4 border-t border-primary/10 pt-3 text-sm text-[#5B7A70]">
                  {t('availableTrucks.currentLocation')}{' '}
                  <span className="font-medium text-primary">{truck.locationLabel || t('availableTrucks.notSet')}</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(truck)}
                    disabled={busyId === truck._id}
                    className={`flex-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-60 ${
                      truck.isActive
                        ? 'border-danger/30 text-danger hover:border-danger/60'
                        : 'border-primary/15 text-primary hover:border-primary/40'
                    }`}
                  >
                    {busyId === truck._id ? '…' : truck.isActive ? t('availableTrucks.markUnavailable') : t('availableTrucks.markAvailable')}
                  </button>
                  <button
                    onClick={() => handleDelete(truck._id)}
                    disabled={busyId === truck._id}
                    className="rounded-full border border-primary/15 px-3 py-1.5 text-[11px] font-semibold text-primary/70 transition hover:border-danger/40 hover:text-danger disabled:opacity-60"
                  >
                    {t('availableTrucks.remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && trucks?.length > 0 && <p className="mt-4 text-xs text-warning">{error}</p>}

      {showModal && <AddTruckModal onSubmit={handleAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default AvailableTrucks;