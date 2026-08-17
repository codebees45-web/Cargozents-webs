import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import ProductModal from '../components/common/ProductModal';
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'low_stock', label: 'Low stock' },
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'price_desc', label: 'Price: high–low' },
  { value: 'price_asc', label: 'Price: low–high' },
  { value: 'stock_asc', label: 'Stock: low–high' },
  { value: 'stock_desc', label: 'Stock: high–low' },
];

const LOW_STOCK_THRESHOLD = 10;

const StatPill = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-4 py-3">
    <p className="font-mono-ls text-[10px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-xl font-bold text-primary">{value}</p>
  </div>
);

const toCsv = (rows) => {
  const header = ['Name', 'Category', 'Price', 'Unit', 'Stock', 'Weight/Unit (kg)', 'Status'];
  const lines = rows.map((p) =>
    [p.name, p.category, p.price, p.unit, p.stock, p.weightPerUnit, p.isActive ? 'Active' : 'Inactive']
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
};

const downloadCsv = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ShipperProducts = () => {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [modalTarget, setModalTarget] = useState(null); // null = closed, {} = new, product = edit
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyProducts()
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your products right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!products) return { total: 0, active: 0, lowStock: 0, catalogValue: 0 };
    return {
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      lowStock: products.filter((p) => p.isActive && p.stock <= LOW_STOCK_THRESHOLD).length,
      catalogValue: products.reduce((sum, p) => sum + (p.isActive ? p.price * p.stock : 0), 0),
    };
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products;

    if (filter === 'active') list = list.filter((p) => p.isActive);
    else if (filter === 'inactive') list = list.filter((p) => !p.isActive);
    else if (filter === 'low_stock') list = list.filter((p) => p.isActive && p.stock <= LOW_STOCK_THRESHOLD);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'stock_asc':
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock_desc':
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [products, filter, search, sort]);

  const handleSave = async (payload) => {
    if (modalTarget?._id) {
      const { data } = await updateProduct(modalTarget._id, payload);
      setProducts((prev) => prev.map((p) => (p._id === data.product._id ? data.product : p)));
    } else {
      const { data } = await createProduct(payload);
      setProducts((prev) => [data.product, ...(prev || [])]);
    }
  };

  const handleToggle = async (product) => {
    setBusyId(product._id);
    try {
      if (product.isActive) {
        await deleteProduct(product._id);
        setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isActive: false } : p)));
      } else {
        const { data } = await updateProduct(product._id, { isActive: true });
        setProducts((prev) => prev.map((p) => (p._id === product._id ? data.product : p)));
      }
    } catch {
      setError('Could not update that product right now.');
    } finally {
      setBusyId(null);
    }
  };

  const handleStockAdjust = async (product, delta) => {
    const nextStock = Math.max(0, (product.stock || 0) + delta);
    if (nextStock === product.stock) return;
    setBusyId(product._id);
    // optimistic update
    setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock: nextStock } : p)));
    try {
      await updateProduct(product._id, { stock: nextStock });
    } catch {
      // revert on failure
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, stock: product.stock } : p)));
      setError('Could not update stock right now.');
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    if (!filtered.length) return;
    const csv = toCsv(filtered);
    downloadCsv(csv, `products-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <DashboardLayout title="Products" subtitle="Your catalog — what buyers see and order from.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill label="TOTAL PRODUCTS" value={products === null ? '—' : stats.total} />
        <StatPill label="ACTIVE" value={products === null ? '—' : stats.active} />
        <StatPill
          label="LOW STOCK (≤10)"
          value={products === null ? '—' : stats.lowStock}
        />
        <StatPill
          label="CATALOG VALUE"
          value={products === null ? '—' : `₹${stats.catalogValue.toLocaleString('en-IN')}`}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalTarget({})}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow"
        >
          + Add product
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full max-w-xs rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-[#5B7A70] focus:border-primary/40 focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-primary/15 bg-transparent px-3 py-2 font-mono-ls text-[11px] tracking-wide text-primary focus:border-primary/40 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-white text-black">
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleExport}
          disabled={!filtered.length}
          className="ml-auto rounded-full border border-primary/15 px-4 py-1.5 font-mono-ls text-[11px] tracking-wide text-primary transition hover:border-primary/40 disabled:opacity-40"
        >
          EXPORT CSV
        </button>
      </div>

      <div className="mt-6">
        {products === null ? (
          <TruckLoader fullScreen={false} />
        ) : error && !products.length ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search || filter !== 'all' ? 'No matching products' : 'No products yet'}
            body={
              search || filter !== 'all'
                ? 'Try a different search term or filter.'
                : 'Add items to your catalog so buyers can find and order them.'
            }
            actionLabel={search || filter !== 'all' ? undefined : 'Add a product'}
            onAction={search || filter !== 'all' ? undefined : () => setModalTarget({})}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                  <th className="px-4 py-3 font-medium">PRODUCT</th>
                  <th className="px-4 py-3 font-medium">CATEGORY</th>
                  <th className="px-4 py-3 font-medium">PRICE</th>
                  <th className="px-4 py-3 font-medium">STOCK</th>
                  <th className="px-4 py-3 font-medium">WEIGHT/UNIT</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((p) => {
                  const isLow = p.isActive && p.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={p._id} className="hover:bg-secondary/10">
                      <td className="px-4 py-3 text-primary">
                        {p.name}
                        {isLow && (
                          <span className="ml-2 rounded-full border border-warning/30 px-2 py-0.5 font-mono-ls text-[9px] tracking-wide text-warning">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#5B7A70]">{p.category}</td>
                      <td className="px-4 py-3 text-[#5B7A70]">
                        ₹{p.price} <span className="text-[11px]">/ {p.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-[#5B7A70]">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p, -1)}
                            disabled={busyId === p._id || p.stock <= 0}
                            className="h-5 w-5 rounded border border-primary/15 text-xs leading-none text-primary transition hover:border-primary/40 disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className={`min-w-[2ch] text-center ${isLow ? 'font-semibold text-warning' : ''}`}>
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p, 1)}
                            disabled={busyId === p._id}
                            className="h-5 w-5 rounded border border-primary/15 text-xs leading-none text-primary transition hover:border-primary/40 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#5B7A70]">{p.weightPerUnit} kg</td>
                      <td className={`px-4 py-3 font-mono-ls text-xs ${p.isActive ? 'text-success' : 'text-[#5B7A70]'}`}>
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModalTarget(p)}
                            className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(p)}
                            disabled={busyId === p._id}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:opacity-60 ${
                              p.isActive
                                ? 'border-danger/30 text-danger hover:border-danger/60'
                                : 'border-primary/15 text-primary hover:border-primary/40'
                            }`}
                          >
                            {busyId === p._id ? '…' : p.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && products?.length > 0 && <p className="mt-4 text-xs text-warning">{error}</p>}

      {modalTarget && (
        <ProductModal
          product={modalTarget._id ? modalTarget : null}
          onSubmit={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ShipperProducts;