import Logo from './Logo';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { NavLink, Link } from 'react-router-dom';

const navByRole = {
  buyer: [
    { label: "Dashboard", href: "/buyer/dashboard" },
    { label: "Book Shipment", href: "/buyer/book-shipment" },
    { label: "My Orders", href: "/buyer/orders" },
    { label: "Payments", href: "/buyer/payments" },
    { label: "Invoices", href: "/buyer/invoices" },
    { label: "Addresses", href: "/buyer/addresses" },
    { label: "Notifications", href: "/buyer/notifications" },
    { label: "Support", href: "/buyer/support" },
    { label: "Settings", href: "/buyer/settings" },
    { label: "Profile", href: "/driver/profile" },
  ],
  shipper: [
    { label: 'Overview', href: '/shipper/dashboard' },
    { label: 'Products', href: '/shipper/products' },
    { label: 'Shipments', href: '/shipper/shipments' },
    { label: 'Orders received', href: '/shipper/orders' },
    { label: 'Subscription', href: '/shipper/subscription' },
    { label: 'Support', href: '/shipper/support' },       // 🟢 Standardized to label/href
    { label: 'Settings', href: '/shipper/settings' },     // 🟢 Standardized to label/href
    { label: 'Profile', href: '/driver/profile' },
  ],
  driver: [
    { label: 'Overview', href: '/driver/dashboard' },
    { label: 'Available loads', href: '/driver/loads' },
    { label: 'Trip history', href: '/driver/trips' },
    { label: 'Wallet', href: '/driver/wallet' },
    { label: 'Documents', href: '/driver/documents' },
    { label: 'Support', href: '/driver/support' },   
    { label: 'Settings', href: '/driver/settings' },  
    { label: 'Profile', href: '/driver/profile' },
  ],
  agency: [
  { label: 'Overview', href: '/agency/overview' },
  { label: 'Orders Received', href: '/agency/orders-received' },
  { label: 'Manage Fleet', href: '/agency/available-trucks' },
  { label: 'Drivers', href: '/agency/drivers' },
  { label: 'Truck Tracking', href: '/agency/truck-tracking' },
  { label: 'Fleet Locations', href: '/agency/fleet-locations' },
  { label: 'Support', href: '/agency/support' },
  { label: 'Settings', href: '/agency/settings' },
  { label: 'Profile', href: '/agency/profile' },
],
  admin: [
    { label: 'Overview', href: '/admin/dashboard' },
    { label: 'Shipment requests', href: '/admin/shipments' },
    { label: 'Driver verification', href: '/admin/drivers' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Complaints', href: '/admin/complaints' },
    { label: 'Notifications', href: '/admin/notifications' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Live map', href: '/admin/live-map' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Profile', href: '/driver/profile' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'AI Pricing', href: '/admin/ai-pricing' },
  ],
};

const DashboardLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  
  // Provide a safe fallback if user role isn't recognized immediately
  const nav = navByRole[user?.role] || navByRole.driver; 
  
  const { totalItems } = useCart();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-primary/10 bg-secondary/20 px-5 py-8 md:block">
        <a href="/" className="block transition hover:opacity-80">
          <Logo />
        </a>
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
                    {item.label?.toUpperCase() || ''} {/* 🟢 Added optional chaining guard */}
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
              Log out
            </button>
          </div>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;