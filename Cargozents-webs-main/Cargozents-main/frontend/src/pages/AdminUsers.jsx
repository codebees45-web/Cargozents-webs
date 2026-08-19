import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

const ROLE_TABS = [
  { value: '', label: 'All users' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'shipper', label: 'Shippers' },
  { value: 'agency', label: 'Agencies' },
  { value: 'driver', label: 'Drivers' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = () => {
    setUsers(null);
    setError('');
    api
      .get('/admin/users', { params: { role: role || undefined } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setError('Could not load users right now.'));
  };

  useEffect(loadUsers, [role]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleSuspend = async (user) => {
    setBusyId(user._id);
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/suspend`, {
        isSuspended: !user.isSuspended,
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
    } catch {
      setError('Could not update that user right now.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="User management" subtitle="View and manage buyers, shippers, agencies, and drivers on the network.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setRole(t.value)}
              className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                role === t.value ? 'border-primary bg-primary text-white' : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
              }`}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-72 rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary/60"
        />
      </div>

      <div className="mt-6">
        {users === null ? (
          <TruckLoader fullScreen={false} />
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No users found"
            body={search ? 'No users match your search.' : 'Users matching this filter will show up here.'}
          />
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
            {filtered.map((u) => (
              <li key={u._id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {u.name}
                    {u.isSuspended && <span className="ml-2 font-mono-ls text-[10px] text-danger">SUSPENDED</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5B7A70]">
                    {u.email} · {u.phone} · <span className="uppercase">{u.role}</span>
                  </p>
                </div>
                <button
                  disabled={busyId === u._id}
                  onClick={() => toggleSuspend(u)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                    u.isSuspended
                      ? 'bg-accent text-primary hover:shadow-glow'
                      : 'border border-danger/40 text-danger hover:bg-danger/10'
                  }`}
                >
                  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;