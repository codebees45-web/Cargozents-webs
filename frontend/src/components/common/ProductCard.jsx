import { useState } from 'react';
import { useCart } from '../../context/CartContext';

// Product tile with a Swiggy-style "ADD" button that morphs into a +/- stepper
// once the item is in the cart.
const ProductCard = ({ product }) => {
  const { cart, addItem, setQuantity, replaceWithItem } = useCart();
  const [conflictOpen, setConflictOpen] = useState(false);

  const cartLine = cart.items.find((i) => i.product === product._id);
  const quantity = cartLine?.quantity || 0;
  const outOfStock = product.stock <= 0;

  const asCartItem = {
    product: product._id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    weightPerUnit: product.weightPerUnit,
    stock: product.stock,
    shipperId: product.shipper?._id,
    shipperName: product.shipper?.name,
  };

  const handleAdd = () => {
    const result = addItem(asCartItem);
    if (result === 'conflict') setConflictOpen(true);
  };

  const handleReplace = () => {
    replaceWithItem(asCartItem);
    setConflictOpen(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary/10 bg-secondary/20 transition hover:border-primary/25 hover:shadow-card">
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary/40">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/20">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-primary">{product.name}</p>
          <p className="mt-0.5 truncate font-mono-ls text-[10px] tracking-wide text-muted/80">
            {product.shipper?.name?.toUpperCase()}
          </p>
        </div>
        {outOfStock && (
          <span className="shrink-0 rounded-full bg-danger/10 px-2 py-0.5 font-mono-ls text-[9px] text-danger">
            OUT OF STOCK
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted">{product.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-primary">
          ₹{product.price}
          <span className="ml-1 font-mono-ls text-[10px] font-normal text-muted/70">/ {product.unit}</span>
        </p>

        {outOfStock ? (
          <span className="rounded-full border border-primary/10 px-4 py-1.5 font-mono-ls text-[11px] text-muted/50">
            UNAVAILABLE
          </span>
        ) : quantity === 0 ? (
          <button
            onClick={handleAdd}
            className="rounded-full border border-primary bg-white px-5 py-1.5 font-mono-ls text-[11px] font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-full border border-primary bg-primary px-1 py-1 text-white">
            <button
              onClick={() => setQuantity(product._id, quantity - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition hover:bg-white/20"
            >
              −
            </button>
            <span className="min-w-[1ch] text-center font-mono-ls text-[12px] font-bold">{quantity}</span>
            <button
              onClick={() => (quantity < product.stock ? setQuantity(product._id, quantity + 1) : null)}
              disabled={quantity >= product.stock}
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition hover:bg-white/20 disabled:opacity-40"
            >
              +
            </button>
          </div>
        )}
      </div>
      </div>

      {conflictOpen && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/97 p-4 text-center shadow-card">
          <p className="font-display text-sm font-semibold text-primary">Start a new cart?</p>
          <p className="text-xs text-muted">
            Your cart has items from {cart.shipperName}. Adding from {product.shipper?.name} will clear it, since
            each order ships from a single seller.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConflictOpen(false)}
              className="rounded-full border border-primary/15 px-4 py-1.5 font-mono-ls text-[11px] text-primary/70 transition hover:border-primary/40"
            >
              CANCEL
            </button>
            <button
              onClick={handleReplace}
              className="rounded-full bg-primary px-4 py-1.5 font-mono-ls text-[11px] text-white transition hover:bg-primary/90"
            >
              CLEAR & ADD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;