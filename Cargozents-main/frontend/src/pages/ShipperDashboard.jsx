import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_HEX_COLORS = {
  requested: '#94A3B8',
  assigned: '#60A5FA',
  accepted: '#38BDF8',
  rejected: '#F87171',
  picked_up: '#FBBF24',
  in_transit: '#FB923C',
  delivered: '#34D399',
  cancelled: '#94A3B8',
};

const STATUS_LABELS = {
  requested: 'Requested',
  assigned: 'Assigned',
  accepted: 'Accepted',
  rejected: 'Rejected',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const QUICK_ACTIONS = [
  { label: 'Post a shipment', href: '/shipper/post-shipment' },
  { label: 'Manage products', href: '/shipper/products' },
  { label: 'View orders', href: '/shipper/orders' },
  { label: 'Track shipments', href: '/shipper/shipments' },
  { label: 'Subscription', href: '/shipper/subscription' },
];

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = ['Pickup City', 'Drop City', 'Status', 'Created At'];
  const lines = rows.map((s) =>
    [s.pickup?.city || '', s.drop?.city || '', s.status || '', s.createdAt || '']
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

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const ShipperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) setIsRefreshing(true);
    try {
      const [shipmentsRes, ordersRes] = await Promise.all([
        api.get('/shipments/mine'),
        api.get('/orders/received'),
      ]);
      setShipments(shipmentsRes.data.shipments || []);
      setOrders(ordersRes.data.orders || []);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not load your dashboard data. These endpoints are next in line to build.');
    } finally {
      if (silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadDashboard();
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingRequests = shipments?.filter((s) => s.status === 'requested').length ?? 0;
  const inTransit = shipments?.filter((s) => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(s.status)).length ?? 0;
  const awaitingShipment = orders?.filter((o) => o.status === 'awaiting_shipment').length ?? 0;

  const filteredShipments = useMemo(() => {
    if (!shipments) return [];
    const q = shipmentSearch.trim().toLowerCase();
    if (!q) return shipments;
    return shipments.filter((s) =>
      [s.pickup?.city, s.drop?.city, s.status]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [shipments, shipmentSearch]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.status, String(o.productTotal ?? '')]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [orders, orderSearch]);

  const statusBreakdown = useMemo(() => {
    if (!shipments?.length) return null;
    const counts = shipments.reduce((acc, s) => {
      const key = s.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(counts);
    return {
      labels: labels.map((k) => STATUS_LABELS[k] || k),
      datasets: [
        {
          data: labels.map((k) => counts[k]),
          backgroundColor: labels.map((k) => STATUS_HEX_COLORS[k] || '#94A3B8'),
          borderWidth: 0,
        },
      ],
    };
  }, [shipments]);

  const handleExportShipments = () => {
    const csv = toCsv(filteredShipments);
    if (!csv) return;
    downloadCsv(csv, `shipments-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
      subtitle={
        user?.shipperMode === 'catalog'
          ? 'Selling from your product catalog.'
          : user?.shipperMode === 'raw_shipment'
          ? 'Posting shipments directly.'
          : 'Selling products and posting shipments.'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono-ls text-[11px] text-[#5B7A70]">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : ''}
        </p>
        <button
          type="button"
          onClick={() => loadDashboard({ silent: true })}
          disabled={isRefreshing}
          className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs text-primary/70 transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatField label="PENDING REQUESTS" value={shipments === null ? '—' : pendingRequests} />
        <StatField label="IN TRANSIT" value={shipments === null ? '—' : inTransit} />
        <StatField label="AWAITING SHIPMENT" value={orders === null ? '—' : awaitingShipment} />
        <StatField label="TOTAL ORDERS" value={orders === null ? '—' : orders.length} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-primary">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => navigate(action.href)}
              className="rounded-lg border border-primary/15 bg-secondary/10 px-4 py-2 text-xs font-medium text-primary transition hover:border-accent hover:bg-accent/10"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {statusBreakdown && (
        <div className="mt-8 rounded-xl border border-primary/10 bg-secondary/10 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">Shipment status breakdown</h2>
          <div className="mx-auto mt-4 max-w-xs">
            <Doughnut
              data={statusBreakdown}
              options={{
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#5B7A70', boxWidth: 12, font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Recent shipments</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportShipments}
                disabled={!filteredShipments.length}
                className="text-xs text-primary/70 hover:underline disabled:opacity-40"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => navigate('/shipper/post-shipment')}
                className="text-xs text-primary hover:underline"
              >
                + Post a shipment
              </button>
            </div>
          </div>
          {shipments !== null && shipments.length > 0 && (
            <input
              type="text"
              value={shipmentSearch}
              onChange={(e) => setShipmentSearch(e.target.value)}
              placeholder="Search by city or status…"
              className="mt-3 w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-xs text-primary placeholder:text-[#5B7A70] focus:border-accent focus:outline-none"
            />
          )}
          <div className="mt-4">
            {shipments === null ? (
              <TruckLoader fullScreen={false} />
            ) : shipments.length === 0 ? (
              <EmptyState
                title="No shipments yet"
                body="Post a shipment when you need a truck — for a raw load or once an order is ready to go out."
                actionLabel="Post a shipment"
                onAction={() => navigate('/shipper/post-shipment')}
              />
            ) : filteredShipments.length === 0 ? (
              <p className="mt-4 text-xs text-[#5B7A70]">No shipments match “{shipmentSearch}”.</p>
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {filteredShipments.map((s) => (
                  <li key={s._id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono-ls text-xs text-[#5B7A70]">
                      {s.pickup?.city} → {s.drop?.city}
                    </span>
                    <span className="font-mono-ls text-xs text-primary">{s.status?.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Orders received</h2>
            <button
              type="button"
              onClick={() => navigate('/shipper/orders')}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {orders !== null && orders.length > 0 && (
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by status or amount…"
              className="mt-3 w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-xs text-primary placeholder:text-[#5B7A70] focus:border-accent focus:outline-none"
            />
          )}
          <div className="mt-4">
            {orders === null ? (
              <TruckLoader fullScreen={false} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                body="Once your products go live, buyer orders will show up here for you to confirm and ship."
                actionLabel="Manage products"
                onAction={() => navigate('/shipper/products')}
              />
            ) : filteredOrders.length === 0 ? (
              <p className="mt-4 text-xs text-[#5B7A70]">No orders match “{orderSearch}”.</p>
            ) : (
              <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
                {filteredOrders.map((o) => (
                  <li key={o._id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono-ls text-xs text-[#5B7A70]">₹{o.productTotal}</span>
                    <span className="font-mono-ls text-xs text-primary">{o.status?.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {error && <p className="mt-8 text-xs text-warning">{error}</p>}
    </DashboardLayout>
  );
};

export default ShipperDashboard;