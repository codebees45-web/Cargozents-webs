import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import TruckLoader from '../components/common/TruckLoader';
import { registerUser } from '../services/authService';

const roles = ['buyer', 'shipper', 'driver', 'agency'];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'te', label: 'Telugu (తెలుగు)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
  { value: 'ta', label: 'Tamil (தமிழ்)' },
  { value: 'ur', label: 'Urdu (اردو)' },
  { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { value: 'ml', label: 'Malayalam (മലയാളം)' },
  { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'as', label: 'Assamese (অসমীয়া)' },
];

const shipperModes = ['catalog', 'raw_shipment', 'both'];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: searchParams.get('role') || 'buyer',
    shipperMode: 'both',
    preferredLanguage: 'en',
    agencyProfile: {
      companyName: '',
      gstNumber: '',
      address: { line1: '', city: '', state: '', pincode: '' },
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAgency = form.role === 'agency';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'preferredLanguage') {
      i18n.changeLanguage(value);
    }
  };

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
    setError(err.response?.data?.message || t('signup.errorGeneric'));
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {loading && <TruckLoader label={t('signup.creatingAccount')} />}
      <AuthLayout
        eyebrow={t('signup.eyebrow')}
        title={t('signup.title')}
        subtitle={t('signup.subtitle')}
      >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{t('signup.role')}</span>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`rounded-lg border px-3 py-2 font-mono-ls text-[11px] transition ${
                  form.role === r
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-primary/15 text-[#5B7A70] hover:border-primary/30'
                }`}
              >
                {t(`signup.roles.${r}`)}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
            {t('signup.preferredLanguage')}
          </span>
          <select
            name="preferredLanguage"
            value={form.preferredLanguage}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/60"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value} className="bg-secondary">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {form.role === 'shipper' && (
          <div>
            <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
              {t('signup.shipperMode.label')}
            </span>
            <select
              name="shipperMode"
              value={form.shipperMode}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/60"
            >
              {shipperModes.map((m) => (
                <option key={m} value={m} className="bg-secondary">
                  {t(`signup.shipperMode.${m}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        {isAgency && (
          <div className="space-y-4 rounded-xl border border-primary/10 bg-secondary/20 p-4">
            <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{t('signup.agency.details')}</p>
            <FormInput
              label={t('signup.agency.companyName')}
              name="companyName"
              value={form.agencyProfile.companyName}
              onChange={handleAgencyChange}
              placeholder={t('signup.agency.companyNamePlaceholder')}
            />
            <FormInput
              label={t('signup.agency.gst')}
              name="gstNumber"
              value={form.agencyProfile.gstNumber}
              onChange={handleAgencyChange}
              placeholder={t('signup.agency.gstPlaceholder')}
              required={false}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label={t('signup.agency.address')}
                name="line1"
                value={form.agencyProfile.address.line1}
                onChange={handleAgencyAddressChange}
                placeholder={t('signup.agency.addressPlaceholder')}
                required={false}
              />
              <FormInput
                label={t('signup.agency.city')}
                name="city"
                value={form.agencyProfile.address.city}
                onChange={handleAgencyAddressChange}
                placeholder={t('signup.agency.city')}
                required={false}
              />
              <FormInput
                label={t('signup.agency.state')}
                name="state"
                value={form.agencyProfile.address.state}
                onChange={handleAgencyAddressChange}
                placeholder={t('signup.agency.state')}
                required={false}
              />
              <FormInput
                label={t('signup.agency.pincode')}
                name="pincode"
                value={form.agencyProfile.address.pincode}
                onChange={handleAgencyAddressChange}
                placeholder={t('signup.agency.pincode')}
                required={false}
              />
            </div>
          </div>
        )}

        {!isAgency && (
          <FormInput label={t('signup.fullName')} name="name" value={form.name} onChange={handleChange} placeholder={t('signup.namePlaceholder')} />
        )}
        <FormInput
          label={t('signup.email')}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t('signup.emailPlaceholder')}
        />
        <FormInput
          label={t('signup.phone')}
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder={t('signup.phonePlaceholder')}
        />
        <FormInput
          label={t('signup.password')}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder={t('signup.passwordPlaceholder')}
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
          {loading ? t('signup.creatingAccount') : t('signup.createAccount')}
        </button>

        <p className="text-center text-xs text-[#5B7A70]">
          {t('signup.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('signup.logIn')}
          </Link>
        </p>
      </form>
      </AuthLayout>
    </>
  );
};
export default Signup;