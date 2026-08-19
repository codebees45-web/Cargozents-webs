import { useState } from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import FormInput from '../components/common/FormInput';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to POST /api/support/contact once the endpoint exists
    setSent(true);
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
          <button
            type="submit"
            className="rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition hover:shadow-glow"
          >
            Send message
          </button>
        </form>
      )}
    </MarketingLayout>
  );
};

export default Contact;
