import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/buyer/StatusBadge";
import TruckLoader from "../../components/common/TruckLoader";
import RazorpayButton from "../../components/payment/RazorpayButton";
import orderService from "../../services/orderService";

const PRODUCT_STATUS_LABELS = {
  placed: "Placed",
  confirmed_by_shipper: "Confirmed",
  awaiting_shipment: "Awaiting shipment",
  shipment_requested: "Shipment requested",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    orderService
      .getOrderById(orderId)
      .then(({ order }) => {
        setOrder(order);
        setError("");
      })
      .catch(() => setError("Could not load this order."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancel = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this shipment?");
    if (!confirmed) return;
    try {
      setCancelling(true);
      await orderService.cancelOrder(orderId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Shipment Details">
        <TruckLoader fullScreen={false} />
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Shipment Details">
        <p className="text-sm text-danger">{error || "Order not found."}</p>
        <Link to="/buyer/orders" className="mt-4 inline-block text-sm text-primary underline">
          &larr; Back to my orders
        </Link>
      </DashboardLayout>
    );
  }

  const isProduct = order.orderType === "product";

  const statusLabel = isProduct
    ? PRODUCT_STATUS_LABELS[order.status] || order.status
    : order.tracking?.currentStatus || "Submitted";

  const isDelivered = isProduct ? order.status === "delivered" : ["Delivered", "Completed"].includes(statusLabel);
  const isCancelled = isProduct ? order.status === "cancelled" : statusLabel === "Cancelled";

  const amount = isProduct ? order.productTotal : order.pricing?.totalAmount || 0;
  const isPaid = isProduct ? order.productPaymentStatus === "paid" : order.payment?.status === "paid";

  return (
    <DashboardLayout title="Shipment Details" subtitle={`Order ID: ${order.orderId || order._id}`}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Status */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Status</h2>
          <div className="mt-4">
            <StatusBadge status={statusLabel} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {isProduct ? (
            <div className="rounded-xl border border-primary/10 bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">Items</h3>
              <div className="mt-6 space-y-4">
                {(order.items || []).map((item) => (
                  <div key={item.product?._id || item.product} className="flex justify-between">
                    <span>
                      {item.product?.name || "Item"} × {item.quantity}
                    </span>
                    <strong>₹{item.priceAtPurchase * item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-primary/10 bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">Shipment Information</h3>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span>Pickup</span>
                  <strong>{order.pickup?.address}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Destination</span>
                  <strong>{order.delivery?.address}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Goods</span>
                  <strong>{order.goods?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Weight</span>
                  <strong>{order.goods?.weight} KG</strong>
                </div>
                <div className="flex justify-between">
                  <span>Delivery type</span>
                  <strong>{order.shipment?.deliveryType || "Standard"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Booked on</span>
                  <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-primary/10 bg-white p-6">
            <h3 className="text-lg font-semibold text-primary">
              {isProduct ? "Delivery Address" : "Driver Information"}
            </h3>
            <div className="mt-6 space-y-4">
              {isProduct ? (
                order.deliveryAddress ? (
                  <p className="text-sm text-primary/90">
                    {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} —{" "}
                    {order.deliveryAddress.pincode}
                  </p>
                ) : (
                  <p className="text-sm text-muted">No address on file.</p>
                )
              ) : order.driver ? (
                <>
                  <div className="flex justify-between">
                    <span>Name</span>
                    <strong>{order.driver.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <strong>{order.driver.phone}</strong>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted">No driver assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-primary/10 bg-white p-6">
          <h3 className="text-lg font-semibold text-primary">Payment Summary</h3>
          <div className="mt-6 flex justify-between">
            <span>Total Amount</span>
            <strong className="text-xl">₹{amount}</strong>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">Payment Status</span>
            <StatusBadge status={isPaid ? "Paid" : "Pending"} />
          </div>
        </div>

        {!isPaid && !isCancelled && (
          <RazorpayButton
            orderId={order._id}
            amount={amount}
            onSuccess={() => {
              alert("Payment successful.");
              load();
            }}
          />
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate(`/buyer/orders/${order._id}/track`)}
            className="rounded-lg bg-primary px-6 py-3 text-white hover:opacity-90"
          >
            Track Shipment
          </button>

          {!isDelivered && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-lg border border-danger/20 px-6 py-3 text-danger hover:bg-danger/5 disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel Shipment"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}