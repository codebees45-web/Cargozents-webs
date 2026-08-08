import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

export default function BuyerProfile() {
  const [profile, setProfile] = useState({
    firstName: "Nagaraj",
    lastName: "K",
    email: "nagaraj@example.com",
    phone: "9876543210",
    company: "",
    gstNumber: "",
    address: "Chennai, Tamil Nadu",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // await buyerService.updateProfile(profile);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Buyer Profile"
      subtitle="Manage your personal and business information."
    >
      <div className="max-w-5xl mx-auto">

        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-primary/10 shadow-sm p-8"
        >

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 text-sm font-medium">
                First Name
              </label>

              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Last Name
              </label>

              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Mobile Number
              </label>

              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Company Name
              </label>

              <input
                name="company"
                value={profile.company}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                GST Number
              </label>

              <input
                name="gstNumber"
                value={profile.gstNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 px-4 py-3"
              />
            </div>

          </div>

          <div className="mt-6">

            <label className="block mb-2 text-sm font-medium">
              Address
            </label>

            <textarea
              rows="4"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary/10 px-4 py-3 resize-none"
            />

          </div>

          <div className="mt-8 flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-8 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}