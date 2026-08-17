import { useState } from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import FormInput from '../components/common/FormInput';
import api from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/support/contact', form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingLayout
      eyebrow="CONTACT"
      title="Talk to us."
      subtitle="Questions about pricing, onboarding as a fleet, or anything else."
    >
      {sent ? (
        <div className="rounded-2xl border border-primary/10 bg-secondary p-8">
          <p className="font-display text-lg font-semibold text-primary">Message sent</p>
          <p className="mt-2 text-sm text-[#5B7A70]">
            We'll get back to you at {form.email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md space-y-5">
          <FormInput label="NAME" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          <FormInput
            label="EMAIL"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <label className="block">
            <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">MESSAGE</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="How can we help?"
              className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary placeholder:text-[#5B7A70]/50 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/40"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}
    </MarketingLayout>
  );
};

export default Contact;
