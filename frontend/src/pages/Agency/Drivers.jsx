import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import { getAgencyDrivers, lookupDriverByPhone, addAgencyDriver, removeAgencyDriver } from '../../services/agencyService';

export default function AgencyDrivers() {
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    getAgencyDrivers()
      .then(({ data }) => setDrivers(data.drivers || []))
      .catch(() => setError('Could not load your drivers right now.'));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (driverId) => {
    setBusyId(driverId);
    try {
      await removeAgencyDriver(driverId);
      setDrivers((prev) => prev.filter((d) => d._id !== driverId));
    } catch {
      setError('Could not remove that driver right now.');
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = () => setShowModal(false);

  const handleAdded = (driver) => {
    setDrivers((prev) => [driver, ...(prev || [])]);
    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-primary/10 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary font-display">Drivers Management</h1>
          <p className="text-sm text-[#5B7A70] mt-1">
            Drivers linked to your agency's fleet.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-accent hover:opacity-90 px-4 py-2.5 text-xs font-semibold text-[#0A110E] transition duration-150 self-start md:self-auto shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Onboard Driver
        </button>
      </div>

      {/* Main content */}
      {drivers === null ? (
        <p className="text-sm text-[#5B7A70]">Loading…</p>
      ) : error && !drivers.length ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : drivers.length === 0 ? (
        <EmptyState
          title="No drivers yet"
          body="Onboard a driver who already has an account on the platform, using their registered phone number."
          actionLabel="Onboard a driver"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <DriverCard
              key={driver._id}
              driver={driver}
              busy={busyId === driver._id}
              onRemove={() => handleRemove(driver._id)}
            />
          ))}
        </div>
      )}

      {error && drivers?.length > 0 && <p className="mt-4 text-xs text-amber-600">{error}</p>}

      {showModal && <OnboardDriverModal onClose={closeModal} onAdded={handleAdded} />}
    </div>
  );
}

