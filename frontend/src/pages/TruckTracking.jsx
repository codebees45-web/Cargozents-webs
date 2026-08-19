import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import TrackingMap from '../components/common/TrackingMap';
import { getMyShipments, getAssignedShipments, getAgencyShipments, getShipmentTracking } from '../services/shipmentService';
import useLiveTracking from '../hooks/useLiveTracking';

const POLL_INTERVAL_MS = 45000;

const STATUS_STYLES = {
  requested: 'border-primary/15 bg-secondary/20 text-[#5B7A70]',
  assigned: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-blue-200 bg-blue-50 text-blue-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  picked_up: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  in_transit: 'border-green-200 bg-green-50 text-green-700',
  delivered: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
};

const ACTIVE_STATUSES = ['assigned', 'accepted', 'picked_up', 'in_transit'];

const formatStatus = (status) => (status || '').replace(/_/g, ' ');

const TruckTracking = () => {
  const { user } = useAuth();

  const [shipments, setShipments] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [loadingTracking, setLoadingTracking] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchShipments =
      user?.role === 'driver' ? getAssignedShipments :
      user?.role === 'agency' ? getAgencyShipments :
      getMyShipments;

    fetchShipments()
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.shipments || [];
        setShipments(list);
        const firstActive = list.find((s) => ACTIVE_STATUSES.includes(s.status)) || list[0];
        if (firstActive) setSelectedId(firstActive._id);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load shipments right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const fetchTracking = useCallback((id) => {
    if (!id) return;
    getShipmentTracking(id)
      .then(({ data }) => {
        setTracking(data.tracking);
        setTrackingError('');
      })
      .catch(() => {
        setTrackingError('Could not load live tracking for this shipment.');
      })
      .finally(() => setLoadingTracking(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setTracking(null);
      return undefined;
    }

    setLoadingTracking(true);
    fetchTracking(selectedId);

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchTracking(selectedId), POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [selectedId, fetchTracking]);

  useLiveTracking(tracking?.vehicle?.id, (payload) => {
    setTracking((prev) => {
      if (!prev?.vehicle) return prev;
      return {
        ...prev,
        vehicle: {
          ...prev.vehicle,
          ...(payload.stopped
            ? { isSharingLocation: false }
            : {
                currentLocation: { type: 'Point', coordinates: payload.coordinates },
                locationUpdatedAt: payload.locationUpdatedAt,
                isSharingLocation: true,
              }),
        },
      };
    });
  });

  return (
    <div className="p-6 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary/90">Live Truck Tracking</h1>
        {tracking && (
          <span className="text-xs text-[#5B7A70]">Live position · refreshes every {POLL_INTERVAL_MS / 1000}s</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 bg-secondary/20 p-6 rounded-lg shadow border border-primary/10">
          <h2 className="font-semibold text-[#5B7A70] mb-4">
            {user?.role === 'driver' ? 'Your Trips' : 'Your Shipments'}
          </h2>

          {error && <p className="text-sm text-danger">{error}</p>}

          {shipments === null && !error && (
            <p className="text-sm text-[#5B7A70]">Loading shipments…</p>
          )}

          {shipments?.length === 0 && (
            <p className="text-sm text-[#5B7A70]">No shipments to track yet.</p>
          )}

          <div className="space-y-3">
            {shipments?.map((s) => {
              const isSelected = s._id === selectedId;
              const statusStyle = STATUS_STYLES[s.status] || STATUS_STYLES.requested;
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelectedId(s._id)}
                  className={`w-full text-left border rounded p-4 transition ${statusStyle} ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <h4 className="font-bold text-sm">
                    {s.assignedVehicle?.registrationNumber || `Shipment #${s._id.slice(-6).toUpperCase()}`}
                  </h4>
                  <p className="text-xs mt-1 capitalize">Status: {formatStatus(s.status)}</p>
                  <p className="text-xs">
                    {s.pickup?.city} → {s.drop?.city}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {trackingError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-danger">{trackingError}</div>
          )}

          {loadingTracking && !tracking && (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-primary/10 bg-secondary/20">
              <p className="text-[#5B7A70]">Loading map…</p>
            </div>
          )}

          {!selectedId && !loadingTracking && (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-primary/10 bg-secondary/20">
              <p className="text-[#5B7A70]">Select a shipment to view its live location.</p>
            </div>
          )}

          {selectedId && !loadingTracking && (
            <>
              <TrackingMap
                tracking={tracking}
                className="shadow border border-gray-300"
                emptyMessage="No live location yet for this shipment — it'll appear once a driver starts sharing their GPS."
              />

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-primary/15 bg-secondary/20 p-3">
                  <p className="text-[11px] uppercase text-[#5B7A70]">Status</p>
                  <p className="text-sm font-semibold capitalize text-primary/90">
                    {tracking ? formatStatus(tracking.status) : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/15 bg-secondary/20 p-3">
                  <p className="text-[11px] uppercase text-[#5B7A70]">Driver</p>
                  <p className="text-sm font-semibold text-primary/90">
                    {tracking?.driver?.name || 'Not yet assigned'}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/15 bg-secondary/20 p-3">
                  <p className="text-[11px] uppercase text-[#5B7A70]">Vehicle</p>
                  <p className="text-sm font-semibold text-primary/90">
                    {tracking?.vehicle ? `${tracking.vehicle.registrationNumber} (${tracking.vehicle.type})` : 'Not yet assigned'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruckTracking;