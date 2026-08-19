import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import 'leaflet/dist/leaflet.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostShipment from './pages/PostShipment';
import AdminShipments from './pages/AdminShipments';
import AdminDrivers from './pages/AdminDrivers';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Faqs from './pages/Faqs';
import Terms from './pages/Terms';       
import Privacy from './pages/Privacy';   
import HowItWorksPage from './pages/HowItWorksPage';
import Industries from './pages/Industries';
import AdminComplaints from './pages/AdminComplaints';
import AdminReports from './pages/AdminReports';
import AdminLiveMap from './pages/AdminLiveMap';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';
import ComplaintsPage from './pages/ComplaintsPage';
import Profile from './pages/Profile'; 
import DashboardLayout from './components/common/DashboardLayout';

// --- DRIVER IMPORTS ---
import DriverDashboard from './pages/DriverDashboard';
import DriverLoads from './pages/DriverLoads';
import DriverTrips from './pages/DriverTrips';
import DriverWallet from './pages/DriverWallet';
import DriverDocuments from './pages/DriverDocuments';
import DriverSupport from './pages/DriverSupport';
import DriverSettings from './pages/DriverSettings';
import DriverNotifications from './pages/DriverNotifications';

// --- SHIPPER IMPORTS ---
import ShipperDashboard from './pages/ShipperDashboard';
import ShipperShipments from './pages/ShipperShipments';
import ShipperProducts from './pages/ShipperProducts';     
import ShipperOrders from './pages/ShipperOrders';         
import ShipperSubscription from './pages/ShipperSubscription';
import ShipperSupport from './pages/ShipperSupport';       
import ShipperSettings from './pages/ShipperSettings'; 
import ShipperNotifications from './pages/ShipperNotifications';
// --- AGENCY IMPORTS ---
import AgencyDashboard from './pages/AgencyDashboard';
import AgencyOverview from './pages/AgencyOverview';
import AgencyOrders from './pages/AgencyOrders';
import AvailableTrucks from './pages/AvailableTrucks';
import TruckTracking from './pages/TruckTracking';
import Onboarding from './pages/Onboarding';
import AgencySupport from './pages/Agency/Support';
import AgencyDrivers from './pages/Agency/Drivers'; 
// 🟢 FIXED: Changed variable name here to match element usage below
import AgencySettings from "./pages/Agency/Settings";

// --- BUYER IMPORTS ---
import BuyerOrderTracking from './pages/BuyerOrderTracking';
import BuyerShop from './pages/BuyerShop';
import BuyerCheckout from './pages/BuyerCheckout';
import BookShipment from "./pages/buyer/BookShipment";
import VehicleSelection from "./pages/buyer/VehicleSelection";
import OrderConfirmation from "./pages/buyer/OrderConfirmation";
import OrderDetails from "./pages/buyer/OrderDetails";
import PaymentHistory from "./pages/buyer/PaymentHistory";
import Notifications from "./pages/buyer/Notifications";
import SavedAddresses from "./pages/buyer/SavedAddresses";
import Support from "./pages/buyer/Support";
import Settings from "./pages/buyer/Settings";
import Invoices from "./pages/buyer/Invoices";

import AdminAIPricing from './pages/AdminAIPricing';

import AgencyFleetTracking from './pages/AgencyFleetTracking';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Buyer Routes */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/settings"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/invoices"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/support"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/addresses"
                element={
                    <ProtectedRoute allowedRoles={["buyer"]}>
                        <SavedAddresses />
                    </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/notifications"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/orders/:orderId"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/payments"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <PaymentHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/vehicle-selection"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <VehicleSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/orders"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/order-confirmation"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/book-shipment"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BookShipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/checkout"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerCheckout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/orders/:orderId/track"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerOrderTracking />
                  </ProtectedRoute>
                }
              />
              {/* Shipper Routes */}
              <Route
                path="/shipper/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/shipments"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperShipments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/products"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/orders"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/subscription"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperSubscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/post-shipment"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <PostShipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/notifications"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/support"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shipper/settings"
                element={
                  <ProtectedRoute allowedRoles={['shipper']}>
                    <ShipperSettings />
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="/driver/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/loads"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverLoads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/trips"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/wallet"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/documents"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDocuments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/notifications"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/support"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverSupport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver/settings"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverSettings />
                  </ProtectedRoute>
                }
              /> 

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shipments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminShipments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/drivers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDrivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/live-map"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLiveMap />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ai-pricing"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAIPricing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />

              {/* Shared Routes */}
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'shipper', 'driver', 'agency', 'admin']}>
                    <ComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* UNIVERSAL PROFILE ROUTE */}
              <Route
                path="/driver/profile"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'shipper', 'driver', 'agency', 'admin']}>
                    <DashboardLayout
                      title="My Profile"
                      subtitle="Manage your personal details, company settings, and account security."
                    >
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* --- AGENCY DASHBOARD (NESTED ROUTES) --- */}
              <Route
                path="/agency"
                element={
                  <ProtectedRoute allowedRoles={['agency']}>
                    <AgencyDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AgencyOverview />} />
                <Route path="overview" element={<AgencyOverview />} />
                <Route path="dashboard" element={<AgencyOverview />} /> 
                <Route path="orders-received" element={<AgencyOrders />} />
                
                <Route path="available-trucks" element={<AvailableTrucks />} />
                <Route path="manage-fleet" element={<AvailableTrucks />} /> 
                <Route path="fleet" element={<AvailableTrucks />} /> 
                
                <Route path="drivers" element={<AgencyDrivers />} /> 
                <Route path="truck-tracking" element={<TruckTracking />} />
                <Route path="drivers" element={<AgencyDrivers />} /> 
                <Route path="truck-tracking" element={<TruckTracking />} />
                <Route path="fleet-locations" element={<AgencyFleetTracking />} />
                <Route path="profile" element={<Profile />} />
                <Route path="support" element={<AgencySupport />} />
                <Route path="settings" element={<AgencySettings />} /> 
              </Route>

              {/* Fallback Missing Page Handling */}
              <Route path="*" element={<div className="p-10 text-white bg-background min-h-screen">Page under construction</div>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;