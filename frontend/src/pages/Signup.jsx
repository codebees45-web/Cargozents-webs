import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import TruckLoader from '../components/common/TruckLoader';
import { registerUser } from '../services/authService';

const roles = [
  { value: 'buyer', label: 'BUYER' },
  { value: 'shipper', label: 'SHIPPER' },
  { value: 'driver', label: 'DRIVER' },
  { value: 'agency', label: 'AGENCY' },
];

const shipperModes = [
  { value: 'catalog', label: 'Sell products from a catalog' },
  { value: 'raw_shipment', label: 'Post one-off shipments' },
  { value: 'both', label: 'Both' },
];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: searchParams.get('role') || 'buyer',
    shipperMode: 'both',
    agencyProfile: {
      companyName: '',
      gstNumber: '',
      address: { line1: '', city: '', state: '', pincode: '' },
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAgency = form.role === 'agency';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAgencyChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      agencyProfile: { ...prev.agencyProfile, [name]: value },
    }));
  };

  const handleAgencyAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      agencyProfile: {
        ...prev.agencyProfile,
        address: { ...prev.agencyProfile.address, [name]: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const payload = { ...form };
    if (isAgency) {
      payload.name = form.agencyProfile?.companyName || form.name;
    } else {
      delete payload.agencyProfile;
    }

    // 1. Send registration request to your backend
    const { data } = await registerUser(payload);
    
    // Determine the user ID returned from the backend (handles 'userId' or 'id')
    const resolvedUserId = data?.userId || data?.id || data?.user?.id || data?.user?.userId;

    // 2. Backup details to localStorage so the OTP page has a safety net if state drops
    if (resolvedUserId) {
      localStorage.setItem('temp_otp_userId', resolvedUserId);
    }
    if (form.email) {
      localStorage.setItem('temp_otp_email', form.email);
    }
    if (form.phone) {
      localStorage.setItem('temp_otp_phone', form.phone);
    }

    // 3. Navigate to OTP page, passing state as the primary option
    navigate('/verify-otp', { 
      state: { 
        userId: resolvedUserId,
        email: form.email,
        phone: form.phone
      } 
    });

  } catch (err) {
    console.error("Signup error details:", err);
    setError(err.response?.data?.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {loading && <TruckLoader label="Creating your account…" />}
      <AuthLayout
        eyebrow="JOIN THE NETWORK"
        title="Create your account"
        subtitle="Pick the role that fits how you'll use LoadShare."
      >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">ROLE</span>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-lg border px-3 py-2 font-mono-ls text-[11px] transition ${
                  form.role === r.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-primary/15 text-[#5B7A70] hover:border-primary/30'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {form.role === 'shipper' && (
          <div>
            <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
              WHAT YOU'LL DO
            </span>
            <select
              name="shipperMode"
              value={form.shipperMode}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/60"
            >
              {shipperModes.map((m) => (
                <option key={m.value} value={m.value} className="bg-secondary">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isAgency && (
          <div className="space-y-4 rounded-xl border border-primary/10 bg-secondary/20 p-4">
            <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">AGENCY DETAILS</p>
            <FormInput
              label="COMPANY NAME"
              name="companyName"
              value={form.agencyProfile.companyName}
              onChange={handleAgencyChange}
              placeholder="e.g. Bharat Fleet Logistics"
            />
            <FormInput
              label="GST / REGISTRATION NUMBER"
              name="gstNumber"
              value={form.agencyProfile.gstNumber}
              onChange={handleAgencyChange}
              placeholder="22AAAAA0000A1Z5"
              required={false}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="ADDRESS LINE"
                name="line1"
                value={form.agencyProfile.address.line1}
                onChange={handleAgencyAddressChange}
                placeholder="Warehouse / office address"
                required={false}
              />
              <FormInput
                label="CITY"
                name="city"
                value={form.agencyProfile.address.city}
                onChange={handleAgencyAddressChange}
                placeholder="City"
                required={false}
              />
              <FormInput
                label="STATE"
                name="state"
                value={form.agencyProfile.address.state}
                onChange={handleAgencyAddressChange}
                placeholder="State"
                required={false}
              />
              <FormInput
                label="PINCODE"
                name="pincode"
                value={form.agencyProfile.address.pincode}
                onChange={handleAgencyAddressChange}
                placeholder="600001"
                required={false}
              />
            </div>
          </div>
        )}

        {!isAgency && (
          <FormInput label="FULL NAME" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
        )}
        <FormInput
          label="EMAIL"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <FormInput
          label="PHONE"
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="9876543210"
        />
        <FormInput
          label="PASSWORD"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
        />

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-xs text-[#5B7A70]">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
      </AuthLayout>
    </>
  );
};
export default Signup;