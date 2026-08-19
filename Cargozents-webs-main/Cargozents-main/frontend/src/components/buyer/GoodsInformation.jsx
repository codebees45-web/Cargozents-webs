import { Package, Weight, Ruler, Boxes } from "lucide-react";

const categories = [
  "Electronics",
  "Furniture",
  "Industrial Equipment",
  "Medical Supplies",
  "Agricultural Products",
  "Construction Materials",
  "Food & Grocery",
  "Textiles",
  "Automobile Parts",
  "Others",
];

export default function GoodsInformation({
  formData,
  handleChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <h2 className="text-xl font-semibold text-primary mb-6">
        Goods Information
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Goods Name */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Goods Name
          </label>

          <div className="relative">

            <Package
              size={18}
              className="absolute left-4 top-4 text-primary"
            />

            <input
              type="text"
              name="goodsName"
              value={formData.goodsName}
              onChange={handleChange}
              placeholder="Example : LED TVs"
              className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
            />

          </div>

        </div>

        {/* Category */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Category
          </label>

          <select
            name="goodsCategory"
            value={formData.goodsCategory}
            onChange={handleChange}
            className="w-full rounded-lg border border-primary/10 py-3 px-4"
          >

            <option value="">
              Select Category
            </option>

            {categories.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>

        {/* Weight */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Weight (KG)
          </label>

          <div className="relative">

            <Weight
              size={18}
              className="absolute left-4 top-4 text-primary"
            />

            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Weight"
              className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
            />

          </div>

        </div>

        {/* Quantity */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Quantity
          </label>

          <div className="relative">

            <Boxes
              size={18}
              className="absolute left-4 top-4 text-primary"
            />

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="No. of Packages"
              className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
            />

          </div>

        </div>

      </div>

      {/* Dimensions */}

      <div className="mt-8">

        <h3 className="font-semibold text-primary mb-4">
          Package Dimensions
        </h3>

        <div className="grid md:grid-cols-3 gap-5">

          <div>

            <label className="block text-sm mb-2">
              Length (cm)
            </label>

            <div className="relative">

              <Ruler
                size={18}
                className="absolute left-4 top-4 text-primary"
              />

              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary/10 py-3 pl-11 pr-4"
              />

            </div>

          </div>

          <div>

            <label className="block text-sm mb-2">
              Width (cm)
            </label>

            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary/10 py-3 px-4"
            />

          </div>

          <div>

            <label className="block text-sm mb-2">
              Height (cm)
            </label>

            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary/10 py-3 px-4"
            />

          </div>

        </div>

      </div>

      {/* Cargo Options */}

      <div className="mt-8">

        <h3 className="font-semibold text-primary mb-4">
          Cargo Handling
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <label className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 cursor-pointer">

            <input
              type="checkbox"
              name="fragile"
              checked={formData.fragile}
              onChange={handleChange}
            />

            Fragile Goods

          </label>

          <label className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 cursor-pointer">

            <input
              type="checkbox"
              name="hazardous"
              checked={formData.hazardous}
              onChange={handleChange}
            />

            Hazardous Material

          </label>

          <label className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 cursor-pointer">

            <input
              type="checkbox"
              name="refrigerated"
              checked={formData.refrigerated}
              onChange={handleChange}
            />

            Refrigerated

          </label>

          <label className="flex items-center gap-3 rounded-lg border border-primary/10 p-4 cursor-pointer">

            <input
              type="checkbox"
              name="stackable"
              checked={formData.stackable}
              onChange={handleChange}
            />

            Stackable

          </label>

        </div>

      </div>

    </div>
  );
}