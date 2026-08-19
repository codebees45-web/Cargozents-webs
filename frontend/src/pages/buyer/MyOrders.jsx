import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/buyer/StatusBadge";

const sampleOrders = [
  {
    id: "CGZ-100125",
    pickup: "Chennai",
    destination: "Coimbatore",
    status: "In Transit",
    vehicle: "Mini Truck",
    amount: 850,
    payment: "Paid",
    bookedAt: "18 Jul 2026",
  },
  {
    id: "CGZ-100126",
    pickup: "Madurai",
    destination: "Salem",
    status: "Pending",
    vehicle: "Pickup Truck",
    amount: 620,
    payment: "Pending",
    bookedAt: "19 Jul 2026",
  },
  {
    id: "CGZ-100127",
    pickup: "Chennai",
    destination: "Bangalore",
    status: "Delivered",
    vehicle: "Container",
    amount: 3400,
    payment: "Paid",
    bookedAt: "15 Jul 2026",
  },
];

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace later
    // buyerService.getMyOrders()

    setTimeout(() => {
      setOrders(sampleOrders);
      setLoading(false);
    }, 500);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.pickup.toLowerCase().includes(search.toLowerCase()) ||
        order.destination.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "All" || order.status === status;

      return matchSearch && matchStatus;
    });
  }, [orders, search, status]);

  const handleCancel = (orderId) => {
    const confirmed = window.confirm(
      `Cancel shipment ${orderId}?`
    );

    if (!confirmed) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: "Cancelled" }
          : order
      )
    );
  };

  return (
    <DashboardLayout
      title="My Orders"
      subtitle="Manage all your shipment bookings."
    >
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row justify-between gap-4">

          <input
            type="text"
            placeholder="Search by Order ID, Pickup or Destination"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-96 rounded-lg border border-primary/10 px-4 py-3"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full lg:w-52 rounded-lg border border-primary/10 px-4 py-3"
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Transit</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

        </div>

        {loading ? (

          <div className="rounded-xl bg-white border border-primary/10 p-12 text-center">
            Loading orders...
          </div>

        ) : filteredOrders.length === 0 ? (

          <div className="rounded-xl bg-white border border-primary/10 p-12 text-center">
            <h3 className="text-xl font-semibold text-primary">
              No Orders Found
            </h3>

            <p className="mt-2 text-[#5B7A70]">
              Try changing your search or filters.
            </p>
          </div>

        ) : (

          filteredOrders.map((order) => (

            <div
              key={order.id}
              className="rounded-xl border border-primary/10 bg-white shadow-sm p-6"
            >

              <div className="flex flex-col lg:flex-row justify-between gap-8">

                <div>

                  <h2 className="text-lg font-semibold text-primary">
                    {order.id}
                  </h2>

                  <p className="mt-2 text-[#5B7A70]">
                    {order.pickup} → {order.destination}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">

                    <div>
                      <span className="text-[#5B7A70]">
                        Vehicle
                      </span>

                      <p className="font-medium">
                        {order.vehicle}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#5B7A70]">
                        Amount
                      </span>

                      <p className="font-medium">
                        ₹{order.amount}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#5B7A70]">
                        Payment
                      </span>

                      <p className="font-medium">
                        {order.payment}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#5B7A70]">
                        Booked On
                      </span>

                      <p className="font-medium">
                        {order.bookedAt}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="flex flex-col items-start lg:items-end gap-4">

                  <StatusBadge status={order.status} />

                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        navigate(`/buyer/orders/${order.id}/track`)
                      }
                      className="rounded-lg bg-primary px-5 py-2 text-white"
                    >
                      Track
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/buyer/orders/${order.id}`)
                      }
                      className="rounded-lg border border-primary/20 px-5 py-2 text-primary"
                    >
                      Details
                    </button>

                    {order.status !== "Delivered" &&
                      order.status !== "Cancelled" && (

                        <button
                          onClick={() => handleCancel(order.id)}
                          className="rounded-lg border border-danger/20 px-5 py-2 text-danger"
                        >
                          Cancel
                        </button>

                      )}

                  </div>

                </div>

              </div>

            </div>

          ))

        )}

      </div>
    </DashboardLayout>
  );
}