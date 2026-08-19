import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// Persistent bottom bar summarizing the active cart — same job as the
// "View cart" bar on Swiggy/Zomato/Rapido food ordering screens.
const FloatingCartBar = () => {
  const { cart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 md:pl-64 md:pr-10">
      <button
        onClick={() => navigate('/buyer/checkout')}
        className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-card transition hover:shadow-glow"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-mono-ls text-[12px] font-bold text-primary">
            {totalItems}
          </span>
          <div>
            <p className="font-display text-sm font-semibold">
              {cart.shipperName ? `From ${cart.shipperName}` : 'Your cart'}
            </p>
            <p className="font-mono-ls text-[11px] text-white/70">₹{totalPrice} · {totalItems} item{totalItems > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 font-mono-ls text-[12px] tracking-wide">
          VIEW CART
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default FloatingCartBar;