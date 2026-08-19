import { useEffect, useRef } from 'react';
import socket from '../services/socketService';

/**
 * Subscribes to real-time GPS pushes for a single vehicle over Socket.IO.
 *
 * This is the "instant update" half of live tracking — the backend still
 * receives location fixes over plain HTTP (see useLiveLocationSharing),
 * validates/throttles/persists them, and then broadcasts the result to
 * everyone watching that vehicle's `vehicle:<id>` room. This hook just
 * joins that room and hands each push straight to `onUpdate`, so the
 * calling screen can patch its tracking state without waiting for its
 * next poll.
 *
 * Polling isn't removed anywhere this is used — it stays as a slow
 * fallback in case a socket drops or a tab was backgrounded, and it's
 * still what picks up non-location changes (status, driver assignment,
 * etc). This hook only makes the position itself feel instant.
 *
 * @param {string|null|undefined} vehicleId - vehicle to track, or falsy to stay idle
 * @param {(payload: { vehicleId: string, coordinates?: [number, number], accuracy?: number|null, locationUpdatedAt?: string, stopped?: boolean }) => void} onUpdate
 */
export default function useLiveTracking(vehicleId, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!vehicleId) return undefined;

    socket.connect();
    socket.emit('join-tracking', { vehicleId });

    const handleUpdate = (payload) => {
      if (payload?.vehicleId !== vehicleId) return;
      onUpdateRef.current(payload);
    };
    const handleStopped = (payload) => {
      if (payload?.vehicleId !== vehicleId) return;
      onUpdateRef.current({ ...payload, stopped: true });
    };

    socket.on('location-update', handleUpdate);
    socket.on('location-stopped', handleStopped);

    return () => {
      socket.emit('leave-tracking', { vehicleId });
      socket.off('location-update', handleUpdate);
      socket.off('location-stopped', handleStopped);
    };
  }, [vehicleId]);
}

/**
 * Same idea, but for the network-wide fleet map — joins the single shared
 * `fleet` room instead of one room per vehicle, since that screen may have
 * dozens of vehicles on it at once.
 *
 * @param {boolean} enabled
 * @param {(payload: any) => void} onUpdate
 */
export function useFleetTracking(enabled, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled) return undefined;

    socket.connect();
    socket.emit('join-tracking', { fleet: true });

    const handle = (payload) => onUpdateRef.current(payload);
    socket.on('location-update', handle);
    socket.on('location-stopped', handle);

    return () => {
      socket.emit('leave-tracking', { fleet: true });
      socket.off('location-update', handle);
      socket.off('location-stopped', handle);
    };
  }, [enabled]);
}