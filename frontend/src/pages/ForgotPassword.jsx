import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import FormInput from '../components/common/FormInput';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout eyebrow="CHECK YOUR EMAIL" title="Code sent">
        <p className="text-sm text-[#5B7A70]">
          If an account exists for <span className="text-primary">{email}</span>, a reset code is on its way.
        </p>
        <button
          onClick={() => navigate('/reset-password', { state: { email } })}
          className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow"
        >
          I have the code
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset code."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="EMAIL"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
        <p className="text-center text-xs text-[#5B7A70]">
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
