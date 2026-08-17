import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import { useAuth } from '../hooks/useAuth';

const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  agency: '/agency/dashboard', // 🟢 Updated to match your routing architecture
  admin: '/admin/dashboard',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const responseData = await login(form.email, form.password);
    
    // Extract the raw role string
    const extractedRole = responseData?.role || responseData?.user?.role || responseData?.data?.user?.role;
    
    // 🟢 DEBUGLOG: Open F12 in your browser to see exactly what prints here!
    console.log("--- CARGOZENTS AUTH DEBUGGER ---");
    console.log("1. Raw response from backend:", responseData);
    console.log("2. Extracted role string:", extractedRole);

    if (!extractedRole) {
      console.error("Login succeeded, but no role found in response payload:", responseData);
      setError("Routing error: User role could not be verified.");
      return;
    }

    const normalizedRole = String(extractedRole).toLowerCase().trim();
    console.log("3. Normalized role for lookup:", normalizedRole);

    const redirectPath = roleRedirect[normalizedRole] || roleRedirect[extractedRole];
    console.log("4. Attempting redirection to path:", redirectPath);

    if (redirectPath) {
      navigate(redirectPath);
    } else {
      console.warn(`No explicit route mapping found for role: "${extractedRole}". Defaulting to fallback.`);
      navigate('/dashboard'); 
    }

  } catch (err) {
    const data = err.response?.data;
    if (err.response?.status === 403 && data?.userId) {
      navigate('/verify-otp', {
        state: { userId: data.userId, email: data.email, phone: data.phone },
      });
      return;
    }
    setError(data?.message || 'Login failed. Check your details and try again.');
  } finally {
    setLoading(false);
  }
};

  return (
      <AuthLayout
        eyebrow="WELCOME BACK"
        title="Log in to Cargozents"
        subtitle="Access your dashboard as a buyer, shipper, driver, or admin."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="EMAIL"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <FormInput
            label="PASSWORD"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-[#5B7A70] hover:text-primary">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="text-center text-xs text-[#5B7A70]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </AuthLayout>
  );
};

export default Login;