import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyComplaints } from '../../services/complaintService';
import TruckLoader from '../common/TruckLoader';
import EmptyState from '../common/EmptyState';

const STATUS_STYLES = {
  open: 'bg-primary/10 text-[#5B7A70]',
  in_progress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
};

export default function MyComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyComplaints(token)
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <TruckLoader fullScreen={false} label="Loading complaints…" />;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (complaints.length === 0)
    return <EmptyState title="No complaints filed yet" body="Complaints you raise will show up here so you can track their status." />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {complaints.map((c) => (
        <div key={c._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono-ls text-[11px] text-[#5B7A70]">{c._id}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[c.status] || 'bg-primary/10 text-[#5B7A70]'}`}>
              {c.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-primary">{c.subject}</h3>
          <p className="mt-1 text-sm text-[#8AA399]">{c.description}</p>
          {c.adminResponse && (
            <p className="mt-2 rounded-lg bg-primary/5 p-2 text-xs text-[#5B7A70]">
              <span className="font-semibold text-primary">Team response: </span>
              {c.adminResponse}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}