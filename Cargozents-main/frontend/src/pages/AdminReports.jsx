import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import { getShipmentAnalytics, getShipmentAnalyticsSummary } from '../services/analyticsService';
import api from '../services/api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Tailwind classes for UI elements
const STATUS_TW_COLORS = {
  requested: 'bg-secondary',
  assigned: 'bg-info',
  accepted: 'bg-primary',
  rejected: 'bg-danger',
  picked_up: 'bg-warning',
  in_transit: 'bg-warning',
  delivered: 'bg-success',
  cancelled: 'bg-danger',
};

// Hex colors for ChartJS
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

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'requested', label: 'Requested' },
  { value: 'cancelled', label: 'Cancelled' },
];

const currency = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const AdminReports = () => {
  // Version 1 State (Table & Summary)
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState(null);
  const [rowsError, setRowsError] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Version 2 State (Overview Analytics & Charts)
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');

  // Trend State (revenue & deliveries over the last 14 days)
  const [trend, setTrend] = useState(null);
  const [trendError, setTrendError] = useState('');

  // Fetch Version 1 Summary
  useEffect(() => {
    getShipmentAnalyticsSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => setSummaryError('Could not load summary analytics right now.'));
  }, []);

  // Fetch Version 1 Paginated Table Data
  useEffect(() => {
    setRows(null);
    getShipmentAnalytics({ page, limit: 8, status: status || undefined, search: search || undefined })
      .then(({ data }) => {
        setRows(data.data);
        setMeta(data.meta);
      })
      .catch(() => setRowsError('Could not load shipment records right now.'));
  }, [page, status, search]);

  // Fetch Version 2 Overview Analytics
  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/analytics/overview')
      .then((res) => !cancelled && setAnalytics(res.data.analytics))
      .catch(() => !cancelled && setAnalyticsError('Could not load detailed network analytics.'));
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch revenue/delivery trend
  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/analytics/trend?days=14')
      .then((res) => !cancelled && setTrend(res.data.trend || []))
      .catch(() => !cancelled && setTrendError('Could not load the revenue trend.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // Chart Data Processing
  const maxStatusRevenue = summary?.byStatus?.length
    ? Math.max(...summary.byStatus.map((s) => s.revenue))
    : 0;

  const trendChartData = {
    labels: (trend || []).map((t) =>
      new Date(t.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    ),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: (trend || []).map((t) => t.revenue),
        backgroundColor: '#34D399',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Deliveries',
        data: (trend || []).map((t) => t.delivered),
        backgroundColor: '#60A5FA',
        borderRadius: 4,
        yAxisID: 'y1',
      },
    ],
  };

  const statusEntries = analytics ? Object.entries(analytics.statusBreakdown) : [];
  const chartData = {
    labels: statusEntries.map(([s]) => STATUS_LABELS[s] || s),
    datasets: [
      {
        data: statusEntries.map(([, count]) => count),
        backgroundColor: statusEntries.map(([s]) => STATUS_HEX_COLORS[s] || '#94A3B8'),
        borderWidth: 0,
      },
    ],
  };

  return (
    <DashboardLayout title="Reports" subtitle="Platform-wide shipment revenue and network performance.">
      {/* Error Banners */}
      {(summaryError || analyticsError) && (
        <div className="mb-6 space-y-1">
          {summaryError && <p className="text-sm text-danger">{summaryError}</p>}
          {analyticsError && <p className="text-sm text-danger">{analyticsError}</p>}
        </div>
      )}

      {/* High-Level Stats Grid (Combined from V1 and V2) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        <StatCard
          label="TODAY'S REVENUE"
          value={analytics ? currency(analytics.todaysRevenue) : '—'}
        />
        <StatCard
          label="TOTAL REVENUE"
          value={analytics ? currency(analytics.totalRevenue) : summary ? currency(summary.totalRevenue) : '—'}
        />
        <StatCard
          label="AVERAGE PER SHIPMENT"
          value={summary ? currency(summary.averageRevenue) : '—'}
        />
        <StatCard
          label="TOTAL DELIVERED"
          value={analytics ? analytics.totalDelivered : summary ? summary.totalShipments : '—'}
        />
        <StatCard 
          label="ACTIVE SHIPMENTS" 
          value={analytics ? analytics.activeShipments : '—'} 
        />
        <StatCard 
          label="PENDING VERIFICATIONS" 
          value={analytics ? analytics.pendingVerifications : '—'} 
        />
        <StatCard
          label="BACKHAUL MATCH RATE"
          value={analytics ? `${analytics.backhaulMatchRate}%` : '—'}
        />
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Top Shippers (V1) */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Top shippers by revenue</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-primary/10">
            {summary ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                    <th className="px-4 py-3 font-medium">SHIPPER</th>
                    <th className="px-4 py-3 font-medium">SHIPMENTS</th>
                    <th className="px-4 py-3 font-medium">REVENUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {summary.topShippers.map((s) => (
                    <tr key={s.shipperName} className="hover:bg-secondary/10">
                      <td className="px-4 py-3 text-primary">{s.shipperName}</td>
                      <td className="px-4 py-3 text-[#5B7A70]">{s.shipmentCount}</td>
                      <td className="px-4 py-3 text-[#5B7A70]">{currency(s.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-[#5B7A70]">Loading shippers…</p>
            )}
          </div>
        </section>

        {/* Status Breakdown Chart (V2) */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Shipment status breakdown</h2>
          <div className="mt-4 flex h-[280px] items-center justify-center rounded-xl border border-primary/10 bg-secondary/10 p-6">
            {analytics === null ? (
              <TruckLoader fullScreen={false} />
            ) : statusEntries.length === 0 ? (
              <p className="text-sm text-[#5B7A70]">No shipments yet.</p>
            ) : (
              <div className="h-full w-full max-w-xs">
                <Doughnut
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Revenue by Status (V1) */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Revenue by status</h2>
          <div className="mt-4 space-y-4 rounded-xl border border-primary/10 bg-secondary/20 p-5">
            {summary ? (
              summary.byStatus.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-ls tracking-wide text-primary">
                      {s.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[#5B7A70]">
                      {currency(s.revenue)} · {s.count} shipment{s.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className={`h-full rounded-full ${STATUS_TW_COLORS[s.status] || 'bg-primary'}`}
                      style={{
                        width: maxStatusRevenue > 0 ? `${(s.revenue / maxStatusRevenue) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#5B7A70]">Loading revenue metrics…</p>
            )}
          </div>
        </section>

        {/* Backhaul Matching (V2) */}
        <section>
          <h2 className="font-display text-lg font-semibold text-primary">Backhaul matching efficiency</h2>
          <div className="mt-4 rounded-xl border border-primary/10 bg-secondary/10 p-6">
            {analytics === null ? (
              <TruckLoader fullScreen={false} />
            ) : (
              <>
                <p className="text-sm text-primary">
                  <span className="font-semibold">{analytics.backhaulMatchesDelivered}</span> out of {analytics.totalDelivered} delivered shipments filled an empty return leg, maximizing network efficiency.
                </p>
                <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-1000"
                    style={{ width: `${analytics.backhaulMatchRate}%` }}
                  />
                </div>
                <p className="mt-2 text-right font-mono-ls text-[11px] text-[#5B7A70]">
                  {analytics.backhaulMatchRate}% OVERALL MATCH RATE
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Revenue & Delivery Trend (last 14 days) */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-primary">Revenue & delivery trend (14 days)</h2>
        <div className="mt-4 h-[300px] rounded-xl border border-primary/10 bg-secondary/10 p-6">
          {trendError ? (
            <p className="text-sm text-danger">{trendError}</p>
          ) : trend === null ? (
            <TruckLoader fullScreen={false} />
          ) : trend.length === 0 ? (
            <p className="text-sm text-[#5B7A70]">No shipment activity in this window yet.</p>
          ) : (
            <Bar
              data={trendChartData}
              options={{
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                },
                scales: {
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Revenue (₹)', font: { size: 10 } },
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Deliveries', font: { size: 10 } },
                  },
                },
              }}
            />
          )}
        </div>
      </section>

      {/* Shipment Records Data Table (V1) */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-primary">All shipment records</h2>
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tracking #, shipper, city…"
                className="w-64 rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                className="rounded-lg border border-primary/15 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary/40"
              >
                Search
              </button>
            </form>

            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="rounded-lg border border-primary/15 bg-secondary/40 px-3 py-2 text-sm text-primary outline-none focus:border-primary/60"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {rowsError ? (
            <p className="text-sm text-danger">{rowsError}</p>
          ) : rows === null ? (
            <div className="py-10">
              <TruckLoader fullScreen={false} />
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-8 text-center text-sm text-[#5B7A70]">
              No shipment records match this filter.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-primary/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                    <th className="px-4 py-3 font-medium">TRACKING #</th>
                    <th className="px-4 py-3 font-medium">SHIPPER</th>
                    <th className="px-4 py-3 font-medium">ROUTE</th>
                    <th className="px-4 py-3 font-medium">STATUS</th>
                    <th className="px-4 py-3 font-medium">REVENUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/10">
                      <td className="px-4 py-3 font-mono-ls text-xs text-primary">{r.tracking_number}</td>
                      <td className="px-4 py-3 text-[#5B7A70]">{r.shipper_name}</td>
                      <td className="px-4 py-3 text-[#5B7A70]">
                        {r.pickup_city} → {r.drop_city}
                      </td>
                      <td className="px-4 py-3 font-mono-ls text-xs">
                        <span
                          className={`rounded-full px-2 py-0.5 text-white ${STATUS_TW_COLORS[r.status] || 'bg-primary'}`}
                        >
                          {r.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5B7A70]">{currency(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Logic */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-[#5B7A70]">
              Page {meta.page} of {meta.totalPages} · {meta.totalItems} total records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminReports;