import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  agency: '/agency/dashboard', // 🟢 Updated to match your routing architecture
  admin: '/admin/dashboard',
};

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them to their dashboard
  if (user) {
    const role = String(user.role).toLowerCase().trim();
    const destination = roleRedirect[role] || '/buyer/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const responseData = await login(form.email, form.password);
    
    // Extract the raw role string
    const extractedRole = responseData?.role || responseData?.user?.role || responseData?.data?.user?.role;

    if (!extractedRole) {
      setError(t('login.errorRouting'));
      return;
    }

    const normalizedRole = String(extractedRole).toLowerCase().trim();

    const redirectPath = roleRedirect[normalizedRole] || roleRedirect[extractedRole];

    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate('/buyer/dashboard'); 
    }

  } catch (err) {
    const data = err.response?.data;
    if (err.response?.status === 403 && data?.userId) {
      navigate('/verify-otp', {
        state: { userId: data.userId, email: data.email, phone: data.phone },
      });
      return;
    }
    setError(data?.message || t('login.errorGeneric'));
  } finally {
    setLoading(false);
  }
};

  return (
      <AuthLayout
        eyebrow={t('login.eyebrow')}
        title={t('login.title')}
        subtitle={t('login.subtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label={t('login.email')}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('login.emailPlaceholder')}
          />
          <FormInput
            label={t('login.password')}
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('login.passwordPlaceholder')}
          />

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-[#5B7A70] hover:text-primary">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {loading ? t('login.loggingIn') : t('login.logIn')}
          </button>

          <p className="text-center text-xs text-[#5B7A70]">
            {t('login.noAccount')}{' '}
            <Link to="/signup" className="text-primary hover:underline">
              {t('login.signUp')}
            </Link>
          </p>
        </form>
      </AuthLayout>
  );
};

export default Login;