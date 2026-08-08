import { useEffect, useState } from "react";
import socket from "../services/socketService";

export default function useTracking(orderId) {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    socket.connect();

    socket.emit("join-booking", orderId);

    socket.on("location-update", (location) => {
      setDriverLocation(location);
    });

    return () => {
      socket.off("location-update");
    };
  }, [orderId]);

  return driverLocation;
}