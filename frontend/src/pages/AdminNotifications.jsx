import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'shipper', label: 'Shippers' },
  { value: 'driver', label: 'Drivers' },
  { value: 'agency', label: 'Agencies' },
];

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [successNote, setSuccessNote] = useState('');

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = () => {
    setHistory(null);
    api
      .get('/admin/notifications')
      .then(({ data }) => setHistory(data.notifications || []))
      .catch(() => setHistoryError('Could not load sent notifications right now.'));
  };

  useEffect(loadHistory, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessNote('');

    if (!title.trim() || !message.trim()) {
      setFormError('Title and message are both required.');
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post('/admin/notifications', { title, message, audience });
      setSuccessNote(`Sent to ${data.recipientCount} ${audience === 'all' ? 'user(s)' : `${audience}(s)`}.`);
      setTitle('');
      setMessage('');
      setAudience('all');
      loadHistory();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not send that notification right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title="Broadcast notifications" subtitle="Send an announcement to a role, or everyone on the network.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Compose */}
        <div className="lg:col-span-1 rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm">
          <h3 className="text-md font-bold text-primary mb-5 tracking-tight border-b border-primary/10 pb-3">
            Compose
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg border border-primary/10 bg-[#0c1411] px-4 py-3 text-sm focus:border-[#00E676] focus:outline-none text-primary cursor-pointer"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="Scheduled maintenance tonight"
                className="w-full rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8AA399] uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="We'll be doing planned maintenance from 1–2 AM IST. Expect brief downtime."
                className="w-full rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
              />
            </div>

            {formError && <p className="text-sm text-danger">{formError}</p>}
            {successNote && <p className="text-sm text-success">{successNote}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-[#00E676] px-6 py-3 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send broadcast'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-primary mb-4">Recently sent</h3>
          {history === null ? (
            <TruckLoader fullScreen={false} />
          ) : historyError ? (
            <p className="text-sm text-danger">{historyError}</p>
          ) : history.length === 0 ? (
            <EmptyState title="No broadcasts yet" body="Announcements you send will show up here." />
          ) : (
            <div className="space-y-3">
              {history.map((n) => (
                <div key={n._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">{n.title}</p>
                    <span className="rounded-full border border-primary/15 px-2 py-0.5 font-mono-ls text-[10px] tracking-wide text-[#5B7A70]">
                      {n.audience.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#8AA399]">{n.message}</p>
                  <p className="mt-3 text-xs text-[#5B7A70]">
                    Sent by {n.sentBy?.name || 'admin'} · {new Date(n.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;