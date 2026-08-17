import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/common/ReviewModal';
import api from '../services/api';
import { reviewShipmentDriver } from '../services/reviewService';

const STATUS_STYLES = {
  requested: 'text-[#5B7A70]',
  assigned: 'text-warning',
  accepted: 'text-warning',
  picked_up: 'text-primary',
  in_transit: 'text-primary',
  delivered: 'text-success',
  rejected: 'text-danger',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
];

const isActiveStatus = (status) => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(status);

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'price_asc', label: 'Price: low to high' },
];

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = ['Pickup City', 'Drop City', 'Vehicle', 'Driver', 'Price', 'Scheduled Date', 'Status'];
  const lines = rows.map((s) =>
    [
      s.pickup?.city || '',
      s.drop?.city || '',
      s.vehicleRequired || '',
      s.assignedDriver?.name || '',
      s.finalPrice || s.estimatedPrice || '',
      s.scheduledDate || '',
      s.status || '',
    ]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...lines].join('\n');
};

const downloadCsv = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const ShipperShipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null); // shipment being rated, or null
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const markReviewed = (shipmentId) => {
    setShipments((prev) => prev.map((s) => (s._id === shipmentId ? { ...s, hasReview: true } : s)));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get('/shipments/mine')
      .then(({ data }) => {
        if (!cancelled) setShipments(data.shipments || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your shipments right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!shipments) return [];
    let result = filter === 'all' ? shipments : filter === 'active' ? shipments.filter((s) => isActiveStatus(s.status)) : shipments.filter((s) => s.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((s) =>
        [s.pickup?.city, s.drop?.city, s.assignedDriver?.name, s.status]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );
    }

    const sorted = [...result];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'price_desc') sorted.sort((a, b) => (b.finalPrice || b.estimatedPrice || 0) - (a.finalPrice || a.estimatedPrice || 0));
    else if (sortBy === 'price_asc') sorted.sort((a, b) => (a.finalPrice || a.estimatedPrice || 0) - (b.finalPrice || b.estimatedPrice || 0));
    return sorted;
  }, [shipments, filter, search, sortBy]);

  const handleExport = () => {
    const csv = toCsv(filtered);
    if (!csv) return;
    downloadCsv(csv, `shipments-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <DashboardLayout title="Shipments" subtitle="Everything you've posted, from request to delivery.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search route, driver, status…"
            className="rounded-lg border border-primary/15 bg-transparent px-3 py-1.5 text-xs text-primary placeholder:text-[#5B7A70] focus:border-accent focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-primary/15 bg-transparent px-3 py-1.5 text-xs text-primary focus:border-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-primary">
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            disabled={!filtered.length}
            className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary/70 transition hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/shipper/post-shipment')}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow"
          >
            + Post a shipment
          </button>
        </div>
      </div>

      <div className="mt-6">
        {shipments === null ? (
          <TruckLoader fullScreen={false} />
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          shipments.length > 0 ? (
            <p className="text-sm text-[#5B7A70]">No shipments match your search or filter.</p>
          ) : (
          <EmptyState
            title="Nothing here yet"
            body="Shipments matching this filter will show up here once you post one."
            actionLabel="Post a shipment"
            onAction={() => navigate('/shipper/post-shipment')}
          />
          )
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                  <th className="px-4 py-3 font-medium">ROUTE</th>
                  <th className="px-4 py-3 font-medium">VEHICLE</th>
                  <th className="px-4 py-3 font-medium">DRIVER</th>
                  <th className="px-4 py-3 font-medium">PRICE</th>
                  <th className="px-4 py-3 font-medium">SCHEDULED</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">RATING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-primary">
                      {s.pickup?.city} → {s.drop?.city}
                    </td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.vehicleRequired?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.assignedDriver?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">₹{s.finalPrice || s.estimatedPrice}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : '—'}</td>
                    <td className={`px-4 py-3 font-mono-ls text-xs ${STATUS_STYLES[s.status] || 'text-[#5B7A70]'}`}>
                      <div className="flex items-center gap-2">
                        <span>{s.status?.replace('_', ' ').toUpperCase()}</span>
                        {isActiveStatus(s.status) && (
                          <button
                            onClick={() => navigate(`/shipper/shipments/${s._id}/track`)}
                            className="rounded-full border border-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary transition hover:border-primary/40"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.status !== 'delivered' ? (
                        <span className="text-xs text-[#5B7A70]">—</span>
                      ) : s.hasReview ? (
                        <span className="font-mono-ls text-[11px] text-success">RATED</span>
                      ) : (
                        <button
                          onClick={() => setReviewTarget(s)}
                          className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                        >
                          Rate driver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          title={`Rate ${reviewTarget.assignedDriver?.name || 'your driver'}`}
          subtitle={`For the ${reviewTarget.pickup?.city} → ${reviewTarget.drop?.city} delivery`}
          onSubmit={async (rating, comment) => {
            await reviewShipmentDriver(reviewTarget._id, rating, comment);
            markReviewed(reviewTarget._id);
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ShipperShipments;