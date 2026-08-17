import { useRef, useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

const UNIT_OPTIONS = [
  { value: 'unit', label: 'Per unit' },
  { value: 'kg', label: 'Per kg' },
  { value: 'box', label: 'Per box' },
  { value: 'piece', label: 'Per piece' },
  { value: 'litre', label: 'Per litre' },
];

const MAX_DIMENSION = 900; // px — keeps the stored data URL reasonably small
const MAX_FILE_MB = 8;

/** Reads a File, downscales it on a canvas, and resolves to a base64 data URL. */
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/**
 * Centered modal for creating or editing a catalog product.
 * `onSubmit(payload)` should return a promise; the modal closes itself
 * on success and surfaces the error message on failure.
 */
const ProductModal = ({ product, onSubmit, onClose }) => {
  const isEdit = Boolean(product);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price ?? '',
    unit: product?.unit || 'unit',
    stock: product?.stock ?? '',
    weightPerUnit: product?.weightPerUnit ?? '',
  });
  const [imagePreview, setImagePreview] = useState(product?.images?.[0] || '');
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setImageError(`Image is too large — keep it under ${MAX_FILE_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setImagePreview(dataUrl);
    } catch (err) {
      setImageError(err.message || 'Could not load that image.');
    }
  };

  const removeImage = () => {
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        weightPerUnit: Number(form.weightPerUnit),
        images: imagePreview ? [imagePreview] : [],
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this product right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-primary/40 px-4 py-8" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-primary/10 bg-background p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-semibold text-primary">
          {isEdit ? 'Edit product' : 'Add a product'}
        </h3>
        <p className="mt-1 text-sm text-[#5B7A70]">
          {isEdit ? 'Update your catalog listing.' : 'List an item buyers can order from your catalog.'}
        </p>

        <div className="mt-5 grid gap-4">
          {/* Product photo */}
          <label className="block">
            <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">Product photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              className="hidden"
            />
            <div className="mt-1.5">
              {imagePreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-primary/15 bg-secondary/40">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-primary/50 p-2 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-danger/60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-primary/25 bg-secondary/40 px-4 py-8 text-center transition hover:border-primary/50"
                >
                  <span className="text-sm font-semibold text-primary">Click to upload a photo</span>
                  <span className="text-[11px] text-[#5B7A70]">JPG, PNG or WEBP — up to {MAX_FILE_MB}MB</span>
                </button>
              )}
            </div>
            {imageError && <p className="mt-1.5 text-xs text-danger">{imageError}</p>}
          </label>

          <FormInput label="Product name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Basmati Rice — 25kg bag" />
          <FormTextarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What buyers should know about this product"
            required
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Grains" />
            <FormSelect label="Unit" name="unit" value={form.unit} onChange={handleChange} options={UNIT_OPTIONS} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" />
            <FormInput label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" required={false} />
            <FormInput label="Weight/unit (kg)" name="weightPerUnit" type="number" value={form.weightPerUnit} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-primary/15 px-4 py-2 text-xs text-primary/70 transition hover:border-primary/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductModal;