import React, { useState, useEffect } from 'react';
// ✅ FIXED: Path changed from '../../' to '../'
import DashboardLayout from '../components/common/DashboardLayout';

export default function ShipperNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const masterSwitch = localStorage.getItem('masterNotifications');
    if (masterSwitch !== null) {
      setNotificationsEnabled(masterSwitch === 'true');
    }
  }, []);

  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Bid Received', message: 'Agency "FastTrack Logistics" placed a bid of ₹18,000 for your Mumbai backhaul.', time: '2 mins ago', urgent: true },
    { id: 2, title: 'Vehicle Arrived', message: 'Truck TN-22-CX-4500 has arrived at the pickup location for Order #CB-8941.', time: '25 mins ago', urgent: false },
    { id: 3, title: 'Invoice Generated', message: 'Freight invoice for Order #CB-8800 is now available for download.', time: '2 hrs ago', urgent: false },
  ]);

  const handleMarkAsRead = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <DashboardLayout 
      title="Shipper Activity" 
      subtitle="Track bids, vehicle arrivals, and invoice updates for your posted loads."
    >
      <div className="max-w-4xl pb-10">
        {!notificationsEnabled ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-3 text-amber-700 font-bold text-lg">⚠️</div>
            <h3 className="text-md font-bold text-amber-900 mb-1">Notifications are Muted</h3>
            <p className="text-xs text-amber-700 max-w-sm mx-auto">
              You have turned off alerts in your Settings.
            </p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mb-3 text-gray-500 font-bold text-xl">🎉</div>
            <h3 className="text-md font-bold text-[#133C2C] mb-1">All caught up!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You have read all your shipper notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl border bg-white shadow-sm flex items-start gap-4 border-l-4 transition-all duration-300 hover:shadow-md ${notif.urgent ? 'border-l-red-500' : 'border-l-purple-600'}`}>
                <div className="p-2 rounded-lg text-xs font-bold mt-0.5 bg-purple-50 text-purple-700">🏢</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#133C2C] flex items-center gap-2">
                      {notif.title}
                      {notif.urgent && <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 font-extrabold rounded animate-pulse">ACTION REQUIRED</span>}
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{notif.message}</p>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}