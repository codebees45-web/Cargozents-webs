import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import api from '../services/api';
import { verifyDocumentWithParivahan } from '../services/driverService';
const VEHICLE_OPTIONS = [
  { value: 'mini_truck', label: 'Mini Truck' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'open_body', label: 'Open Body Truck' },
  { value: 'container', label: 'Container Truck' },
  { value: 'trailer', label: 'Trailer' },
];

const DOC_TYPES = {
  driving_license: { label: 'Driving License', vehicleScoped: false },
  selfie: { label: 'Selfie', vehicleScoped: false },
  rc: { label: 'RC (Registration Certificate)', vehicleScoped: true },
  permit: { label: 'Permit', vehicleScoped: true },
  insurance: { label: 'Insurance', vehicleScoped: true },
  vehicle_photo: { label: 'Vehicle Photo', vehicleScoped: true },
};

const STATUS_STYLES = { pending: 'text-warning', approved: 'text-success', rejected: 'text-danger' };

const PARIVAHAN_LABEL = {
  verified: { text: 'Parivahan: verified', cls: 'text-success' },
  name_mismatch: { text: 'Parivahan: name mismatch — admin will review', cls: 'text-danger' },
  owner_mismatch: { text: 'Parivahan: owner mismatch — admin will review', cls: 'text-danger' },
  invalid_or_expired: { text: 'Parivahan: expired/invalid', cls: 'text-danger' },
  invalid_or_cancelled: { text: 'Parivahan: RC cancelled', cls: 'text-danger' },
  failed: { text: 'Parivahan check failed — try again', cls: 'text-warning' },
};
const DriverDocuments = () => {
  const [vehicles, setVehicles] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState('');

  const [vehicleForm, setVehicleForm] = useState({ registrationNumber: '', type: '', capacityWeight: '', capacityVolume: '' });
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);

  const [docForm, setDocForm] = useState({ type: '', fileUrl: '', vehicleId: '', expiryDate: '' });
  const [docSubmitting, setDocSubmitting] = useState(false);

  const [verifyDobFor, setVerifyDobFor] = useState(null); // document id currently asking for DOB
  const [dobInput, setDobInput] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);

  const loadAll = () => {
    Promise.all([api.get('/drivers/vehicles/mine'), api.get('/drivers/documents/mine')])
      .then(([vRes, dRes]) => {
        setVehicles(vRes.data.vehicles || []);
        setDocuments(dRes.data.documents || []);
      })
      .catch(() => setError('Could not load your vehicles/documents.'));
  };

  useEffect(loadAll, []);

  const submitVehicle = async (e) => {
    e.preventDefault();
    setVehicleSubmitting(true);
    setError('');
    try {
      await api.post('/drivers/vehicles', {
        ...vehicleForm,
        capacityWeight: Number(vehicleForm.capacityWeight),
        capacityVolume: vehicleForm.capacityVolume ? Number(vehicleForm.capacityVolume) : undefined,
      });
      setVehicleForm({ registrationNumber: '', type: '', capacityWeight: '', capacityVolume: '' });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register this vehicle.');
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    setDocSubmitting(true);
    setError('');
    try {
      const isVehicleScoped = DOC_TYPES[docForm.type]?.vehicleScoped;
      await api.post('/drivers/documents', {
        type: docForm.type,
        fileUrl: docForm.fileUrl,
        vehicleId: isVehicleScoped ? docForm.vehicleId : undefined,
        expiryDate: docForm.expiryDate || undefined,
      });
      setDocForm({ type: '', fileUrl: '', vehicleId: '', expiryDate: '' });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit this document.');
    } finally {
      setDocSubmitting(false);
    }
  };

  const isVehicleScoped = DOC_TYPES[docForm.type]?.vehicleScoped;

  const runParivahanCheck = async (doc, dob) => {
    setError('');
    setVerifyingId(doc._id);
    try {
      await verifyDocumentWithParivahan(doc._id, doc.type === 'driving_license' ? { dob } : {});
      setVerifyDobFor(null);
      setDobInput('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Parivahan check failed.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <DashboardLayout title="Vehicles & documents" subtitle="Get verified to start receiving load matches.">
      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Vehicle registration */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Register a vehicle</h2>
          <form onSubmit={submitVehicle} className="mt-4 space-y-4 rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <FormInput
              label="REGISTRATION NUMBER"
              name="registrationNumber"
              value={vehicleForm.registrationNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
              placeholder="TN01AB1234"
            />
            <FormSelect
              label="VEHICLE TYPE"
              name="type"
              value={vehicleForm.type}
              onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
              options={VEHICLE_OPTIONS}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="CAPACITY (KG)"
                type="number"
                name="capacityWeight"
                value={vehicleForm.capacityWeight}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacityWeight: e.target.value })}
                placeholder="1500"
              />
              <FormInput
                label="VOLUME (M³, OPTIONAL)"
                type="number"
                name="capacityVolume"
                value={vehicleForm.capacityVolume}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacityVolume: e.target.value })}
                placeholder="8"
                required={false}
              />
            </div>
            <button
              type="submit"
              disabled={vehicleSubmitting}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
            >
              {vehicleSubmitting ? 'Registering…' : 'Register vehicle'}
            </button>
          </form>

          <div className="mt-6">
            {vehicles === null ? (
              <TruckLoader fullScreen={false} />
            ) : vehicles.length === 0 ? (
              <EmptyState title="No vehicles yet" body="Register your first vehicle above to start uploading its documents." />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {vehicles.map((v) => (
                  <li key={v._id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono-ls text-xs text-primary">
                      {v.registrationNumber} · {v.type.replace('_', ' ')}
                    </span>
                    <span className={`font-mono-ls text-[11px] ${v.isVerified ? 'text-success' : 'text-warning'}`}>
                      {v.isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Document upload */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Upload a document</h2>
          <form onSubmit={submitDocument} className="mt-4 space-y-4 rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <FormSelect
              label="DOCUMENT TYPE"
              name="type"
              value={docForm.type}
              onChange={(e) => setDocForm({ ...docForm, type: e.target.value, vehicleId: '' })}
              options={Object.entries(DOC_TYPES).map(([value, { label }]) => ({ value, label }))}
            />
            {isVehicleScoped && (
              <FormSelect
                label="VEHICLE"
                name="vehicleId"
                value={docForm.vehicleId}
                onChange={(e) => setDocForm({ ...docForm, vehicleId: e.target.value })}
                options={(vehicles || []).map((v) => ({ value: v._id, label: `${v.registrationNumber} (${v.type.replace('_', ' ')})` }))}
                placeholder={vehicles?.length ? 'Select a vehicle' : 'Register a vehicle first'}
              />
            )}
            <FormInput
              label="FILE URL"
              name="fileUrl"
              value={docForm.fileUrl}
              onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
              placeholder="https://…"
            />
            <p className="-mt-2 text-[11px] text-[#5B7A70]">
              Upload the scanned document to any image host (or your Cloudinary account) and paste the resulting link here.
              A built-in upload widget is next on the roadmap.
            </p>
            <FormInput
              label="EXPIRY DATE (IF APPLICABLE)"
              type="date"
              name="expiryDate"
              value={docForm.expiryDate}
              onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
              required={false}
            />
            <button
              type="submit"
              disabled={docSubmitting || (isVehicleScoped && !vehicles?.length)}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
            >
              {docSubmitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </form>

          <div className="mt-6">
            {documents === null ? (
              <TruckLoader fullScreen={false} />
            ) : documents.length === 0 ? (
              <EmptyState title="No documents submitted yet" body="Submitted documents will appear here with their review status." />
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {documents.map((d) => {
                  const canVerify = d.type === 'driving_license' || d.type === 'rc';
                  const badge = d.parivahan?.checked ? PARIVAHAN_LABEL[d.parivahan.status] : null;
                  const askingDob = verifyDobFor === d._id;
                  return (
                    <li key={d._id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-ls text-xs text-primary">
                          {DOC_TYPES[d.type]?.label || d.type}
                          {d.vehicle?.registrationNumber && ` · ${d.vehicle.registrationNumber}`}
                        </span>
                        <div className="flex items-center gap-3">
                          {canVerify && (
                            <button
                              type="button"
                              disabled={verifyingId === d._id}
                              onClick={() =>
                                d.type === 'driving_license' ? setVerifyDobFor(d._id) : runParivahanCheck(d)
                              }
                              className="text-[11px] font-semibold text-primary underline decoration-dotted disabled:opacity-60"
                            >
                              {verifyingId === d._id
                                ? 'Checking…'
                                : d.parivahan?.checked
                                ? 'Re-check via Parivahan'
                                : 'Verify via Parivahan'}
                            </button>
                          )}
                          <span className={`font-mono-ls text-[11px] ${STATUS_STYLES[d.status]}`}>
                            {d.status.toUpperCase()}
                            {d.status === 'rejected' && d.rejectionReason ? ` — ${d.rejectionReason}` : ''}
                          </span>
                        </div>
                      </div>
                      {badge && <p className={`mt-1 text-[11px] ${badge.cls}`}>{badge.text}</p>}
                      {askingDob && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="date"
                            value={dobInput}
                            onChange={(e) => setDobInput(e.target.value)}
                            className="rounded-lg border border-primary/15 bg-secondary/10 px-3 py-1.5 text-xs text-primary outline-none focus:border-primary/60"
                          />
                          <button
                            type="button"
                            disabled={!dobInput || verifyingId === d._id}
                            onClick={() => runParivahanCheck(d, dobInput)}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-60"
                          >
                            Confirm DOB &amp; verify
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DriverDocuments;
