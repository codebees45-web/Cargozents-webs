import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import { verifyOtp, resendOtp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const roleRedirect = {
  buyer: '/buyer/dashboard',
  shipper: '/shipper/dashboard',
  driver: '/driver/dashboard',
  agency: '/agency',
  admin: '/admin/dashboard',
};

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  // 1. Get values from React Router state OR fallback to localStorage backup
  const userId = location.state?.userId || localStorage.getItem('temp_otp_userId');
  const email = location.state?.email || localStorage.getItem('temp_otp_email');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    setResendMessage('');
    setError('');
    setResending(true);
    try {
      await resendOtp({ userId });
      setResendMessage('A new code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  // 2. If we absolutely have no userId anywhere, render the safety fallback
  if (!userId) {
    return (
      <AuthLayout eyebrow="VERIFY" title="Nothing to verify">
        <p className="text-sm text-[#5B7A70]">
          Start by <Link to="/signup" className="text-primary hover:underline">creating an account</Link>.
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ userId, otp });
      localStorage.setItem('loadshare_token', data.token);
      updateUser(data.user);
      
      // 3. Success! Now safely wipe out the temp backup keys from storage
      localStorage.removeItem('temp_otp_userId');
      localStorage.removeItem('temp_otp_email');
      localStorage.removeItem('temp_otp_phone'); // Cleans up register's backup too!

      if (!data.user.isProfileComplete && data.user.role !== 'admin') {
        navigate('/onboarding');
      } else {
        navigate(roleRedirect[data.user.role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="VERIFY YOUR ACCOUNT"
      title="Enter the code"
      subtitle={email ? `We sent a 6-digit code to ${email}.` : 'Enter the 6-digit code sent to you.'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="••••••"
          className="w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-3 text-center font-mono-ls text-2xl tracking-[0.5em] text-primary outline-none focus:border-primary/60"
        />

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify account'}
        </button>

        {resendMessage && (
          <p className="text-center text-xs text-emerald-600">{resendMessage}</p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full text-center text-xs font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;