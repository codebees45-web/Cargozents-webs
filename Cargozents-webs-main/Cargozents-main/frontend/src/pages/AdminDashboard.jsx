import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [pendingShipments, setPendingShipments] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState(null);
  const [openComplaints, setOpenComplaints] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/admin/shipments?status=requested'),
      api.get('/admin/drivers?approved=false'),
      api.get('/complaints'),
      api.get('/admin/vehicles?verified=true'),
    ])
      .then(([shipmentsRes, driversRes, complaintsRes, vehiclesRes]) => {
        if (cancelled) return;
        setPendingShipments(shipmentsRes.data.shipments || []);
        setPendingDrivers(driversRes.data.drivers || []);
        const complaints = complaintsRes.data.data || [];
        setOpenComplaints(complaints.filter((c) => c.status === 'open').length);
        const vehicles = vehiclesRes.data.vehicles || [];
        setActiveVehicles(vehicles.filter((v) => v.isActive).length);
      })
      .catch(() => {
        if (cancelled) return;
        setPendingShipments([]);
        setPendingDrivers([]);
        setOpenComplaints(0);
        setActiveVehicles(0);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout title="Admin overview" subtitle="Assign trucks, verify drivers, keep the network moving.">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatField label="AWAITING ASSIGNMENT" value={pendingShipments === null ? '—' : pendingShipments.length} />
        <StatField label="DRIVERS TO VERIFY" value={pendingDrivers === null ? '—' : pendingDrivers.length} />
        <StatField label="OPEN COMPLAINTS" value={openComplaints === null ? '—' : openComplaints} />
        <StatField label="ACTIVE VEHICLES" value={activeVehicles === null ? '—' : activeVehicles} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary">Shipment requests</h2>
          <a href="/admin/shipments" className="text-xs text-primary hover:underline">View all</a>
        </div>
        <div className="mt-4">
          {pendingShipments === null ? (
            <TruckLoader fullScreen={false} />
          ) : pendingShipments.length === 0 ? (
            <EmptyState title="Nothing waiting" body="Shipment requests needing a driver assignment will queue up here." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {pendingShipments.map((s) => (
                <li key={s._id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono-ls text-xs text-[#5B7A70]">
                    {s.pickup?.city} → {s.drop?.city} · {s.vehicleRequired}
                  </span>
                  <a href="/admin/shipments" className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-primary">
                    Assign driver
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary">Driver verification</h2>
          <a href="/admin/drivers" className="text-xs text-primary hover:underline">View all</a>
        </div>
        <div className="mt-4">
          {pendingDrivers === null ? (
            <TruckLoader fullScreen={false} />
          ) : pendingDrivers.length === 0 ? (
            <EmptyState title="No drivers waiting" body="New driver document submissions will show up here for approval." />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {pendingDrivers.map((d) => (
                <li key={d._id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono-ls text-xs text-[#5B7A70]">{d.name}</span>
                  <a href="/admin/drivers" className="rounded-lg border border-primary/20 px-3 py-1 text-xs text-primary">
                    Review documents
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;