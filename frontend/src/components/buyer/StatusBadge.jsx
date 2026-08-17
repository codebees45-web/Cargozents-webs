const statusStyles = {
  "Order Placed": "bg-blue-100 text-blue-800",
  "Driver Assigned": "bg-indigo-100 text-indigo-800",
  "In Transit": "bg-cyan-100 text-cyan-800",
  Delivered: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-red-100 text-red-800",
  Paid: "bg-green-100 text-green-800",
  Success: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }) {
  const classes =
    statusStyles[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${classes}`}
    >
      {status}
    </span>
  );
}