function DriverCard({ driver, busy, onRemove }) {
  return (
    <div className="relative rounded-xl border border-primary/10 bg-secondary/20 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Top row: avatar & status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DriverAvatar photo={driver.profileImage} name={driver.name} />
          <div>
            <h3 className="font-bold text-primary text-sm">{driver.name}</h3>
            <span className="text-[11px] text-[#5B7A70] font-medium">{driver.phone}</span>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
            driver.driverProfile?.isAvailable
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}
        >
          {driver.driverProfile?.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 border-t border-gray-50 pt-3">
        <div className="flex items-center justify-between text-xs text-[#5B7A70]">
          <span className="font-medium text-[#5B7A70]">License:</span>
          <span className="font-semibold text-primary/90">
            {driver.driverProfile?.licenseNumber || 'Not on file'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#5B7A70]">
          <span className="font-medium text-[#5B7A70]">Rating:</span>
          <span className="font-semibold text-primary/90">
            {driver.driverProfile?.rating ? `${driver.driverProfile.rating.toFixed(1)} ★` : 'No ratings yet'}
            {driver.driverProfile?.reviewsCount ? ` (${driver.driverProfile.reviewsCount})` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[#5B7A70]">
          <span className="font-medium text-[#5B7A70]">Account:</span>
          <span
            className={`font-semibold ${
              driver.isSuspended ? 'text-red-500' : driver.isApproved ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {driver.isSuspended ? 'Suspended' : driver.isApproved ? 'Approved' : 'Pending approval'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2">
        <button
          onClick={onRemove}
          disabled={busy}
          className="w-full text-center py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition duration-150 border border-red-100 disabled:opacity-60"
        >
          {busy ? 'Removing…' : 'Remove from fleet'}
        </button>
      </div>
    </div>
  );
}

function DriverAvatar({ photo, name, size = 'w-10 h-10' }) {
  if (photo) {
    return <img src={photo} alt={name} className={`${size} rounded-full object-cover border border-primary/10`} />;
  }
  return (
    <div className={`${size} bg-secondary/20 border border-primary/10 rounded-full flex items-center justify-center text-[#5B7A70] font-bold`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

/**
 * Two-step onboarding modal:
 *  1. Search by phone -> preview the driver's real account (photo, name, license, rating).
 *  2. Confirm -> link them to this agency's fleet.
 * There is no field here that isn't backed by real account data — the platform
 * doesn't let an agency set a driver's name/license/photo; those live on the
 * driver's own account and are only shown here, not edited.
 */
function OnboardDriverModal({ onClose, onAdded }) {
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [preview, setPreview] = useState(null); // { driver, alreadyLinkedToUs, alreadyLinkedElsewhere }
  const [linking, setLinking] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setPreview(null);

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setSearchError('Enter a valid 10-digit phone number.');
      return;
    }

    setSearching(true);
    try {
      const { data } = await lookupDriverByPhone(phone);
      setPreview(data);
    } catch (err) {
      setSearchError(err?.response?.data?.message || 'Could not find a driver with that phone number.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    setLinking(true);
    setSearchError('');
    try {
      const { data } = await addAgencyDriver(phone);
      onAdded(data.driver);
    } catch (err) {
      setSearchError(err?.response?.data?.message || 'Could not add that driver right now.');
    } finally {
      setLinking(false);
    }
  };

  const resetSearch = () => {
    setPreview(null);
    setSearchError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all">
      <div className="bg-secondary/10 rounded-2xl max-w-md w-full shadow-xl border border-primary/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-secondary/10">
          <h2 className="text-base font-bold text-primary">Onboard Driver</h2>
          <button onClick={onClose} className="text-[#5B7A70] hover:text-[#5B7A70] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#5B7A70]">
            Drivers register their own account and profile on the platform. Look them up by phone
            number to add them to your fleet.
          </p>

          {/* Step 1: search */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold tracking-wider text-[#5B7A70] uppercase mb-2">
              Driver's Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                required
                disabled={!!preview}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary/15 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition disabled:bg-secondary/20 disabled:text-[#5B7A70]"
              />
              {preview ? (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-4 py-2 text-xs font-bold border border-primary/15 text-[#5B7A70] rounded-lg hover:bg-secondary/20 transition"
                >
                  Change
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 text-xs font-bold bg-primary text-[#0A110E] rounded-lg hover:opacity-90 transition disabled:opacity-60"
                >
                  {searching ? 'Searching…' : 'Search'}
                </button>
              )}
            </div>
          </form>

          {searchError && <p className="text-xs text-red-500">{searchError}</p>}

          {/* Step 2: preview + confirm */}
          {preview && (
            <div className="rounded-xl border border-primary/10 bg-secondary/20 p-4">
              <div className="flex items-center gap-3">
                <DriverAvatar photo={preview.driver.profileImage} name={preview.driver.name} size="w-14 h-14" />
                <div>
                  <h3 className="font-bold text-primary text-sm">{preview.driver.name}</h3>
                  <span className="text-[11px] text-[#5B7A70] font-medium">{preview.driver.phone}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-primary/15 pt-3">
                <div className="flex items-center justify-between text-xs text-[#5B7A70]">
                  <span className="font-medium text-[#5B7A70]">License:</span>
                  <span className="font-semibold text-primary/90">
                    {preview.driver.driverProfile?.licenseNumber || 'Not on file'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5B7A70]">
                  <span className="font-medium text-[#5B7A70]">Rating:</span>
                  <span className="font-semibold text-primary/90">
                    {preview.driver.driverProfile?.rating
                      ? `${preview.driver.driverProfile.rating.toFixed(1)} ★`
                      : 'No ratings yet'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5B7A70]">
                  <span className="font-medium text-[#5B7A70]">Account:</span>
                  <span
                    className={`font-semibold ${
                      preview.driver.isSuspended
                        ? 'text-red-500'
                        : preview.driver.isApproved
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {preview.driver.isSuspended
                      ? 'Suspended'
                      : preview.driver.isApproved
                      ? 'Approved'
                      : 'Pending approval'}
                  </span>
                </div>
              </div>

              {preview.alreadyLinkedElsewhere ? (
                <p className="mt-3 text-xs font-medium text-amber-600">
                  This driver already belongs to another agency and can't be added.
                </p>
              ) : preview.alreadyLinkedToUs ? (
                <p className="mt-3 text-xs font-medium text-emerald-600">This driver is already in your fleet.</p>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={linking}
                  className="mt-4 w-full py-2.5 text-xs font-bold bg-accent hover:opacity-90 text-[#0A110E] rounded-lg transition shadow-sm disabled:opacity-60"
                >
                  {linking ? 'Adding…' : 'Add to Fleet'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}