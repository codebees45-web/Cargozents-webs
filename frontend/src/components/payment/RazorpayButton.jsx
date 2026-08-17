import paymentService from "../../services/paymentService";

export default function RazorpayButton({
  orderId,
  amount,
  onSuccess,
}) {
  const handlePayment = async () => {
    try {
      const response =
        await paymentService.createPayment(orderId);

      const options = {
        key: response.key,

        amount: response.razorpayOrder.amount,

        currency: response.razorpayOrder.currency,

        name: "CargoZent",

        description: "Shipment Payment",

        order_id: response.razorpayOrder.id,

        handler: async function (payment) {
          await paymentService.verifyPayment({
            orderId,

            razorpay_order_id:
              payment.razorpay_order_id,

            razorpay_payment_id:
              payment.razorpay_payment_id,

            razorpay_signature:
              payment.razorpay_signature,
          });

          if (onSuccess) {
            onSuccess();
          }
        },

        theme: {
          color: "#2563EB",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();

    } catch (err) {

      console.error(err);

      alert("Payment Failed");

    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full rounded-lg bg-primary py-3 text-white font-semibold"
    >
      Pay ₹{amount}
    </button>
  );
}