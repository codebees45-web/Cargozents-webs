import { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import TruckLoader from '../components/common/TruckLoader';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

const StatField = ({ label, value }) => (
  <div className="rounded-xl border border-primary/10 bg-secondary/20 px-5 py-4">
    <p className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
  </div>
);

const DriverWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/drivers/wallet')
      .then((res) => !cancelled && setWallet(res.data.wallet))
      .catch(() => !cancelled && setError('Could not load your wallet.'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout title="Wallet" subtitle="Earnings from your completed deliveries.">
      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatField label="TOTAL EARNINGS" value={wallet === null ? '—' : `₹${wallet.totalEarnings.toLocaleString('en-IN')}`} />
        <StatField
          label="THIS MONTH"
          value={wallet === null ? '—' : `₹${wallet.thisMonthEarnings.toLocaleString('en-IN')}`}
        />
        <StatField label="COMPLETED TRIPS" value={wallet === null ? '—' : wallet.completedTrips} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">Transactions</h2>
        <div className="mt-4">
          {wallet === null ? (
            <TruckLoader fullScreen={false} />
          ) : wallet.transactions.length === 0 ? (
            <EmptyState
              title="No earnings yet"
              body="Complete a delivery and it'll show up here as a credited transaction."
            />
          ) : (
            <ul className="divide-y divide-white/5 rounded-xl border border-primary/10">
              {wallet.transactions.map((t) => (
                <li key={t.shipmentId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="font-mono-ls text-[11px] text-[#5B7A70]">{t.route}</p>
                    <p className="mt-1 text-sm text-primary">
                      {t.goodsType}
                      {t.isBackhaulMatch && <span className="ml-2 text-success">BACKHAUL MATCH</span>}
                    </p>
                    <p className="mt-1 font-mono-ls text-[10px] text-[#5B7A70]">
                      {new Date(t.deliveredAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="font-display text-lg font-semibold text-success">
                    +₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-8 text-xs text-[#5B7A70]">
        Earnings shown here are computed directly from completed delivery prices. Payout scheduling and withdrawal
        aren't wired up yet — this is a running earnings ledger for now.
      </p>
    </DashboardLayout>
  );
};

export default DriverWallet;