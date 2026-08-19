import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import FormInput from "../../components/common/FormInput";

const initialAddresses = [
  {
    id: 1,
    label: "Home",
    name: "Nagaraj K",
    phone: "9876543210",
    address: "12, Gandhi Street, Tambaram, Chennai, Tamil Nadu - 600045",
    default: true,
  },
  {
    id: 2,
    label: "Office",
    name: "Nagaraj K",
    phone: "9876543210",
    address: "CIT Campus, Kundrathur Road, Chennai, Tamil Nadu",
    default: false,
  },
];

const emptyForm = {
  label: "",
  name: "",
  phone: "",
  address: "",
};

const STORAGE_KEY = "buyer_saved_addresses";

function loadAddresses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to load saved addresses:", err);
  }
  return initialAddresses;
}

function persistAddresses(addresses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch (err) {
    console.error("Failed to save addresses:", err);
  }
}

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState(loadAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Keep localStorage in sync whenever addresses change.
  const updateAddresses = (updater) => {
    setAddresses((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistAddresses(next);
      return next;
    });
  };

  const setDefault = (id) => {
    updateAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        default: item.id === id,
      }))
    );
  };

  const deleteAddress = (id) => {
    updateAddresses((prev) => prev.filter((item) => item.id !== id));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      updateAddresses((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...form } : item
        )
      );
    } else {
      updateAddresses((prev) => [
        ...prev,
        {
          id: Date.now(),
          default: prev.length === 0,
          ...form,
        },
      ]);
    }

    closeModal();
  };

  return (
    <DashboardLayout
      title="Saved Addresses"
      subtitle="Manage pickup and delivery addresses."
    >
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header Action Row */}
        <div className="flex justify-end">
          <button
            onClick={openAddModal}
            className="rounded-lg bg-[#00E676] px-5 py-2.5 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 transition-all duration-200 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)]"
          >
            Add Address
          </button>
        </div>

        {/* Address Cards List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-primary/10 bg-secondary/20 p-6 shadow-sm transition hover:border-primary/20"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                
                {/* Information Area */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-primary">
                      {address.label}
                    </h2>
                    {address.default && (
                      <span className="rounded bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#00E676]">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-3 font-semibold text-primary/95">
                    {address.name}
                  </p>

                  <p className="text-[#8AA399] text-xs font-medium">
                    {address.phone}
                  </p>

                  <p className="mt-2 text-[#8AA399] text-sm max-w-2xl leading-relaxed">
                    {address.address}
                  </p>
                </div>

                {/* Actions Area */}
                <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-end self-end sm:self-start">
                  {!address.default && (
                    <button
                      onClick={() => setDefault(address.id)}
                      className="rounded-lg border border-[#00E676]/30 bg-[#00E676]/5 px-4 py-2 text-xs font-semibold text-[#00E676] transition hover:bg-[#00E676]/10"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(address)}
                    className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/10"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty State Layout */}
        {addresses.length === 0 && (
          <div className="rounded-xl border border-primary/10 bg-secondary/20 p-12 text-center">
            <h2 className="text-xl font-bold text-primary">
              No Saved Addresses
            </h2>
            <p className="mt-2 text-[#8AA399] text-sm">
              Add your first address to make booking shipments faster.
            </p>
          </div>
        )}
      </div>

      {/* Modal View Box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-xl border border-primary/10 bg-[#121E1A] p-6 shadow-2xl shadow-black/50">

            <h2 className="text-lg font-bold text-primary">
              {editingId ? "Edit Address" : "Add Address"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <FormInput
                label="Label (e.g. Home, Office)"
                name="label"
                value={form.label}
                onChange={handleChange}
              />

              <FormInput
                label="Contact Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              <FormInput
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <FormInput
                label="Full Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

              {/* Modal Buttons Grid */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary hover:border-primary/30 hover:bg-primary/10 transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#00E676] px-5 py-2 text-xs font-bold text-[#0A110E] shadow-lg shadow-[#00E676]/10 hover:bg-[#34D399] hover:shadow-[0_0_15px_rgba(0,230,118,0.4)] transition-all"
                >
                  {editingId ? "Save Changes" : "Add Address"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}