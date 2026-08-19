import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import TrackingMap from '../components/common/TrackingMap';
import { getOrderTracking } from '../services/orderService';
import { formatLocationFreshness } from '../utils/locationFreshness';

const POLL_INTERVAL_MS = 15000;

const formatStatus = (status) => (status || '').replace(/_/g, ' ');

/**
 * "Where is my order" for a buyer. An Order only has something to show on
 * a map once the Shipper has requested a truck for it (order.shipment is
 * set) and a driver has come online and started sharing location — until
 * then this shows a plain status timeline instead of an empty map.
 */
const BuyerOrderTracking = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { order: o, tracking: t } = await getOrderTracking(orderId);
      setOrder(o);
      setTracking(t);
      setError('');
    } catch {
      setError('Could not load tracking for this order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const freshness = tracking?.vehicle ? formatLocationFreshness(tracking.vehicle) : null;

  return (
    <DashboardLayout title="Track order" subtitle={order ? `Order #${order._id.slice(-6).toUpperCase()}` : ''}>
      <Link to="/buyer/dashboard" className="text-sm text-primary underline">
        &larr; Back to orders
      </Link>

      {loading && <p className="mt-6 text-sm text-gray-400">Loading…</p>}
      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      {!loading && !error && order && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {formatStatus(order.status)}
            </span>
            {freshness && <span className={`text-xs ${freshness.tone}`}>{freshness.text}</span>}
            <span className="ml-auto text-xs text-gray-400">Auto-refreshes every {POLL_INTERVAL_MS / 1000}s</span>
          </div>

          {!tracking?.vehicle && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              The Shipper hasn't requested a truck for this order yet, or the driver hasn't started sharing
              location. The map will populate automatically once live tracking begins.
            </div>
          )}

          {order && (
            <>
              <TrackingMap
                tracking={tracking}
                className="shadow border border-gray-200"
                emptyMessage="No live tracking yet — this will appear once a driver is assigned and starts sharing their location."
              />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] uppercase text-gray-400">Shipment status</p>
                  <p className="text-sm font-semibold capitalize text-gray-800">
                    {tracking ? formatStatus(tracking.status) : 'Waiting for live tracking'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] uppercase text-gray-400">Driver</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {tracking?.driver?.name || 'Not yet assigned'}
                  </p>
                  {tracking?.driver?.phone && <p className="text-xs text-gray-400">{tracking.driver.phone}</p>}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] uppercase text-gray-400">Vehicle</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {tracking?.vehicle ? `${tracking.vehicle.registrationNumber} (${tracking.vehicle.type})` : 'Not yet assigned'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BuyerOrderTracking;