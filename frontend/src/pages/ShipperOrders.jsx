import { Fragment, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import { getReceivedOrders, confirmOrder } from '../services/orderService';

const STATUS_STYLES = {
  placed: 'text-warning',
  confirmed_by_shipper: 'text-primary',
  awaiting_shipment: 'text-primary',
  shipment_requested: 'text-primary',
  out_for_delivery: 'text-primary',
  delivered: 'text-success',
  cancelled: 'text-danger',
};

const STATUS_LABELS = {
  placed: 'New order',
  confirmed_by_shipper: 'Confirmed',
  awaiting_shipment: 'Awaiting shipment',
  shipment_requested: 'Shipment requested',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'placed', label: 'New' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const isProcessing = (status) =>
  ['confirmed_by_shipper', 'awaiting_shipment', 'shipment_requested', 'out_for_delivery'].includes(status);

const PAYMENT_STYLES = {
  pending: 'text-warning',
  paid: 'text-success',
  failed: 'text-danger',
  refunded: 'text-[#5B7A70]',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total_desc', label: 'Total: high to low' },
  { value: 'total_asc', label: 'Total: low to high' },
];

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = ['Order ID', 'Buyer', 'Items', 'Total', 'Payment Status', 'Order Status', 'Created At'];
  const lines = rows.map((o) =>
    [
      o._id,
      o.buyer?.name || '',
      o.items?.length ?? 0,
      o.productTotal ?? '',
      o.productPaymentStatus || '',
      o.status || '',
      o.createdAt || '',
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

const ShipperOrders = () => {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let cancelled = false;
    getReceivedOrders()
      .then(({ data }) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your orders right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    let result = filter === 'all' ? orders : filter === 'processing' ? orders.filter((o) => isProcessing(o.status)) : orders.filter((o) => o.status === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((o) =>
        [o._id, o.buyer?.name, o.status]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );
    }

    const sorted = [...result];
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'total_desc') sorted.sort((a, b) => (b.productTotal ?? 0) - (a.productTotal ?? 0));
    else if (sortBy === 'total_asc') sorted.sort((a, b) => (a.productTotal ?? 0) - (b.productTotal ?? 0));
    return sorted;
  }, [orders, filter, search, sortBy]);

  const handleExport = () => {
    const csv = toCsv(filtered);
    if (!csv) return;
    downloadCsv(csv, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleConfirm = async (order) => {
    setBusyId(order._id);
    try {
      const { data } = await confirmOrder(order._id);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm this order right now.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="Orders received" subtitle="Buyer orders placed against your catalog.">
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
            placeholder="Search order, buyer, status…"
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
        </div>
      </div>

      <div className="mt-6">
        {orders === null ? (
          <p className="text-sm text-[#5B7A70]">Loading…</p>
        ) : error && !orders.length ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          orders.length > 0 ? (
            <p className="text-sm text-[#5B7A70]">No orders match your search or filter.</p>
          ) : (
          <EmptyState
            title="No orders here"
            body="Orders buyers place against your catalog will show up here, ready to confirm and ship."
            actionLabel="Manage products"
            onAction={() => (window.location.href = '/shipper/products')}
          />
          )
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                  <th className="px-4 py-3 font-medium">ORDER</th>
                  <th className="px-4 py-3 font-medium">BUYER</th>
                  <th className="px-4 py-3 font-medium">ITEMS</th>
                  <th className="px-4 py-3 font-medium">TOTAL</th>
                  <th className="px-4 py-3 font-medium">PAYMENT</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((o) => {
                  const isExpanded = expandedId === o._id;
                  return (
                    <Fragment key={o._id}>
                      <tr className="cursor-pointer hover:bg-secondary/10" onClick={() => setExpandedId(isExpanded ? null : o._id)}>
                        <td className="px-4 py-3 font-mono-ls text-xs text-primary">
                          #{o._id.slice(-8).toUpperCase()}
                          <span className="ml-2 text-[10px] text-[#5B7A70]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#5B7A70]">{o.buyer?.name || '—'}</td>
                        <td className="px-4 py-3 text-[#5B7A70]">
                          {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 text-[#5B7A70]">₹{o.productTotal}</td>
                        <td className={`px-4 py-3 font-mono-ls text-xs ${PAYMENT_STYLES[o.productPaymentStatus] || 'text-[#5B7A70]'}`}>
                          {o.productPaymentStatus?.toUpperCase()}
                        </td>
                        <td className={`px-4 py-3 font-mono-ls text-xs ${STATUS_STYLES[o.status] || 'text-[#5B7A70]'}`}>
                          {(STATUS_LABELS[o.status] || o.status).toUpperCase()}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {o.status === 'placed' && (
                              <button
                                onClick={() => handleConfirm(o)}
                                disabled={busyId === o._id}
                                className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40 disabled:opacity-60"
                              >
                                {busyId === o._id ? '…' : 'Confirm'}
                              </button>
                            )}
                            {o.status === 'confirmed_by_shipper' && (
                              <a
                                href={`/shipper/post-shipment?orderId=${o._id}`}
                                className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-primary transition hover:shadow-glow"
                              >
                                Post shipment
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-secondary/10">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">ITEMS</p>
                                <ul className="mt-2 space-y-1">
                                  {o.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-primary">
                                        {item.product?.name || 'Product'} × {item.quantity}
                                      </span>
                                      <span className="text-[#5B7A70]">₹{item.priceAtPurchase * item.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">DELIVERY ADDRESS</p>
                                <p className="mt-2 text-sm text-primary">
                                  {o.deliveryAddress?.line1}, {o.deliveryAddress?.city}, {o.deliveryAddress?.state} —{' '}
                                  {o.deliveryAddress?.pincode}
                                </p>
                                {o.buyer?.phone && (
                                  <p className="mt-1 text-xs text-[#5B7A70]">Buyer phone: {o.buyer.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && orders?.length > 0 && <p className="mt-4 text-xs text-warning">{error}</p>}
    </DashboardLayout>
  );
};

export default ShipperOrders;