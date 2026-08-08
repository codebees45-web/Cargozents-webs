import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createComplaint } from '../../services/complaintService';

export default function ComplaintForm({ onCreated }) {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setLoading(true);
    try {
      const created = await createComplaint({ subject, description, order }, token);
      onCreated?.(created);
      setSubject('');
      setDescription('');
      setOrder('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-[#8AA399] uppercase tracking-wider">Related order (optional)</label>
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="ORD-4821"
          className="rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-[#8AA399] uppercase tracking-wider">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          className="rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-[#8AA399] uppercase tracking-wider">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#00E676] px-6 py-2.5 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all duration-200 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'File complaint'}
      </button>
    </form>
  );
}