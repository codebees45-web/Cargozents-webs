import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="RESET PASSWORD" title="Set a new password">
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
          label="6-DIGIT CODE"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          placeholder="••••••"
        />
        <FormInput
          label="NEW PASSWORD"
          type="password"
          name="newPassword"
          value={form.newPassword}
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
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
        <p className="text-center text-xs text-[#5B7A70]">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
