import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const AgencyDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
      subtitle="Managing agency logistics and active vehicle tracking."
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AgencyDashboard;