import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import FormInput from '../components/common/FormInput';
import EmptyState from '../components/common/EmptyState';
import DeliveryContact from '../components/buyer/DeliveryContact';
import GoogleAddressInput from '../components/common/GoogleAddressInput';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const STEPS = ['Cart', 'Address', 'Payment', 'Confirm'];

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay when your order arrives' },
  { value: 'upi', label: 'UPI', hint: 'Pay via any UPI app' },
  { value: 'card', label: 'Card', hint: 'Debit or credit card' },
  { value: 'netbanking', label: 'Netbanking', hint: 'Pay via your bank' },
];

// Mirrors backend/src/config/coupons.js — used only to preview the discount
// before placing the order. The backend re-resolves the code independently
// and is the source of truth for the amount actually charged.
const DEMO_COUPONS = {
  SAVE10: { percentOff: 10, minSubtotal: 0 },
  SAVE20: { percentOff: 20, minSubtotal: 1000 },
  WELCOME50: { percentOff: 50, minSubtotal: 0 },
};

const BuyerCheckout = () => {
  const { cart, setQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '', lat: '', lng: '' });
  const [contact, setContact] = useState({ receiverName: '', receiverPhone: '' });
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, percentOff, discountAmount }
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  if (totalItems === 0 && !placedOrder) {
    return (
      <DashboardLayout title="Checkout" subtitle="Your cart is empty.">
        <EmptyState title="Your cart is empty" body="Add products from the Browse page to start an order." />
        <button
          onClick={() => navigate('/buyer/dashboard')}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[12px] text-white transition hover:bg-primary/90"
        >
          BROWSE PRODUCTS
        </button>
      </DashboardLayout>
    );
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser — enter coordinates manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress((a) => ({ ...a, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
      },
      () => {
        setError('Could not read your location — enter coordinates manually.');
        setLocating(false);
      }
    );
  };

  const handleAddressSelect = ({ address: fullAddress, latitude, longitude }) => {
    setAddress((a) => ({ ...a, line1: fullAddress, lat: latitude, lng: longitude }));
  };

  // Free-typed text that wasn't picked from a suggestion still needs to
  // reach state (so validation and the confirm step see it) — but it means
  // any coordinates captured for the *previous* text are no longer trustworthy.
  const handleAddressTyped = (text) => {
    setAddress((a) => ({ ...a, line1: text, lat: '', lng: '' }));
  };

  // Fallback geocode: if the buyer typed an address without picking a
  // suggestion (or used "use my location" and then edited the text), we
  // still don't want to silently fall back to (0,0) coordinates. This does
  // one best-effort lookup against the same free Nominatim API the
  // autocomplete uses, keyed on whatever address text is present.
  const geocodeAddress = async () => {
    if (address.lat !== '' && address.lng !== '') return { lat: address.lat, lng: address.lng };
    const query = [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ');
    if (!query) return null;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setAddress((a) => ({ ...a, lat, lng }));
        return { lat, lng };
      }
      return null;
    } catch {
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((c) => ({ ...c, [name]: value }));
  };

  const applyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const coupon = DEMO_COUPONS[code];
    if (!coupon) {
      setCouponError('That code isn\u2019t valid.');
      return;
    }
    if (totalPrice < coupon.minSubtotal) {
      setCouponError(`This code needs a cart total of at least \u20b9${coupon.minSubtotal}.`);
      return;
    }
    setAppliedCoupon({
      code,
      percentOff: coupon.percentOff,
      discountAmount: Math.round((totalPrice * coupon.percentOff) / 100),
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const payableTotal = Math.max(totalPrice - discountAmount, 0);

  // Address and receiver-contact fields are two independent blocks on the
  // same step, so they're validated in parallel rather than one gating the
  // other — either can fail first and both errors are checked together.
  const pincodeValid = /^\d{6}$/.test(address.pincode);
  const phoneValid = /^[6-9]\d{9}$/.test(contact.receiverPhone);
  const addressValid = Boolean(address.line1 && address.city && address.state) && pincodeValid;
  const contactValid = Boolean(contact.receiverName.trim()) && phoneValid;

  const goNext = async () => {
    setError('');
    if (step === 1) {
      const [addressOk, contactOk] = [addressValid, contactValid];
      if (!addressOk && !contactOk) {
        setError('Fill in your delivery address and receiver details before continuing.');
        return;
      }
      if (!addressOk) {
        setError(!pincodeValid && address.pincode ? 'Enter a valid 6-digit pincode.' : 'Fill in your full delivery address before continuing.');
        return;
      }
      if (!contactOk) {
        setError(!phoneValid && contact.receiverPhone ? 'Enter a valid 10-digit mobile number.' : 'Add a receiver name and mobile number before continuing.');
        return;
      }
      // Best-effort: if no coordinates were captured yet (no autocomplete
      // pick, "use my location" wasn't used), geocode the typed address so
      // the order isn't placed with missing/blank coordinates. A failed
      // lookup doesn't block checkout — the address text itself is still valid.
      await geocodeAddress();
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      // One more best-effort attempt in case step 1 was skipped back-and-forth
      // without a successful lookup — still non-blocking either way. Uses the
      // resolved value directly rather than re-reading state, since state
      // updates from geocodeAddress won't be visible in this closure yet.
      const coords = await geocodeAddress();
      const { data } = await api.post('/orders/product', {
        items: cart.items.map((i) => ({ product: i.product, quantity: i.quantity })),
        deliveryAddress: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          contactName: contact.receiverName,
          contactPhone: contact.receiverPhone,
          ...(coords
            ? { location: { type: 'Point', coordinates: [Number(coords.lng), Number(coords.lat)] } }
            : {}),
        },
        productPaymentMethod: paymentMethod,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      });
      setPlacedOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <DashboardLayout title="Order placed" subtitle="We've sent your order to the shipper.">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/10 bg-secondary/20 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-primary">Order confirmed</h2>
          <p className="mt-1 text-sm text-muted">
            ₹{placedOrder.productTotal} · Paying via {placedOrder.productPaymentMethod?.toUpperCase()}
          </p>
          {placedOrder.couponCode && (
            <p className="mt-1 font-mono-ls text-[10px] text-success">
              {placedOrder.couponCode} APPLIED · SAVED ₹{placedOrder.discountAmount}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/buyer/orders')}
              className="rounded-full bg-primary px-5 py-2 font-mono-ls text-[11px] text-white transition hover:bg-primary/90"
            >
              VIEW MY ORDERS
            </button>
            <button
              onClick={() => navigate('/buyer/dashboard')}
              className="rounded-full border border-primary/15 px-5 py-2 font-mono-ls text-[11px] text-primary/70 transition hover:border-primary/40"
            >
              CONTINUE BROWSING
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Checkout" subtitle={cart.shipperName ? `From ${cart.shipperName}` : ''}>
      {/* Step indicator — completed steps are clickable to jump back */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const isDone = i < step;
          const isCurrent = i === step;
          const canJump = i < step;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && setStep(i)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono-ls text-[11px] font-bold transition ${
                  i <= step ? 'bg-primary text-white' : 'border border-primary/20 text-muted/60'
                } ${canJump ? 'cursor-pointer hover:ring-2 hover:ring-primary/30' : 'cursor-default'}`}
              >
                {i + 1}
              </button>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && setStep(i)}
                className={`font-mono-ls text-[10px] tracking-wide ${i <= step ? 'text-primary' : 'text-muted/50'} ${
                  canJump ? 'cursor-pointer hover:underline' : 'cursor-default'
                }`}
              >
                {label.toUpperCase()}
              </button>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${isDone ? 'bg-primary' : 'bg-primary/10'}`} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">{error}</div>
      )}

      <div className="mt-6 max-w-2xl">
        {/* Step 0: Cart */}
        {step === 0 && (
          <div>
            <ul className="divide-y divide-primary/10 rounded-xl border border-primary/10">
              {cart.items.map((item) => (
                <li key={item.product} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-primary">{item.name}</p>
                    <p className="font-mono-ls text-[11px] text-muted">₹{item.price} / {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-primary/20 px-1 py-1">
                    <button
                      onClick={() => setQuantity(item.product, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-primary transition hover:bg-primary/10"
                    >
                      −
                    </button>
                    <span className="min-w-[1ch] text-center font-mono-ls text-[12px] font-bold text-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => (item.quantity < item.stock ? setQuantity(item.product, item.quantity + 1) : null)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-primary transition hover:bg-primary/10 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-16 shrink-0 text-right font-display text-sm font-bold text-primary">
                    ₹{item.price * item.quantity}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
              <span className="font-mono-ls text-[12px] text-primary">TOTAL</span>
              <span className="font-display text-lg font-bold text-primary">₹{totalPrice}</span>
            </div>
          </div>
        )}

        {/* Step 1: Address + Receiver contact (validated in parallel) */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">DELIVERY ADDRESS</h3>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
                >
                  {locating ? 'LOCATING…' : 'USE MY LOCATION'}
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <GoogleAddressInput
                    label="ADDRESS"
                    value={address.line1}
                    onAddressSelect={handleAddressSelect}
                    onChange={handleAddressTyped}
                    placeholder="Start typing your flat / street / area…"
                  />
                  {address.lat !== '' && address.lng !== '' && (
                    <p className="mt-1 font-mono-ls text-[10px] text-success">LOCATION PINPOINTED ✓</p>
                  )}
                </div>
                <FormInput
                  label="CITY"
                  name="city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Chennai"
                />
                <FormInput
                  label="STATE"
                  name="state"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="Tamil Nadu"
                />
                <FormInput
                  label="PINCODE"
                  name="pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="600001"
                />
              </div>
            </div>

            <DeliveryContact formData={contact} handleChange={handleContactChange} />
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition ${
                    paymentMethod === m.value ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'
                  }`}
                >
                  <div>
                    <p className="font-display text-sm font-semibold text-primary">{m.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{m.hint}</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              ))}
            </div>

            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">PROMO CODE</h3>
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-success/30 bg-success/5 px-4 py-2.5">
                  <p className="text-sm text-primary/90">
                    <span className="font-semibold">{appliedCoupon.code}</span> applied — you save ₹{appliedCoupon.discountAmount}
                  </p>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="font-mono-ls text-[10px] text-primary/60 hover:text-danger hover:underline"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code"
                    className="w-full rounded-lg border border-primary/15 bg-white px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/40"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="shrink-0 rounded-lg border border-primary/20 px-5 py-2.5 font-mono-ls text-[11px] text-primary transition hover:border-primary hover:bg-primary/5"
                  >
                    APPLY
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}
            </div>

            <div className="rounded-xl bg-secondary/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm text-primary/80">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              {appliedCoupon && (
                <div className="mt-1 flex items-center justify-between text-sm text-success">
                  <span>Discount ({appliedCoupon.percentOff}%)</span>
                  <span>−₹{discountAmount}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-primary/10 pt-2 font-display text-base font-bold text-primary">
                <span>Total</span>
                <span>₹{payableTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">ITEMS ({totalItems})</p>
              <ul className="mt-2 space-y-1">
                {cart.items.map((item) => (
                  <li key={item.product} className="flex justify-between text-sm text-primary/90">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-primary/10 pt-3">
                <div className="flex justify-between text-sm text-primary/80">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>−₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-sm font-bold text-primary">
                  <span>Total</span>
                  <span>₹{payableTotal}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">DELIVER TO</p>
              <p className="mt-1 text-sm text-primary/90">
                {address.line1}, {address.city}, {address.state} — {address.pincode}
              </p>
              <p className="mt-2 text-sm text-primary/90">
                {contact.receiverName} · {contact.receiverPhone}
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">PAYMENT</p>
              <p className="mt-1 text-sm text-primary/90">
                {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => (step === 0 ? navigate('/buyer/dashboard') : goBack())}
            className="rounded-full border border-primary/15 px-5 py-2.5 font-mono-ls text-[11px] text-primary/70 transition hover:border-primary/40"
          >
            {step === 0 ? 'BACK TO SHOP' : 'BACK'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={geocoding}
              className="rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[11px] text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {geocoding ? 'RESOLVING ADDRESS…' : 'CONTINUE'}
            </button>
          ) : (
            <button
              onClick={placeOrder}
              disabled={placing}
              className="rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[11px] text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {placing ? 'PLACING ORDER…' : `PLACE ORDER · ₹${payableTotal}`}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerCheckout;