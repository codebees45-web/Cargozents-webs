import React from "react";

const goodsCategories = [
  "Electronics",
  "Furniture",
  "Food & Grocery",
  "Industrial Goods",
  "Construction Materials",
  "Medical Supplies",
  "Textiles",
  "Agricultural Products",
  "Automobile Parts",
  "Others",
];

const vehicleTypes = [
  "Auto",
  "Pickup",
  "Mini Truck",
  "Truck",
  "Container",
];

const BookingForm = ({
  formData,
  handleChange,
  handleSubmit,
  loading = false,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">
        Shipment Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Pickup Address *
          </label>

          <input
            type="text"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder="Enter pickup location"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Drop */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Delivery Address *
          </label>

          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="Enter delivery location"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Goods Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Goods Name *
          </label>

          <input
            type="text"
            name="goodsName"
            value={formData.goodsName}
            onChange={handleChange}
            placeholder="Example: LED TVs"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Goods Category
          </label>

          <select
            name="goodsCategory"
            value={formData.goodsCategory}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="">Select Category</option>

            {goodsCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Weight (KG)
          </label>

          <input
            type="number"
            min="1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Vehicle
          </label>

          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="">Select Vehicle</option>

            {vehicleTypes.map((vehicle) => (
              <option key={vehicle} value={vehicle}>
                {vehicle}
              </option>
            ))}
          </select>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Length (cm)
          </label>

          <input
            type="number"
            name="length"
            value={formData.length}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Width */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Width (cm)
          </label>

          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Height (cm)
          </label>

          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Pickup Date
          </label>

          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Pickup Time
          </label>

          <input
            type="time"
            name="pickupTime"
            value={formData.pickupTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Receiver */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Receiver Name
          </label>

          <input
            type="text"
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Receiver Mobile
          </label>

          <input
            type="tel"
            name="receiverPhone"
            value={formData.receiverPhone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>
      </div>

      {/* Instructions */}

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Special Instructions
        </label>

        <textarea
          rows={4}
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          placeholder="Enter any handling instructions..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 resize-none"
        />
      </div>

      {/* Button */}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;