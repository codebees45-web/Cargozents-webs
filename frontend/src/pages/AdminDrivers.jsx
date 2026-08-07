import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import StarRating from '../components/common/StarRating';
import api from '../services/api';

const TABS = [
  { value: 'documents', label: 'Documents to review' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'drivers', label: 'Drivers' },
];

const DOC_LABEL = {
  driving_license: 'Driving License',
  selfie: 'Selfie',
  rc: 'RC',
  permit: 'Permit',
  insurance: 'Insurance',
  vehicle_photo: 'Vehicle Photo',
};

const SearchBox = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-64 rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-xs text-primary outline-none focus:border-primary/60"
  />
);

const BulkBar = ({ count, onClear, children }) => {
  if (count === 0) return null;
  return (
    <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/20 bg-accent/20 px-4 py-2">
      <span className="font-mono-ls text-[11px] tracking-wide text-primary">{count} SELECTED</span>
      <div className="flex items-center gap-2">
        {children}
        <button onClick={onClear} className="text-xs text-[#5B7A70] hover:underline">
          Clear
        </button>
      </div>
    </div>
  );
};

const DocumentRow = ({ doc, selected, onToggle, onReviewed }) => {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const review = async (status) => {
    if (status === 'rejected' && !rejecting) {
      setRejecting(true);
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/documents/${doc._id}/review`, {
        status,
        rejectionReason: status === 'rejected' ? reason : undefined,
      });
      onReviewed(data.document);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-primary/10 bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(doc._id)}
            className="mt-1 h-4 w-4 rounded border-primary/30 accent-primary"
          />
          <div>
            <p className="text-sm text-primary">
              {DOC_LABEL[doc.type] || doc.type}
              {doc.vehicle?.registrationNumber && ` · ${doc.vehicle.registrationNumber}`}
            </p>
            <p className="mt-1 text-xs text-[#5B7A70]">
              {doc.owner?.name} · {doc.owner?.phone} ·{' '}
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                View file
              </a>
              {doc.expiryDate && ` · Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            disabled={busy}
            onClick={() => review('approved')}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => review('rejected')}
            className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>
      {rejecting && (
        <div className="mt-3 flex gap-2 pl-7">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            className="flex-1 rounded-lg border border-primary/15 bg-secondary/40 px-3 py-1.5 text-xs text-primary outline-none focus:border-primary/60"
          />
          <button
            disabled={busy || !reason}
            onClick={() => review('rejected')}
            className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            Confirm reject
          </button>
        </div>
      )}
    </div>
  );
};

