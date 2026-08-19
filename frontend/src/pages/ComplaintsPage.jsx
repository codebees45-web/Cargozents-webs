import { useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import ComplaintForm from '../components/complaints/ComplaintForm';
import MyComplaints from '../components/complaints/MyComplaints';

export default function ComplaintsPage() {
  const [tab, setTab] = useState('submit');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout title="Complaints" subtitle="File a complaint or track the ones you've already raised.">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex gap-2 border-b border-primary/10">
          <button
            onClick={() => setTab('submit')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              tab === 'submit' ? 'border-b-2 border-[#00E676] text-primary' : 'text-[#5B7A70] hover:text-primary'
            }`}
          >
            File a complaint
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              tab === 'mine' ? 'border-b-2 border-[#00E676] text-primary' : 'text-[#5B7A70] hover:text-primary'
            }`}
          >
            My complaints
          </button>
        </div>

        {tab === 'submit' && (
          <ComplaintForm
            onCreated={() => {
              setRefreshKey((k) => k + 1);
              setTab('mine');
            }}
          />
        )}
        {tab === 'mine' && <MyComplaints key={refreshKey} />}
      </div>
    </DashboardLayout>
  );
}