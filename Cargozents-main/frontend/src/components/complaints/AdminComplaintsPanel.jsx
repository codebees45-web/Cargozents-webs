import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllComplaints, updateComplaint } from '../../services/complaintService';
import TruckLoader from '../common/TruckLoader';
import EmptyState from '../common/EmptyState';

const STATUS_STYLES = {
  open: 'text-[#5B7A70]',
  in_progress: 'text-warning',
  resolved: 'text-success',
  rejected: 'text-danger',
};

export default function AdminComplaintsPanel() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllComplaints(token)
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleStatusChange = async (id, status) => {
    setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
    await updateComplaint(id, { status }, token);
  };

  const handleReplySave = async (id, adminResponse) => {
    await updateComplaint(id, { adminResponse }, token);
    setComplaints((prev) => prev.map((c) => (c._id === id ? { ...c, adminResponse } : c)));
  };

  if (loading) return <TruckLoader fullScreen={false} label="Loading complaints…" />;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints yet"
        body="Complaints raised by buyers, shippers, drivers, or agencies will show up here for review."
      />
    );
  }

  return (
    <div className="space-y-3">
      {complaints.map((c) => (
        <div key={c._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary">{c.subject}</h3>
              <p className="mt-1 text-xs text-[#5B7A70]">
                {c.user?.name} — {c.user?.email}
              </p>
            </div>
            <select
              value={c.status}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              className={`rounded-lg border border-primary/15 bg-secondary/40 px-2 py-1 font-mono-ls text-[11px] tracking-wide outline-none focus:border-primary/60 ${STATUS_STYLES[c.status] || 'text-primary'}`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <p className="mt-3 text-sm text-[#8AA399]">{c.description}</p>

          <input
            defaultValue={c.adminResponse}
            placeholder="Write a response…"
            onBlur={(e) => handleReplySave(c._id, e.target.value)}
            className="mt-4 w-full rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-[#00E676]"
          />
        </div>
      ))}
    </div>
  );
}