const AdminDrivers = () => {
  const [tab, setTab] = useState('documents');
  const [documents, setDocuments] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState('');

  const [docSearch, setDocSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [selectedDrivers, setSelectedDrivers] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadDocuments = () => api.get('/admin/documents?status=pending').then(({ data }) => setDocuments(data.documents || []));
  const loadVehicles = () => api.get('/admin/vehicles').then(({ data }) => setVehicles(data.vehicles || []));
  const loadDrivers = () => api.get('/admin/drivers').then(({ data }) => setDrivers(data.drivers || []));

  useEffect(() => {
    Promise.all([loadDocuments(), loadVehicles(), loadDrivers()]).catch(() => setError('Could not load verification data.'));
  }, []);

  const handleReviewed = (updatedDoc) => {
    setDocuments((prev) => prev.filter((d) => d._id !== updatedDoc._id));
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      next.delete(updatedDoc._id);
      return next;
    });
    loadVehicles(); // a document approval may change a vehicle's overall standing
  };

  const setVehicleVerified = async (id, isVerified) => {
    const { data } = await api.patch(`/admin/vehicles/${id}/verify`, { isVerified });
    setVehicles((prev) => prev.map((v) => (v._id === id ? data.vehicle : v)));
  };

  const setDriverVerified = async (id, isApproved) => {
    const { data } = await api.patch(`/admin/drivers/${id}/verify`, { isApproved });
    setDrivers((prev) => prev.map((d) => (d._id === id ? data.driver : d)));
  };

  const setDriverSuspended = async (id, isSuspended) => {
    const { data } = await api.patch(`/admin/drivers/${id}/suspend`, { isSuspended });
    setDrivers((prev) => prev.map((d) => (d._id === id ? data.driver : d)));
  };

  const toggleSet = (setter) => (id) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleDoc = toggleSet(setSelectedDocs);
  const toggleVehicle = toggleSet(setSelectedVehicles);
  const toggleDriver = toggleSet(setSelectedDrivers);

  const bulkApproveDocs = async (status) => {
    if (selectedDocs.size === 0) return;
    setBulkBusy(true);
    try {
      await api.patch('/admin/documents/bulk-review', { ids: Array.from(selectedDocs), status });
      setDocuments((prev) => prev.filter((d) => !selectedDocs.has(d._id)));
      setSelectedDocs(new Set());
      loadVehicles();
    } catch {
      setError('Bulk document review failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkVerifyVehicles = async (isVerified) => {
    if (selectedVehicles.size === 0) return;
    setBulkBusy(true);
    try {
      const { data } = await api.patch('/admin/vehicles/bulk-verify', { ids: Array.from(selectedVehicles), isVerified });
      const updatedIds = new Set(data.vehicles.map((v) => v._id));
      setVehicles((prev) => prev.map((v) => (updatedIds.has(v._id) ? { ...v, isVerified } : v)));
      setSelectedVehicles(new Set());
    } catch {
      setError('Bulk vehicle verification failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkVerifyDrivers = async (isApproved) => {
    if (selectedDrivers.size === 0) return;
    setBulkBusy(true);
    try {
      const { data } = await api.patch('/admin/drivers/bulk-verify', { ids: Array.from(selectedDrivers), isApproved });
      const updatedIds = new Set(data.drivers.map((d) => d._id));
      setDrivers((prev) => prev.map((d) => (updatedIds.has(d._id) ? { ...d, isApproved } : d)));
      setSelectedDrivers(new Set());
    } catch {
      setError('Bulk driver approval failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    const q = docSearch.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.owner?.name?.toLowerCase().includes(q) ||
        d.owner?.phone?.toLowerCase().includes(q) ||
        d.vehicle?.registrationNumber?.toLowerCase().includes(q) ||
        (DOC_LABEL[d.type] || d.type || '').toLowerCase().includes(q)
    );
  }, [documents, docSearch]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.registrationNumber?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.driver?.name?.toLowerCase().includes(q) ||
        v.driver?.phone?.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch]);

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    const q = driverSearch.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) => d.name?.toLowerCase().includes(q) || d.phone?.toLowerCase().includes(q));
  }, [drivers, driverSearch]);

  return (
    <DashboardLayout title="Driver verification" subtitle="Review documents and approve drivers and vehicles for the network.">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
              tab === t.value ? 'border-primary bg-primary text-white' : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      <div className="mt-6">
        {tab === 'documents' && (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <SearchBox value={docSearch} onChange={setDocSearch} placeholder="Search name, phone, reg #…" />
              {documents && documents.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-[#5B7A70]">
                  <input
                    type="checkbox"
                    checked={filteredDocs.length > 0 && filteredDocs.every((d) => selectedDocs.has(d._id))}
                    onChange={(e) =>
                      setSelectedDocs(e.target.checked ? new Set(filteredDocs.map((d) => d._id)) : new Set())
                    }
                    className="h-4 w-4 rounded border-primary/30 accent-primary"
                  />
                  Select all
                </label>
              )}
            </div>
            <BulkBar count={selectedDocs.size} onClear={() => setSelectedDocs(new Set())}>
              <button
                disabled={bulkBusy}
                onClick={() => bulkApproveDocs('approved')}
                className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
              >
                Approve selected
              </button>
              <button
                disabled={bulkBusy}
                onClick={() => bulkApproveDocs('rejected')}
                className="rounded-lg border border-danger/40 px-3 py-1 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-60"
              >
                Reject selected
              </button>
            </BulkBar>

            {documents === null ? (
              <TruckLoader fullScreen={false} />
            ) : filteredDocs.length === 0 ? (
              <EmptyState
                title={documents.length === 0 ? 'Nothing pending' : 'No matches'}
                body={
                  documents.length === 0
                    ? 'New driver/vehicle document submissions will show up here for review.'
                    : 'No documents match your search.'
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <DocumentRow
                    key={doc._id}
                    doc={doc}
                    selected={selectedDocs.has(doc._id)}
                    onToggle={toggleDoc}
                    onReviewed={handleReviewed}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'vehicles' && (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <SearchBox value={vehicleSearch} onChange={setVehicleSearch} placeholder="Search reg #, type, driver…" />
              {vehicles && vehicles.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-[#5B7A70]">
                  <input
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && filteredVehicles.every((v) => selectedVehicles.has(v._id))}
                    onChange={(e) =>
                      setSelectedVehicles(e.target.checked ? new Set(filteredVehicles.map((v) => v._id)) : new Set())
                    }
                    className="h-4 w-4 rounded border-primary/30 accent-primary"
                  />
                  Select all
                </label>
              )}
            </div>
            <BulkBar count={selectedVehicles.size} onClear={() => setSelectedVehicles(new Set())}>
              <button
                disabled={bulkBusy}
                onClick={() => bulkVerifyVehicles(true)}
                className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
              >
                Verify selected
              </button>
              <button
                disabled={bulkBusy}
                onClick={() => bulkVerifyVehicles(false)}
                className="rounded-lg border border-danger/40 px-3 py-1 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-60"
              >
                Revoke selected
              </button>
            </BulkBar>

            {vehicles === null ? (
              <TruckLoader fullScreen={false} />
            ) : filteredVehicles.length === 0 ? (
              <EmptyState
                title={vehicles.length === 0 ? 'No vehicles registered yet' : 'No matches'}
                body={vehicles.length === 0 ? 'Vehicles registered by drivers will appear here.' : 'No vehicles match your search.'}
              />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {filteredVehicles.map((v) => (
                  <li key={v._id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.has(v._id)}
                        onChange={() => toggleVehicle(v._id)}
                        className="h-4 w-4 rounded border-primary/30 accent-primary"
                      />
                      <span className="font-mono-ls text-xs text-primary">
                        {v.registrationNumber} · {v.type.replace('_', ' ')} · {v.driver?.name} · {v.driver?.phone}
                      </span>
                    </div>
                    <button
                      onClick={() => setVehicleVerified(v._id, !v.isVerified)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        v.isVerified ? 'border border-danger/40 text-danger hover:bg-danger/10' : 'bg-accent text-primary hover:shadow-glow'
                      }`}
                    >
                      {v.isVerified ? 'Revoke verification' : 'Verify vehicle'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === 'drivers' && (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <SearchBox value={driverSearch} onChange={setDriverSearch} placeholder="Search name or phone…" />
              {drivers && drivers.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-[#5B7A70]">
                  <input
                    type="checkbox"
                    checked={filteredDrivers.length > 0 && filteredDrivers.every((d) => selectedDrivers.has(d._id))}
                    onChange={(e) =>
                      setSelectedDrivers(e.target.checked ? new Set(filteredDrivers.map((d) => d._id)) : new Set())
                    }
                    className="h-4 w-4 rounded border-primary/30 accent-primary"
                  />
                  Select all
                </label>
              )}
            </div>
            <BulkBar count={selectedDrivers.size} onClear={() => setSelectedDrivers(new Set())}>
              <button
                disabled={bulkBusy}
                onClick={() => bulkVerifyDrivers(true)}
                className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
              >
                Approve selected
              </button>
            </BulkBar>

            {drivers === null ? (
              <TruckLoader fullScreen={false} />
            ) : filteredDrivers.length === 0 ? (
              <EmptyState
                title={drivers.length === 0 ? 'No drivers yet' : 'No matches'}
                body={drivers.length === 0 ? 'Registered drivers will appear here.' : 'No drivers match your search.'}
              />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {filteredDrivers.map((d) => (
                  <li key={d._id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDrivers.has(d._id)}
                        onChange={() => toggleDriver(d._id)}
                        className="h-4 w-4 rounded border-primary/30 accent-primary"
                      />
                      <div>
                        <span className="font-mono-ls text-xs text-primary">
                          {d.name} · {d.phone}
                          {d.isSuspended && <span className="ml-2 text-danger">SUSPENDED</span>}
                        </span>
                        <div className="mt-1">
                          <StarRating value={d.driverProfile?.rating || 0} size="text-xs" showValue />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDriverVerified(d._id, !d.isApproved)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          d.isApproved ? 'border border-primary/20 text-primary' : 'bg-accent text-primary hover:shadow-glow'
                        }`}
                      >
                        {d.isApproved ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setDriverSuspended(d._id, !d.isSuspended)}
                        className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10"
                      >
                        {d.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDrivers;