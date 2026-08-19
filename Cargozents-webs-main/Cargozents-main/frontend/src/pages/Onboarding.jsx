import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import { useAuth } from '../hooks/useAuth';
import { completeProfile } from '../services/authService';

const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  agency: '/agency/dashboard',
};

const MAX_DIMENSION = 700;
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

const PhotoUpload = ({ label, value, onChange, round = true }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Keep it under ${MAX_FILE_MB}MB.`);
      return;
    }
    try {
      onChange(await fileToDataUrl(file));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
      <div className="mt-1.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-primary/25 bg-secondary/40 text-[10px] text-[#5B7A70] transition hover:border-primary/50 ${
            round ? 'rounded-full' : 'rounded-lg'
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center">UPLOAD</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-danger hover:underline"
          >
            Remove photo
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="font-mono-ls text-[11px] tracking-wide text-primary">{children}</p>
);

const BuyerForm = ({ photo, setPhoto, data, setData }) => (
  <>
    <PhotoUpload label="PROFILE PHOTO" value={photo} onChange={setPhoto} />
    <SectionLabel>DELIVERY ADDRESS</SectionLabel>
    <FormInput
      label="ADDRESS"
      value={data.address}
      onChange={(e) => setData({ ...data, address: e.target.value })}
      placeholder="House / flat, street"
    />
    <div className="grid grid-cols-2 gap-3">
      <FormInput label="CITY" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="City" />
      <FormInput label="STATE" value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} placeholder="State" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <FormInput label="PINCODE" value={data.pincode} onChange={(e) => setData({ ...data, pincode: e.target.value })} placeholder="600001" />
      <FormInput
        label="ALTERNATE PHONE"
        value={data.alternatePhone}
        onChange={(e) => setData({ ...data, alternatePhone: e.target.value })}
        placeholder="Optional"
        required={false}
      />
    </div>
  </>
);

const shipperModes = [
  { value: 'catalog', label: 'Sell products from a catalog' },
  { value: 'raw_shipment', label: 'Post one-off shipments' },
  { value: 'both', label: 'Both' },
];

const ShipperForm = ({ photo, setPhoto, data, setData }) => (
  <>
    <PhotoUpload label="BUSINESS LOGO / PHOTO" value={photo} onChange={setPhoto} round={false} />
    <div>
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">WHAT YOU'LL DO</span>
      <select
        value={data.shipperMode}
        onChange={(e) => setData({ ...data, shipperMode: e.target.value })}
        className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/60"
      >
        {shipperModes.map((m) => (
          <option key={m.value} value={m.value} className="bg-secondary">
            {m.label}
          </option>
        ))}
      </select>
    </div>
    <SectionLabel>DEFAULT PICKUP ADDRESS</SectionLabel>
    <FormInput
      label="WAREHOUSE / DISPATCH ADDRESS"
      value={data.address}
      onChange={(e) => setData({ ...data, address: e.target.value })}
      placeholder="Address"
    />
    <div className="grid grid-cols-3 gap-3">
      <FormInput label="CITY" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="City" />
      <FormInput label="STATE" value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} placeholder="State" />
      <FormInput label="PINCODE" value={data.pincode} onChange={(e) => setData({ ...data, pincode: e.target.value })} placeholder="600001" />
    </div>
  </>
);

const DriverForm = ({ photo, setPhoto, license, setLicense, idProof, setIdProof, data, setData }) => (
  <>
    <PhotoUpload label="DRIVER PHOTO (SELFIE)" value={photo} onChange={setPhoto} />
    <FormInput
      label="DRIVING LICENSE NUMBER"
      value={data.licenseNumber}
      onChange={(e) => setData({ ...data, licenseNumber: e.target.value })}
      placeholder="TN01 20230012345"
    />
    <div className="grid grid-cols-2 gap-3">
      <PhotoUpload label="LICENSE PHOTO" value={license} onChange={setLicense} round={false} />
      <PhotoUpload label="ID PROOF (AADHAAR/VOTER ID)" value={idProof} onChange={setIdProof} round={false} />
    </div>
    <p className="text-[11px] text-[#5B7A70]">
      You can register your vehicle separately from Documents once you're on your dashboard.
    </p>
  </>
);

const AgencyForm = ({ photo, setPhoto, data, setData }) => (
  <>
    <PhotoUpload label="COMPANY LOGO" value={photo} onChange={setPhoto} round={false} />
    <FormInput
      label="COMPANY NAME"
      value={data.companyName}
      onChange={(e) => setData({ ...data, companyName: e.target.value })}
      placeholder="e.g. Bharat Fleet Logistics"
    />
    <FormInput
      label="GST / REGISTRATION NUMBER"
      value={data.gstNumber}
      onChange={(e) => setData({ ...data, gstNumber: e.target.value })}
      placeholder="22AAAAA0000A1Z5"
      required={false}
    />
    <SectionLabel>OFFICE / WAREHOUSE ADDRESS</SectionLabel>
    <FormInput
      label="ADDRESS LINE"
      value={data.line1}
      onChange={(e) => setData({ ...data, line1: e.target.value })}
      placeholder="Address"
      required={false}
    />
    <div className="grid grid-cols-3 gap-3">
      <FormInput label="CITY" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} placeholder="City" required={false} />
      <FormInput label="STATE" value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} placeholder="State" required={false} />
      <FormInput label="PINCODE" value={data.pincode} onChange={(e) => setData({ ...data, pincode: e.target.value })} placeholder="600001" required={false} />
    </div>
  </>
);

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState('');
  const [license, setLicense] = useState('');
  const [idProof, setIdProof] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [buyerData, setBuyerData] = useState({ address: '', city: '', state: '', pincode: '', alternatePhone: '' });
  const [shipperData, setShipperData] = useState({ shipperMode: user?.shipperMode || 'both', address: '', city: '', state: '', pincode: '' });
  const [driverData, setDriverData] = useState({ licenseNumber: '' });
  const [agencyData, setAgencyData] = useState({ companyName: user?.name || '', gstNumber: '', line1: '', city: '', state: '', pincode: '' });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { profileImage: photo };

      if (user.role === 'buyer') {
        payload.buyerProfile = {
          deliveryAddress: {
            address: buyerData.address,
            city: buyerData.city,
            state: buyerData.state,
            pincode: buyerData.pincode,
          },
          alternatePhone: buyerData.alternatePhone,
        };
      }
      if (user.role === 'shipper') {
        payload.shipperProfile = {
          shipperMode: shipperData.shipperMode,
          pickupAddress: {
            address: shipperData.address,
            city: shipperData.city,
            state: shipperData.state,
            pincode: shipperData.pincode,
          },
        };
      }
      if (user.role === 'driver') {
        payload.driverProfile = {
          licenseNumber: driverData.licenseNumber,
          licensePhoto: license,
          idProofPhoto: idProof,
        };
      }
      if (user.role === 'agency') {
        payload.agencyProfile = {
          companyName: agencyData.companyName,
          gstNumber: agencyData.gstNumber,
          address: {
            line1: agencyData.line1,
            city: agencyData.city,
            state: agencyData.state,
            pincode: agencyData.pincode,
          },
        };
      }

      const { data } = await completeProfile(payload);
      updateUser(data.user);
      navigate(roleRedirect[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your details right now.');
    } finally {
      setLoading(false);
    }
  };

  const titleByRole = {
    buyer: 'A few details before you shop',
    shipper: 'Set up your shipping profile',
    driver: 'Complete your driver profile',
    agency: 'Set up your agency profile',
  };

  return (
    <AuthLayout
      eyebrow="ALMOST THERE"
      title={titleByRole[user.role] || 'Complete your profile'}
      subtitle="This helps us tailor your dashboard and speeds up verification."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {user.role === 'buyer' && <BuyerForm photo={photo} setPhoto={setPhoto} data={buyerData} setData={setBuyerData} />}
        {user.role === 'shipper' && <ShipperForm photo={photo} setPhoto={setPhoto} data={shipperData} setData={setShipperData} />}
        {user.role === 'driver' && (
          <DriverForm
            photo={photo}
            setPhoto={setPhoto}
            license={license}
            setLicense={setLicense}
            idProof={idProof}
            setIdProof={setIdProof}
            data={driverData}
            setData={setDriverData}
          />
        )}
        {user.role === 'agency' && <AgencyForm photo={photo} setPhoto={setPhoto} data={agencyData} setData={setAgencyData} />}

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Continue to dashboard'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Onboarding;