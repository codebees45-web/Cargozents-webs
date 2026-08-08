import Logo from './Logo';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navByRole = {
  buyer: [
    { labelKey: "dashboard", href: "/buyer/dashboard" },
    { labelKey: "bookShipment", href: "/buyer/book-shipment" },
    { labelKey: "myOrders", href: "/buyer/orders" },
    { labelKey: "payments", href: "/buyer/payments" },
    { labelKey: "invoices", href: "/buyer/invoices" },
    { labelKey: "addresses", href: "/buyer/addresses" },
    { labelKey: "notifications", href: "/buyer/notifications" },
    { labelKey: "support", href: "/buyer/support" },
    { labelKey: "settings", href: "/buyer/settings" },
    { labelKey: "profile", href: "/driver/profile" },
  ],
  shipper: [
    { labelKey: 'overview', href: '/shipper/dashboard' },
    { labelKey: 'products', href: '/shipper/products' },
    { labelKey: 'shipments', href: '/shipper/shipments' },
    { labelKey: 'ordersReceived', href: '/shipper/orders' },
    { labelKey: 'subscription', href: '/shipper/subscription' },
    { labelKey: 'support', href: '/shipper/support' },
    { labelKey: 'settings', href: '/shipper/settings' },
    { labelKey: 'profile', href: '/driver/profile' },
  ],
  driver: [
    { labelKey: 'overview', href: '/driver/dashboard' },
    { labelKey: 'availableLoads', href: '/driver/loads' },
    { labelKey: 'tripHistory', href: '/driver/trips' },
    { labelKey: 'wallet', href: '/driver/wallet' },
    { labelKey: 'documents', href: '/driver/documents' },
    { labelKey: 'support', href: '/driver/support' },
    { labelKey: 'settings', href: '/driver/settings' },
    { labelKey: 'profile', href: '/driver/profile' },
  ],
  agency: [
    { labelKey: 'overview', href: '/agency/overview' },
    { labelKey: 'ordersReceived', href: '/agency/orders-received' },
    { labelKey: 'manageFleet', href: '/agency/available-trucks' },
    { labelKey: 'drivers', href: '/agency/drivers' },
    { labelKey: 'truckTracking', href: '/agency/truck-tracking' },
    { labelKey: 'fleetLocations', href: '/agency/fleet-locations' },
    { labelKey: 'support', href: '/agency/support' },
    { labelKey: 'settings', href: '/agency/settings' },
    { labelKey: 'profile', href: '/agency/profile' },
  ],
  admin: [
    { labelKey: 'overview', href: '/admin/dashboard' },
    { labelKey: 'shipmentRequests', href: '/admin/shipments' },
    { labelKey: 'driverVerification', href: '/admin/drivers' },
    { labelKey: 'users', href: '/admin/users' },
    { labelKey: 'complaints', href: '/admin/complaints' },
    { labelKey: 'notifications', href: '/admin/notifications' },
    { labelKey: 'reports', href: '/admin/reports' },
    { labelKey: 'liveMap', href: '/admin/live-map' },
    { labelKey: 'settings', href: '/admin/settings' },
    { labelKey: 'profile', href: '/driver/profile' },
    { labelKey: 'reports', href: '/admin/reports' },
    { labelKey: 'aiPricing', href: '/admin/ai-pricing' },
  ],
};

const DashboardLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  // Provide a safe fallback if user role isn't recognized immediately
  const nav = navByRole[user?.role] || navByRole.driver; 
  
  const { totalItems } = useCart();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-primary/10 bg-secondary/20 px-5 py-8 md:block">
        <Link to="/" className="block transition hover:opacity-80">
          <Logo />
        </Link>
        <nav className="mt-10 space-y-1">
          {nav.map((item) => {
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-[#5B7A70] hover:bg-secondary/30 hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    {item.labelKey ? t(`nav.${item.labelKey}`).toUpperCase() : ''}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-primary/10 px-6 py-5 md:px-10">
          <div>
            <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[#5B7A70]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'buyer' && (
              <Link to="/buyer/checkout" className="relative rounded-lg p-2 text-primary/70 transition hover:bg-primary/5 hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent font-mono-ls text-[9px] font-bold text-primary">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <span className="font-mono-ls text-[11px] text-[#5B7A70]">
              {user?.name?.toUpperCase() || ''} &middot; {user?.role?.toUpperCase() || ''}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs text-primary/70 transition hover:border-danger/50 hover:text-danger"
            >
              {t('nav.logout')}
            </button>
          </div>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;