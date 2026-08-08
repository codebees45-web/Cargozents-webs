import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'loadshare_cart';

// Cart shape: { shipperId, shipperName, items: [{ product, name, price, unit, weightPerUnit, stock, quantity }] }
// Orders can only contain items from one shipper (backend enforces this too), so
// adding a product from a different shipper prompts to clear the cart first —
// same UX pattern Swiggy/Zomato use when you try to order from a second restaurant.

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { shipperId: null, shipperName: null, items: [] };
    } catch {
      return { shipperId: null, shipperName: null, items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => setCart({ shipperId: null, shipperName: null, items: [] });

  // Returns 'ok' | 'conflict' (caller decides how to handle a shipper conflict)
  const addItem = (product) => {
    if (cart.shipperId && cart.shipperId !== product.shipperId && cart.items.length > 0) {
      return 'conflict';
    }
    setCart((prev) => {
      const existing = prev.items.find((i) => i.product === product.product);
      const items = existing
        ? prev.items.map((i) => (i.product === product.product ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.items, { ...product, quantity: 1 }];
      return { shipperId: product.shipperId, shipperName: product.shipperName, items };
    });
    return 'ok';
  };

  const setQuantity = (productId, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const items = prev.items.filter((i) => i.product !== productId);
        return items.length === 0 ? { shipperId: null, shipperName: null, items: [] } : { ...prev, items };
      }
      return { ...prev, items: prev.items.map((i) => (i.product === productId ? { ...i, quantity } : i)) };
    });
  };

  const removeItem = (productId) => setQuantity(productId, 0);

  const replaceWithItem = (product) => {
    setCart({ shipperId: product.shipperId, shipperName: product.shipperName, items: [{ ...product, quantity: 1 }] });
  };

  // Rebuilds the cart from a past order's line items — powers the "Reorder"
  // button on order history, same as Swiggy/Zomato's repeat-order flow.
  // Quantities are clamped to current stock since availability may have changed.
  const restoreOrder = (order) => {
    const items = (order.items || [])
      .filter((i) => i.product && i.product.isActive !== false)
      .map((i) => ({
        product: i.product._id,
        name: i.product.name,
        price: i.priceAtPurchase,
        unit: i.product.unit || 'unit',
        weightPerUnit: i.product.weightPerUnit,
        stock: i.product.stock ?? i.quantity,
        quantity: Math.min(i.quantity, i.product.stock ?? i.quantity) || 1,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) return 'unavailable';
    setCart({ shipperId: order.shipper?._id || order.shipper, shipperName: order.shipper?.name, items });
    return 'ok';
  };

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, setQuantity, removeItem, clearCart, replaceWithItem, restoreOrder, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};