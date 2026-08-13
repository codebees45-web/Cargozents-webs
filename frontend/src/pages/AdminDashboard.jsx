import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Admin'}!`}
    >
      <div className="p-6">
        <h2 className="font-display text-lg font-semibold text-primary">Overview</h2>
        <p className="mt-2 text-sm text-[#5B7A70]">
          Admin features will be available here soon.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
