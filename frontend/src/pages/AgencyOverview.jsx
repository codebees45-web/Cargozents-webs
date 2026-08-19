import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getAgencyFleetStats } from '../services/agencyService';

const currency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const StatField = ({ label, value, accentValue = false }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className={`mt-1 font-display text-2xl font-bold ${accentValue ? 'text-accent' : 'text-primary'}`}>
      {value}
    </p>
  </div>
);

const AgencyOverview = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fleetSummary, setFleetSummary] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [fleetError, setFleetError] = useState('');

  useEffect(() => {
    fetchOverviewOrders();
    fetchFleetStats();
  }, []);

  const fetchOverviewOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/orders/received');
      setRecentOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching overview orders:', err);
      const message =
        err.response?.status === 401
          ? 'Session invalid or expired. Please re-login.'
          : err.response?.status === 403
          ? "Your account isn't authorized for this route yet."
          : err.response?.data?.message || err.message || 'Could not load recent orders.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFleetStats = async () => {
    try {
      const { data } = await getAgencyFleetStats();
      setFleetSummary(data.summary);
      setTrucks(data.trucks || []);
    } catch (err) {
      console.error('Error fetching fleet stats:', err);
      setFleetError('Could not load fleet performance right now.');
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
      case 'placed':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed':
      case 'confirmed_by_shipper':
      case 'on going':
      case 'ongoing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'delivered':
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'cancelled':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-primary/5 text-[#5B7A70] border-primary/10';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-primary">Agency Overview</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatField label="TOTAL ORDERS" value={isLoading || error ? '—' : recentOrders.length} />
        <StatField
          label="ACTIVE TRUCKS"
          value={fleetSummary ? `${fleetSummary.activeTrucks} / ${fleetSummary.fleetSize}` : fleetError ? '—' : '…'}
          accentValue
        />
        <StatField
          label="FLEET REVENUE (DELIVERED)"
          value={fleetSummary ? currency(fleetSummary.totalRevenue) : fleetError ? '—' : '…'}
          accentValue
        />
      </div>

      <div className="rounded-xl border border-primary/10 bg-secondary/10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-primary">Fleet Performance</h3>
            <p className="mt-0.5 text-xs text-[#5B7A70]">
              Trips and earnings per truck, plus utilization relative to your busiest vehicle.
            </p>
          </div>
          {fleetSummary && (
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 font-mono-ls text-xs font-semibold text-accent">
              {fleetSummary.avgUtilization}% avg utilization
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-primary/10 font-mono-ls text-[11px] uppercase tracking-wider text-[#5B7A70]">
              <tr>
                <th className="px-6 py-4">Truck</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Trips</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fleetError ? (
                <tr>
                  <td colSpan="5" className="bg-danger/5 px-6 py-10 text-center text-xs font-semibold text-danger">
                    ⚠️ {fleetError}
                  </td>
                </tr>
              ) : fleetSummary === null ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                      <p className="text-xs font-medium text-[#5B7A70]">Loading fleet performance...</p>
                    </div>
                  </td>
                </tr>
              ) : trucks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm font-medium text-[#5B7A70]">
                    No trucks registered to your fleet yet.
                  </td>
                </tr>
              ) : (
                trucks.map((t) => (
                  <tr key={t._id} className="transition hover:bg-secondary/30">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {t.registrationNumber}
                      {!t.isVerified && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-warning">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary/80">{t.type?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm text-primary/80">{t.trips}</td>
                    <td className="px-6 py-4 text-sm text-primary/80">{currency(t.revenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${t.utilization}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#5B7A70]">{t.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-primary/10 bg-secondary/10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-primary">Order Status Tracking</h3>
            <p className="mt-0.5 text-xs text-[#5B7A70]">Live updates on recent client orders and dispatch statuses.</p>
          </div>
          {error && (
            <button
              onClick={fetchOverviewOrders}
              className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs text-primary/70 transition hover:border-accent hover:text-primary"
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-primary/10 font-mono-ls text-[11px] uppercase tracking-wider text-[#5B7A70]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                      <p className="text-xs font-medium text-[#5B7A70]">Loading recent activity…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="bg-danger/5 px-6 py-10 text-center text-xs font-semibold text-danger">
                    ⚠️ {error}
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm font-medium text-[#5B7A70]">
                    No orders received yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const orderId = order._id || order.id || 'N/A';
                  const clientName = order.client?.name || order.client || 'Unknown Client';
                  const routeInfo = order.route || `${order.pickup || 'Origin'} to ${order.dropoff || 'Destination'}`;
                  const currentStatus = order.status || 'Pending';

                  return (
                    <tr key={orderId} className="transition hover:bg-secondary/30">
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {orderId.length > 8 ? `${orderId.substring(0, 8).toUpperCase()}...` : orderId.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary/80">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-primary/80">{routeInfo}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(currentStatus)}`}
                        >
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgencyOverview;