import { User, Phone } from "lucide-react";

export default function DeliveryContact({
  formData,
  handleChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary">
        Receiver Details
      </h2>

      <div className="mt-6 grid md:grid-cols-2 gap-6">

        <div>

          <label className="block mb-2">
            Receiver Name
          </label>

          <div className="relative">

            <User
              size={18}
              className="absolute left-4 top-4 text-primary"
            />

            <input
              type="text"
              name="receiverName"
              value={formData.receiverName}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
            />

          </div>

        </div>

        <div>

          <label className="block mb-2">
            Mobile Number
          </label>

          <div className="relative">

            <Phone
              size={18}
              className="absolute left-4 top-4 text-primary"
            />

            <input
              type="text"
              name="receiverPhone"
              value={formData.receiverPhone}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
            />

          </div>

        </div>

      </div>

    </div>
  );
}