import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const AgencyDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <DashboardLayout
      title={t('agencyDashboard.title', { name: user?.name?.split(' ')[0] || '' })}
      subtitle={t('agencyDashboard.subtitle')}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AgencyDashboard;