import React, { useState, useEffect } from 'react';
import { 
  getReceivedOrders, 
  confirmOrder, 
  rejectOrder, 
  assignTruck, 
  getOrderTracking, 
  updateStatus 
} from '../services/orderService';
import { getAgencyTrucks } from '../services/agencyService';

const NEXT_STATUS = {
  awaiting_shipment: { value: 'shipment_requested', label: 'Mark Shipment Requested' },
  shipment_requested: { value: 'out_for_delivery', label: 'Mark Out for Delivery' },
  out_for_delivery: { value: 'delivered', label: 'Mark Delivered' },
};

const AgencyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [isLoadingTrucks, setIsLoadingTrucks] = useState(false);
  const [assigningTruckId, setAssigningTruckId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [assignError, setAssignError] = useState('');

  const [pendingActionId, setPendingActionId] = useState(null);

  const [timelineOrderId, setTimelineOrderId] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setError(null);
    try {
      const { data } = await getReceivedOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const status = err.response?.status;
      if (status === 401) {
        setError('Your session expired. Please log in again.');
      } else if (status === 403) {
        setError('Your account is not authorized to view received orders.');
      } else {
        setError(err.response?.data?.message || err.message || 'Could not load orders right now.');
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleDecline = async (orderId) => {
    setActionError(null);
    setPendingActionId(orderId);
    try {
      await rejectOrder(orderId);
      setOrders((prev) => prev.filter((order) => (order._id || order.id) !== orderId));
    } catch (err) {
      console.error('Error declining order:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to decline order.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleAccept = async (order) => {
    const orderId = order._id || order.id;
    setActionError(null);
    setPendingActionId(orderId);
    try {
      const { data } = await confirmOrder(orderId);
      const confirmed = data.order || order;
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? confirmed : o))
      );
      setSelectedOrder(confirmed);
      setIsModalOpen(true);
      fetchAvailableTrucks();
    } catch (err) {
      console.error('Error accepting order:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to accept order.');
    } finally {
      setPendingActionId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setAvailableTrucks([]);
    setAssignError('');
  };

  const fetchAvailableTrucks = async () => {
    setIsLoadingTrucks(true);
    setAssignError('');
    try {
      const { data } = await getAgencyTrucks();
      const trucks = (data.trucks || []).filter((t) => t.isActive);
      setAvailableTrucks(trucks);
    } catch (err) {
      console.error('Error fetching trucks:', err);
      setAssignError('Could not load your fleet right now.');
      setAvailableTrucks([]);
    } finally {
      setIsLoadingTrucks(false);
    }
  };

  const handleAssignTruck = async (truck) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    setAssigningTruckId(truck._id);
    setAssignError('');
    try {
      const { data } = await assignTruck(orderId, truck._id);
      const updated = data.order;
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? updated : o))
      );
      closeModal();
    } catch (err) {
      console.error('Error assigning truck:', err);
      setAssignError(err.response?.data?.message || err.message || 'Failed to assign truck.');
    } finally {
      setAssigningTruckId(null);
    }
  };

  const openTimeline = async (orderId) => {
    setTimelineOrderId(orderId);
    setTimelineData(null);
    setTimelineError('');
    setTimelineLoading(true);
    try {
      const { data } = await getOrderTracking(orderId);
      setTimelineData(data);
    } catch (err) {
      setTimelineError(err.response?.data?.message || "Could not load this order's timeline.");
    } finally {
      setTimelineLoading(false);
    }
  };

  const closeTimeline = () => {
    setTimelineOrderId(null);
    setTimelineData(null);
    setTimelineError('');
  };

  const handleAdvanceStatus = async (nextStatus) => {
    if (!timelineOrderId) return;
    setAdvancing(true);
    setTimelineError('');
    try {
      const { data } = await updateStatus(timelineOrderId, nextStatus);
      const updated = data.order;
      setOrders((prev) => prev.map((o) => ((o._id || o.id) === timelineOrderId ? updated : o)));
      await openTimeline(timelineOrderId);
    } catch (err) {
      setTimelineError(err.response?.data?.message || 'Could not update the order status.');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6 p-6 w-full ">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary tracking-tight">Orders Received</h2>
          <p className="mt-1 text-xs text-[#5B7A70]">Review and confirm client shipment requests.</p>
        </div>
        {error && (
          <button
            onClick={fetchOrders}
            className="rounded-md bg-secondary/10 border border-primary/10 px-3 py-1.5 text-xs font-bold text-accent transition-all hover:bg-secondary/30"
          >
            Retry Connection
          </button>
        )}
      </div>

      {actionError && (
        <div className="text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-md px-4 py-2.5">
          {actionError}
        </div>
      )}

      {/* ORDERS TABLE CONTAINER */}
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-secondary/10 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-primary/10 bg-background font-mono text-[11px] uppercase tracking-wider text-[#5B7A70]">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoadingOrders ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/10 border-t-accent" />
                    <p className="text-xs font-medium text-[#5B7A70]">Loading incoming orders…</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="bg-danger/5 px-6 py-10 text-center text-xs font-semibold text-danger border-t border-primary/10">
                  ⚠️ {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <h3 className="mb-2 font-display text-lg font-bold text-primary">No orders yet</h3>
                  <p className="mx-auto max-w-md text-xs font-medium text-[#5B7A70]">
                    Waiting for shippers to place backhaul requests. When a new order comes in, it will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderId = order._id || order.id || 'N/A';
                const clientName = order.buyer?.name || order.client?.name || 'Unknown Client';
                const routeInfo = order.route || `${order.pickup?.city || 'Origin'} to ${order.delivery?.city || order.dropoff?.city || 'Destination'}`;
                const isPending = pendingActionId === orderId;
                const canRespond = order.status === 'placed';

                return (
                  <tr key={orderId} className="transition-colors hover:bg-secondary/20">
                    <td className="px-6 py-4 text-sm font-semibold text-accent font-mono">
                      #{orderId.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary/80">{clientName}</td>
                    <td className="px-6 py-4 text-sm text-[#5B7A70]">{routeInfo}</td>
                    <td className="px-6 py-4 text-sm text-primary/80 font-medium">₹{order.productTotal || '—'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#5B7A70] capitalize">
                      {(order.status || '').replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canRespond ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isPending}
                            onClick={() => handleAccept(order)}
                            className="bg-accent text-[#0A110E] text-xs font-bold px-4 py-2 rounded-md hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {isPending ? 'Accepting…' : 'Accept'}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleDecline(orderId)}
                            className="bg-transparent border border-danger/30 text-danger text-xs font-bold px-4 py-2 rounded-md hover:bg-danger/10 transition-all disabled:opacity-50"
                          >
                            {isPending ? 'Declining…' : 'Decline'}
                          </button>
                        </div>
                      ) : order.status === 'confirmed_by_shipper' || order.status === 'accepted' ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                            fetchAvailableTrucks();
                          }}
                          className="bg-secondary/20 text-accent border border-accent/20 text-xs font-bold px-4 py-2 rounded-md hover:bg-secondary/30 transition-all"
                        >
                          Assign Truck
                        </button>
                      ) : (
                        <button
                          onClick={() => openTimeline(orderId)}
                          className="bg-transparent border border-primary/10 text-primary/80 text-xs font-bold px-4 py-2 rounded-md hover:border-accent/40 hover:text-accent transition-all"
                        >
                          View Timeline
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* TRUCK ASSIGNMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-primary/10 bg-secondary/10 shadow-xl">
            <div className="flex items-center justify-between border-b border-primary/10 bg-background px-6 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-primary">Assign Truck</h3>
                <p className="mt-0.5 text-xs text-[#5B7A70]">Assigning an active truck from your fleet for this request.</p>
              </div>
              <button onClick={closeModal} className="text-[#5B7A70] transition-colors hover:text-primary text-sm font-semibold">
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <h4 className="mb-4 font-mono text-[11px] font-black uppercase tracking-wider text-[#5B7A70]">
                Available Fleet
              </h4>

              {assignError && (
                <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger leading-relaxed font-medium">
                  ⚠️ {assignError}
                </div>
              )}

              {isLoadingTrucks ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/10 border-t-accent" />
                  <p className="text-xs font-medium text-[#5B7A70]">Loading your fleet…</p>
                </div>
              ) : availableTrucks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5B7A70] border border-dashed border-primary/10 rounded-lg">
                  No active trucks in your fleet. Add one from your fleet dashboard.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTrucks.map((truck) => (
                    <div
                      key={truck._id}
                      className="flex items-center justify-between rounded-lg border border-primary/10 bg-secondary/10 p-4 transition-all hover:border-accent/30 hover:bg-background"
                    >
                      <div>
                        <p className="text-sm font-bold text-primary">{truck.registrationNumber}</p>
                        <p className="mt-1 text-xs text-[#5B7A70]">
                          {truck.type} • <span className="font-semibold text-accent">{truck.capacityWeight} Tons</span>
                        </p>
                      </div>
                      <button
                        disabled={assigningTruckId === truck._id}
                        className="rounded-md bg-accent px-4 py-2 text-xs font-bold text-[#0A110E] transition-all hover:opacity-90 disabled:opacity-50"
                        onClick={() => handleAssignTruck(truck)}
                      >
                        {assigningTruckId === truck._id ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE MODAL */}
      {timelineOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-primary/10 bg-secondary/10 shadow-xl">
            <div className="flex items-center justify-between border-b border-primary/10 bg-background px-6 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-primary">Order Timeline</h3>
                <p className="mt-0.5 text-xs text-[#5B7A70]">#{timelineOrderId.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={closeTimeline} className="text-[#5B7A70] transition-colors hover:text-primary text-sm font-semibold">
                ✕ Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {timelineLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-7 h-7 border-2 border-primary/10 border-t-accent rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-[#5B7A70]">Loading timeline...</p>
                </div>
              ) : (
                <>
                  {timelineData && (
                    <div className="rounded-lg bg-background border border-primary/10 px-4 py-3">
                      <p className="text-[11px] uppercase text-[#5B7A70] font-bold tracking-wider">Current status</p>
                      <p className="text-sm font-bold text-accent capitalize mt-1">
                        {(timelineData.tracking?.status || '').replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}

                  {timelineError && (
                    <div className="text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-md px-4 py-2.5">
                      {timelineError}
                    </div>
                  )}

                  {timelineData?.tracking?.timeline?.length > 0 ? (
                    <ol className="space-y-4 border-l-2 border-primary/10 pl-4 ml-2">
                      {timelineData.tracking.timeline.map((event, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent" />
                          <p className="text-sm font-bold text-primary capitalize">
                            {(event.status || '').replace(/_/g, ' ')}
                          </p>
                          {event.message && <p className="text-xs text-[#5B7A70] mt-0.5">{event.message}</p>}
                          <p className="text-[11px] text-[#5B7A70] mt-0.5">
                            {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    !timelineLoading && <p className="text-sm text-[#5B7A70] text-center">No timeline events recorded yet.</p>
                  )}

                  {timelineData?.tracking?.status && NEXT_STATUS[timelineData.tracking.status] && (
                    <button
                      disabled={advancing}
                      onClick={() => handleAdvanceStatus(NEXT_STATUS[timelineData.tracking.status].value)}
                      className="w-full mt-2 bg-accent text-[#0A110E] text-xs font-bold px-4 py-2.5 rounded-md hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                    >
                      {advancing ? 'Updating…' : NEXT_STATUS[timelineData.tracking.status].label}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyOrders;