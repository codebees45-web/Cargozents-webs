import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ProductCard from '../components/common/ProductCard';
import FloatingCartBar from '../components/common/FloatingCartBar';
import api from '../services/api';

const BuyerShop = () => {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products')
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.shipper?.name?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <DashboardLayout title="Browse" subtitle="Order from shippers near you.">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or shippers"
          className="w-full rounded-xl border border-primary/15 bg-secondary/30 py-3 pl-11 pr-4 text-sm text-primary placeholder:text-muted/50 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
        />
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
              activeCategory === 'all'
                ? 'bg-primary text-white'
                : 'border border-primary/15 text-primary/70 hover:border-primary/40'
            }`}
          >
            ALL
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                activeCategory === c
                  ? 'bg-primary text-white'
                  : 'border border-primary/15 text-primary/70 hover:border-primary/40'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <section className="mt-6">
        {products === null ? (
          <TruckLoader fullScreen={false} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={products.length === 0 ? 'No products listed yet' : 'No matches'}
            body={
              products.length === 0
                ? 'As shippers add their catalogs, their products will appear here for you to order and have delivered.'
                : 'Try a different search term or category.'
            }
          />
        ) : (
          <div className="grid gap-4 pb-28 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <FloatingCartBar />
    </DashboardLayout>
  );
};

export default BuyerShop;