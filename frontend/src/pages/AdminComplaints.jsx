import DashboardLayout from '../components/common/DashboardLayout';
import AdminComplaintsPanel from '../components/complaints/AdminComplaintsPanel';

export default function AdminComplaints() {
  return (
    <DashboardLayout title="Manage complaints" subtitle="Review and resolve complaints raised across the network.">
      <div className="mx-auto max-w-3xl">
        <AdminComplaintsPanel />
      </div>
    </DashboardLayout>
  );
}