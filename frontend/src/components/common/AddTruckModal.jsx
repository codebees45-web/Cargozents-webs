import { useRef, useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

const TYPE_OPTIONS = [
  { value: 'mini_truck', label: 'Mini Truck' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'container', label: 'Container (20ft)' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'open_body', label: 'Open Half Body' },
  { value: 'refrigerated', label: 'Refrigerated' },
];

const MAX_DIMENSION = 900;
const MAX_FILE_MB = 8;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const UploadSlot = ({ label, value, onChange, hint }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Keep it under ${MAX_FILE_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || 'Could not load that image.');
    }
  };

  return (
    <div>
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
      <div className="mt-1.5">
        {value ? (
          <div className="relative w-full overflow-hidden rounded-lg border border-primary/15 bg-secondary/40">
            <img src={value} alt={label} className="h-28 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-primary/50 p-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-white/20"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-danger/60"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-primary/25 bg-secondary/40 px-3 py-6 text-center transition hover:border-primary/50"
          >
            <span className="text-xs font-semibold text-primary">Click to upload</span>
            {hint && <span className="text-[10px] text-[#5B7A70]">{hint}</span>}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
};

const AddTruckModal = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    registrationNumber: '',
    type: 'container',
    capacityWeight: '',
    locationLabel: '',
  });
  const [photo, setPhoto] = useState('');
  const [rcBook, setRcBook] = useState('');
  const [insurance, setInsurance] = useState('');
  const [permit, setPermit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        capacityWeight: Number(form.capacityWeight),
        photos: photo ? [photo] : [],
        documents: { rcBook, insurance, permit },
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add this truck right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-primary/40 px-4 py-8" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-primary/10 bg-background p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-semibold text-primary">Add a new truck</h3>
        <p className="mt-1 text-sm text-[#5B7A70]">Register a vehicle to your fleet, with its verification documents.</p>

        <div className="mt-5 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Vehicle number"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. TN-01-AB-1234"
            />
            <FormSelect label="Type" name="type" value={form.type} onChange={handleChange} options={TYPE_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Capacity (tons)"
              name="capacityWeight"
              type="number"
              value={form.capacityWeight}
              onChange={handleChange}
              placeholder="10"
            />
            <FormInput
              label="Current location"
              name="locationLabel"
              value={form.locationLabel}
              onChange={handleChange}
              placeholder="e.g. Chennai Hub"
              required={false}
            />
          </div>

          <div className="mt-2 border-t border-primary/10 pt-4">
            <p className="font-mono-ls text-[11px] tracking-wide text-primary">TRUCK PHOTO</p>
            <div className="mt-2">
              <UploadSlot label="PHOTO" value={photo} onChange={setPhoto} hint="Front or side view" />
            </div>
          </div>

          <div className="border-t border-primary/10 pt-4">
            <p className="font-mono-ls text-[11px] tracking-wide text-primary">VERIFICATION DOCUMENTS</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <UploadSlot label="RC BOOK" value={rcBook} onChange={setRcBook} />
              <UploadSlot label="INSURANCE" value={insurance} onChange={setInsurance} />
              <UploadSlot label="PERMIT" value={permit} onChange={setPermit} />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-primary/15 px-4 py-2 text-xs text-primary/70 transition hover:border-primary/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Add truck'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTruckModal;