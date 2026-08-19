import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ReviewModal from '../components/common/ReviewModal';
import api from '../services/api';
import { reviewOrderShipper } from '../services/reviewService';
import { useCart } from '../context/CartContext';

const POLL_INTERVAL_MS = 15000;
const ACTIVE_STATUSES = ['placed', 'confirmed_by_shipper', 'awaiting_shipment', 'shipment_requested', 'out_for_delivery'];

const STATUS_STYLES = {
  placed: 'bg-secondary text-primary/70',
  confirmed_by_shipper: 'bg-primary/10 text-primary',
  awaiting_shipment: 'bg-primary/10 text-primary',
  shipment_requested: 'bg-warning/10 text-warning',
  out_for_delivery: 'bg-warning/10 text-warning',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

// Freight ("Book Shipment") orders track their status separately, on
// tracking.currentStatus, using its own vocabulary.
const SHIPMENT_STATUS_STYLES = {
  Submitted: 'bg-secondary text-primary/70',
  'Admin Review': 'bg-primary/10 text-primary',
  Approved: 'bg-primary/10 text-primary',
  'Driver Assigned': 'bg-warning/10 text-warning',
  'Driver Accepted': 'bg-warning/10 text-warning',
  'Pickup Started': 'bg-warning/10 text-warning',
  'Picked Up': 'bg-warning/10 text-warning',
  'In Transit': 'bg-warning/10 text-warning',
  'Reached Destination': 'bg-warning/10 text-warning',
  Delivered: 'bg-success/10 text-success',
  Completed: 'bg-success/10 text-success',
  Cancelled: 'bg-danger/10 text-danger',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Normalizes a product order or a freight/shipment order into the same
// shape so the list below doesn't need to branch everywhere.
const describeOrder = (o) => {
  if (o.orderType === 'shipment') {
    const status = o.tracking?.currentStatus || 'Submitted';
    return {
      title: o.goods?.name || 'Shipment',
      extraCount: 0,
      thumb: null,
      amount: o.pricing?.totalAmount || 0,
      statusLabel: status.toUpperCase(),
      statusClass: SHIPMENT_STATUS_STYLES[status] || 'bg-secondary text-primary/70',
      isDelivered: ['Delivered', 'Completed'].includes(status),
      isCancelled: status === 'Cancelled',
      isActive: !['Delivered', 'Completed', 'Cancelled'].includes(status),
      isProduct: false,
    };
  }
  const status = o.status || 'placed';
  return {
    title: o.items?.[0]?.product?.name || 'Order',
    extraCount: (o.items?.length || 1) - 1,
    thumb: o.items?.[0]?.product?.images?.[0],
    amount: o.productTotal || 0,
    statusLabel: status.replace(/_/g, ' ').toUpperCase(),
    statusClass: STATUS_STYLES[status] || 'bg-secondary text-primary/70',
    isDelivered: status === 'delivered',
    isCancelled: status === 'cancelled',
    isActive: ACTIVE_STATUSES.includes(status),
    isProduct: true,
  };
};

const BuyerDashboard = () => {
  const [orders, setOrders] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null); // order being rated, or null
  const [reorderNote, setReorderNote] = useState('');
  const { cart, restoreOrder } = useCart();
  const navigate = useNavigate();
  const pollRef = useRef(null);

  const markReviewed = (orderId) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, hasReview: true } : o)));
  };

  const fetchOrders = () => {
    api
      .get('/orders/my-orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders((prev) => prev ?? []));
  };

  useEffect(() => {
    fetchOrders();
    // Poll while any order is still moving through its lifecycle, same as
    // Swiggy's live order-status refresh — stop once nothing is active to
    // avoid needless requests.
    pollRef.current = setInterval(() => {
      setOrders((prev) => {
        if (prev?.some((o) => describeOrder(o).isActive)) fetchOrders();
        return prev;
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleReorder = (order) => {
    if (cart.items.length > 0 && cart.shipperId !== (order.shipper?._id || order.shipper)) {
      const confirmed = window.confirm('This will replace the items currently in your cart. Continue?');
      if (!confirmed) return;
    }
    const result = restoreOrder(order);
    if (result === 'unavailable') {
      setReorderNote('None of the items from that order are available right now.');
      return;
    }
    navigate('/buyer/checkout');
  };

  const activeOrder = orders?.find((o) => describeOrder(o).isActive);
  const activeOrderView = activeOrder ? describeOrder(activeOrder) : null;

  return (
    <DashboardLayout title="My orders" subtitle="Your past and current orders.">
      {activeOrderView && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="font-mono-ls text-[11px] text-primary">ACTIVE ORDER</p>
          <p className="mt-1 text-sm text-primary">
            ₹{activeOrderView.amount} · {activeOrderView.statusLabel.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      {reorderNote && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-sm text-warning">
          {reorderNote}
        </div>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-primary">Order history</h2>
        <div className="mt-4">
          {orders === null ? (
            <TruckLoader fullScreen={false} />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" body="Your past and current orders will show up here once you place one." />
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const view = describeOrder(o);
                return (
                  <li key={o._id} className="rounded-xl border border-primary/10 bg-secondary/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                        {view.thumb ? (
                          <img src={view.thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/20">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold text-primary">
                              {view.title}
                              {view.extraCount > 0 && <span className="text-muted"> +{view.extraCount} more</span>}
                              {!view.isProduct && <span className="ml-2 text-[10px] font-mono-ls text-muted/70">FREIGHT</span>}
                            </p>
                            <p className="mt-0.5 font-mono-ls text-[10px] text-muted">
                              #{o._id.slice(-6).toUpperCase()} · {formatDate(o.createdAt)}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 font-mono-ls text-[9px] tracking-wide ${view.statusClass}`}>
                            {view.statusLabel}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="font-display text-sm font-bold text-primary">₹{view.amount}</p>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              to={`/buyer/orders/${o._id}`}
                              className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                            >
                              Details
                            </Link>
                            {view.isActive && (
                              <Link
                                to={`/buyer/orders/${o._id}/track`}
                                className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                              >
                                Track
                              </Link>
                            )}
                            {view.isProduct && view.isDelivered &&
                              (o.hasReview ? (
                                <span className="self-center font-mono-ls text-[11px] text-success">RATED</span>
                              ) : (
                                <button
                                  onClick={() => setReviewTarget(o)}
                                  className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                                >
                                  Rate shipper
                                </button>
                              ))}
                            {view.isProduct && (view.isDelivered || view.isCancelled) && (
                              <button
                                onClick={() => handleReorder(o)}
                                className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-primary transition hover:shadow-glow"
                              >
                                Reorder
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {reviewTarget && (
        <ReviewModal
          title="Rate this shipper"
          subtitle={`For your ₹${reviewTarget.productTotal} order`}
          onSubmit={async (rating, comment) => {
            await reviewOrderShipper(reviewTarget._id, rating, comment);
            markReviewed(reviewTarget._id);
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;