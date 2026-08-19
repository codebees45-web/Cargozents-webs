import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

const notificationData = [
  {
    id: 1,
    title: "Driver Assigned",
    message: "A driver has been assigned to shipment CGZ-100125.",
    type: "Shipment",
    time: "5 mins ago",
    read: false,
  },
  {
    id: 2,
    title: "Payment Successful",
    message: "Payment received for Order CGZ-100124.",
    type: "Payment",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 3,
    title: "Shipment Delivered",
    message: "Your shipment CGZ-100118 has been delivered successfully.",
    type: "Delivery",
    time: "Yesterday",
    read: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO
    // buyerService.getNotifications()
    setNotifications(notificationData);
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      return (
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.message.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [notifications, search]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay updated with your shipments and payments."
    >
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row justify-between gap-4">

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-96 rounded-lg border border-primary/10 px-4 py-3"
          />

          <button
            onClick={markAllAsRead}
            className="rounded-lg bg-primary px-5 py-3 text-white transition hover:opacity-90"
          >
            Mark All as Read
          </button>

        </div>

        <div className="space-y-4">

          {filteredNotifications.map((notification) => (

            <div
              key={notification.id}
              className={`rounded-xl border p-6 shadow-sm transition ${
                notification.read
                  ? "border-primary/10 bg-white"
                  : "border-primary bg-primary/5"
              }`}
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="font-semibold text-primary">
                    {notification.title}
                  </h3>

                  <p className="mt-2 text-[#5B7A70]">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-[#5B7A70]">
                    {notification.time}
                  </p>

                </div>

                {!notification.read && (
                  <span className="h-3 w-3 rounded-full bg-primary"></span>
                )}

              </div>

            </div>

          ))}

          {filteredNotifications.length === 0 && (
            <div className="rounded-xl border border-primary/10 bg-white p-12 text-center">

              <h3 className="text-lg font-semibold text-primary">
                No Notifications Found
              </h3>

              <p className="mt-2 text-[#5B7A70]">
                There are no notifications matching your search.
              </p>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}