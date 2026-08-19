import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  cancelSubscription,
} from '../services/subscriptionService';

// Loads the Razorpay Checkout script once and reuses it on future renders.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PlanCard = ({ plan, isCurrent, isProcessing, onSubscribe }) => (
  <div
    className={`rounded-2xl border p-7 ${
      plan.key === 'basic' ? 'border-primary bg-secondary' : 'border-primary/10'
    }`}
  >
    <p className="font-mono-ls text-[11px] tracking-wide text-primary">{plan.name.toUpperCase()}</p>
    <p className="mt-3 font-display text-3xl font-bold text-primary">
      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
    </p>
    <p className="text-xs text-[#5B7A70]">{plan.durationDays ? `per ${plan.durationDays} days` : 'forever'}</p>

    <ul className="mt-6 space-y-3">
      {plan.features.map((f) => (
        <li key={f} className="flex gap-2 text-sm text-[#5B7A70]">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
          {f}
        </li>
      ))}
    </ul>

    <button
      disabled={isCurrent || plan.key === 'free' || isProcessing}
      onClick={() => onSubscribe(plan)}
      className={`mt-7 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        isCurrent
          ? 'cursor-default bg-primary/10 text-primary/50'
          : plan.key === 'free'
          ? 'cursor-default bg-primary/5 text-primary/40'
          : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-60'
      }`}
    >
      {isCurrent ? 'Current plan' : plan.key === 'free' ? 'Default plan' : isProcessing ? 'Processing…' : 'Subscribe'}
    </button>
  </div>
);

const ShipperSubscription = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    try {
      const [plansData, subData] = await Promise.all([getPlans(), getMySubscription()]);
      setPlans(plansData);
      setSubscription(subData);
    } catch (err) {
      setError('Could not load subscription details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubscribe = async (plan) => {
    setError('');
    setNotice('');
    setProcessingPlan(plan.key);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load Razorpay checkout. Check your internet connection and try again.');
        setProcessingPlan(null);
        return;
      }

      const { order, keyId } = await createOrder(plan.key);

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CargoZent',
        description: `${plan.name} plan — shipper subscription`,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#0F3D2E' },
        handler: async (response) => {
          try {
            const updatedSub = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.key,
            });
            setSubscription(updatedSub);
            setNotice(`You're now on the ${plan.name} plan.`);
          } catch (err) {
            setError('Payment succeeded but activation failed. Contact support with your payment ID.');
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(null),
        },
      });

      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setProcessingPlan(null);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout. Please try again.');
      setProcessingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will lose paid-plan features immediately.')) return;
    try {
      const updatedSub = await cancelSubscription();
      setSubscription(updatedSub);
      setNotice('Subscription cancelled.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel subscription.');
    }
  };

  const currentPlanKey = subscription?.status === 'active' ? subscription.plan : 'free';

  return (
    <DashboardLayout
      title="Subscription"
      subtitle="Choose the plan that fits how much you ship. Test-mode payments — no real money is charged."
    >
      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-secondary/40 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {subscription?.status === 'active' && subscription.plan !== 'free' && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
          <div>
            <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">CURRENT PLAN</p>
            <p className="mt-1 font-display text-lg font-bold text-primary">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              {subscription.expiresAt && (
                <span className="ml-2 text-xs font-normal text-[#5B7A70]">
                  renews / expires {new Date(subscription.expiresAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/5"
          >
            Cancel subscription
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#5B7A70]">Loading plans…</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isCurrent={plan.key === currentPlanKey}
              isProcessing={processingPlan === plan.key}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-[#5B7A70]">
        Payments are processed via Razorpay in test mode during development — use Razorpay's test card
        4111 1111 1111 1111, any future expiry date, and any CVV to simulate a successful payment.
      </p>
    </DashboardLayout>
  );
};

export default ShipperSubscription;