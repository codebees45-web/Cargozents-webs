import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import FormTextarea from '../components/common/FormTextarea';
import GeoPointFields from '../components/common/GeoPointFields';
import MapView from '../components/common/MapView';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const emptyGeoPoint = { address: '', city: '', state: '', pincode: '', coordinates: ['', ''] };

const VEHICLE_OPTIONS = [
  { value: 'mini_truck', label: 'Mini Truck (up to ~750 kg)' },
  { value: 'tempo', label: 'Tempo (up to ~1.5 T)' },
  { value: 'open_body', label: 'Open Body Truck' },
  { value: 'container', label: 'Container Truck' },
  { value: 'trailer', label: 'Trailer (heavy haul)' },
];

const PAID_BY_OPTIONS = [
  { value: 'shipper', label: 'Shipper pays delivery' },
  { value: 'buyer', label: 'Buyer pays delivery' },
];

const PostShipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [form, setForm] = useState({
    goodsType: '',
    weight: '',
    volume: '',
    vehicleRequired: '',
    scheduledDate: '',
    scheduledTime: '',
    specialInstructions: '',
    insuranceOpted: false,
    deliveryPaidBy: 'shipper',
  });
  const [pickup, setPickup] = useState(emptyGeoPoint);
  const [drop, setDrop] = useState(emptyGeoPoint);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { shipment, priceBreakdown, distanceKm }
  const [prefillNotice, setPrefillNotice] = useState('');

  // Pre-fill pickup from the shipper's saved default address, if set.
  useEffect(() => {
    const saved = user?.shipperProfile?.pickupAddress;
    if (saved?.address) {
      setPickup({
        address: saved.address,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        coordinates: saved.location?.coordinates?.[0] ? saved.location.coordinates : ['', ''],
      });
    }
  }, [user]);

  // If arriving from "Post shipment" on a confirmed order, pre-fill goods,
  // weight, and drop address straight from that order — the shipper just
  // reviews and adjusts vehicle/schedule instead of re-typing everything.
  useEffect(() => {
    if (!orderId) return;
    api
      .get(`/orders/${orderId}`)
      .then(({ data }) => {
        const order = data.order;
        const goodsType = order.items.map((i) => i.product?.name).filter(Boolean).join(', ') || 'Order goods';
        const weight = order.items.reduce((sum, i) => sum + (i.product?.weightPerUnit || 0) * i.quantity, 0);

        setForm((f) => ({ ...f, goodsType, weight: weight || f.weight, deliveryPaidBy: 'buyer' }));
        setDrop({
          address: order.deliveryAddress.line1,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          pincode: order.deliveryAddress.pincode,
          coordinates: order.deliveryAddress.location?.coordinates?.[0] ? order.deliveryAddress.location.coordinates : ['', ''],
        });
        setPrefillNotice(`Pre-filled from order #${order._id.slice(-8).toUpperCase()} for ${order.buyer?.name}.`);
      })
      .catch(() => setError('Could not load that order to pre-fill — you can still fill this in manually.'));
  }, [orderId]);

  const setField = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [name]: value });
  };

  const useMyLocationForPickup = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser — enter pickup coordinates manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup((p) => ({ ...p, coordinates: [pos.coords.longitude, pos.coords.latitude] }));
        setLocating(false);
      },
      () => {
        setError('Could not read your location — enter pickup coordinates manually.');
        setLocating(false);
      }
    );
  };

  const validCoords = (geoPoint) =>
    geoPoint.coordinates[0] !== '' && geoPoint.coordinates[1] !== '' && geoPoint.address && geoPoint.city && geoPoint.state && geoPoint.pincode;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validCoords(pickup) || !validCoords(drop)) {
      setError('Fill in complete pickup and drop details, including coordinates.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/shipments', {
        order: orderId || undefined,
        goodsType: form.goodsType,
        weight: Number(form.weight),
        volume: form.volume ? Number(form.volume) : undefined,
        vehicleRequired: form.vehicleRequired,
        pickup: {
          address: pickup.address,
          city: pickup.city,
          state: pickup.state,
          pincode: pickup.pincode,
          location: { type: 'Point', coordinates: pickup.coordinates.map(Number) },
        },
        drop: {
          address: drop.address,
          city: drop.city,
          state: drop.state,
          pincode: drop.pincode,
          location: { type: 'Point', coordinates: drop.coordinates.map(Number) },
        },
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        specialInstructions: form.specialInstructions,
        insuranceOpted: form.insuranceOpted,
        deliveryPaidBy: form.deliveryPaidBy,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this shipment. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const { shipment, priceBreakdown, distanceKm } = result;
    return (
      <DashboardLayout title="Shipment posted" subtitle="Now waiting for a driver to be matched by admin.">
        <div className="max-w-lg rounded-2xl border border-primary/15 bg-secondary/10 p-6">
          <p className="font-mono-ls text-[11px] text-primary">SHIPMENT #{shipment._id.slice(-8).toUpperCase()}</p>
          <p className="mt-1 text-sm text-[#5B7A70]">
            {shipment.pickup.city} → {shipment.drop.city} · {distanceKm} km · {shipment.vehicleRequired.replace('_', ' ')}
          </p>

          <div className="mt-6 space-y-2 border-t border-primary/10 pt-4 font-mono-ls text-xs">
            <div className="flex justify-between text-[#5B7A70]">
              <span>Distance charge</span>
              <span>₹{priceBreakdown.distanceCharge}</span>
            </div>
            <div className="flex justify-between text-[#5B7A70]">
              <span>Weight charge</span>
              <span>₹{priceBreakdown.weightCharge}</span>
            </div>
            <div className="flex justify-between text-[#5B7A70]">
              <span>Loading charge</span>
              <span>₹{priceBreakdown.loadingCharge}</span>
            </div>
            <div className="flex justify-between text-[#5B7A70]">
              <span>Toll (est.)</span>
              <span>₹{priceBreakdown.toll}</span>
            </div>
            {priceBreakdown.permitCharge > 0 && (
              <div className="flex justify-between text-[#5B7A70]">
                <span>Interstate permit</span>
                <span>₹{priceBreakdown.permitCharge}</span>
              </div>
            )}
            {priceBreakdown.insuranceCharge > 0 && (
              <div className="flex justify-between text-[#5B7A70]">
                <span>Insurance</span>
                <span>₹{priceBreakdown.insuranceCharge}</span>
              </div>
            )}
            <div className="flex justify-between text-[#5B7A70]">
              <span>State tax</span>
              <span>₹{priceBreakdown.stateTax}</span>
            </div>
            <div className="flex justify-between border-t border-primary/10 pt-2 text-sm font-semibold text-primary">
              <span>Estimated total</span>
              <span>₹{shipment.estimatedPrice}</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-[#5B7A70]">
            Final price may be lower if this load is matched with a driver already on a nearby empty return leg.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/shipper/dashboard')}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:shadow-glow"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => {
                setResult(null);
                setForm({ ...form, goodsType: '', weight: '', volume: '', specialInstructions: '' });
              }}
              className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm text-primary/80 hover:border-primary/40"
            >
              Post another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Post a shipment" subtitle="Tell us what's moving and where — we'll find a truck.">
      {prefillNotice && (
        <div className="mb-6 max-w-3xl rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{prefillNotice}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        <section className="grid gap-4 rounded-xl border border-primary/10 bg-secondary/10 p-5 sm:grid-cols-2">
          <FormInput label="GOODS TYPE" name="goodsType" value={form.goodsType} onChange={setField('goodsType')} placeholder="e.g. Textiles, machinery parts" />
          <FormSelect label="VEHICLE REQUIRED" name="vehicleRequired" value={form.vehicleRequired} onChange={setField('vehicleRequired')} options={VEHICLE_OPTIONS} />
          <FormInput label="WEIGHT (KG)" type="number" name="weight" value={form.weight} onChange={setField('weight')} placeholder="500" />
          <FormInput label="VOLUME (M³, OPTIONAL)" type="number" name="volume" value={form.volume} onChange={setField('volume')} placeholder="2.5" required={false} />
          <FormInput label="SCHEDULED DATE" type="date" name="scheduledDate" value={form.scheduledDate} onChange={setField('scheduledDate')} />
          <FormInput label="SCHEDULED TIME" type="time" name="scheduledTime" value={form.scheduledTime} onChange={setField('scheduledTime')} required={false} />
        </section>

        <GeoPointFields label="PICKUP" value={pickup} onChange={setPickup} onUseMyLocation={useMyLocationForPickup} locating={locating} />
        <GeoPointFields label="DROP" value={drop} onChange={setDrop} />

        {validCoords(pickup) && validCoords(drop) && (
          <section className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">ROUTE PREVIEW</h3>
            <div className="mt-4">
              <MapView
                markers={[
                  { id: 'pickup', lat: pickup.coordinates[1], lng: pickup.coordinates[0], label: `Pickup: ${pickup.address}` },
                  { id: 'drop', lat: drop.coordinates[1], lng: drop.coordinates[0], label: `Drop: ${drop.address}` },
                ]}
                route={[
                  [pickup.coordinates[1], pickup.coordinates[0]],
                  [drop.coordinates[1], drop.coordinates[0]],
                ]}
                height="320px"
              />
            </div>
          </section>
        )}

        <section className="grid gap-4 rounded-xl border border-primary/10 bg-secondary/10 p-5 sm:grid-cols-2">
          <FormSelect label="DELIVERY PAYMENT" name="deliveryPaidBy" value={form.deliveryPaidBy} onChange={setField('deliveryPaidBy')} options={PAID_BY_OPTIONS} />
          <label className="flex items-center gap-2 self-end pb-2.5">
            <input type="checkbox" checked={form.insuranceOpted} onChange={setField('insuranceOpted')} className="h-4 w-4 rounded border-primary/30 accent-accent" />
            <span className="text-sm text-primary">Add shipment insurance</span>
          </label>
          <div className="sm:col-span-2">
            <FormTextarea
              label="SPECIAL INSTRUCTIONS"
              name="specialInstructions"
              value={form.specialInstructions}
              onChange={setField('specialInstructions')}
              placeholder="Fragile items, loading dock access, contact person on site…"
            />
          </div>
        </section>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Posting…' : 'Get price & post shipment'}
        </button>
      </form>
    </DashboardLayout>
  );
};

export default PostShipment;