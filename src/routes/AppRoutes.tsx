import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { defaultPathForRole } from '../constants/routes';
import { useApp } from '../context/AppContext';
import {
  CommissionsPage,
  CustomersPage,
  DashboardPage,
  DeliveriesPage,
  DriversPage,
  FinanceDashPage,
  GrnLogPage,
  IntelPage,
  InvoicesPage,
  LeadsPage,
  LposPage,
  LpoQueuePage,
  MerchDashboardPage,
  MyCommissionsPage,
  PackLposPage,
  PipelinePage,
  ProductsPage,
  ReconciliationPage,
  ReorderAlertsPage,
  ReportsPage,
  ReturnsPage,
  Sartor360Page,
  SettingsPage,
  SuppliersPage,
  TeamPage,
  VisitsPage,
  WarehousesPage,
  RedeemGiftPage,
  StickerOrdersPage,
} from '../pages';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../marketing/LandingPage';

function RoleHomeRedirect() {
  const { role } = useApp();
  return <Navigate to={defaultPathForRole(role)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="field" element={<MerchDashboardPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="lpos" element={<LposPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="sartor360" element={<Sartor360Page />} />
          <Route path="sticker-orders" element={<StickerOrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="lpo-queue" element={<LpoQueuePage />} />
          <Route path="pack-lpos" element={<PackLposPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="redeem-gift" element={<RedeemGiftPage />} />
          <Route path="intel" element={<IntelPage />} />
          <Route path="payment-queue" element={<FinanceDashPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="commissions" element={<CommissionsPage />} />
          <Route path="my-commission" element={<MyCommissionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="grn" element={<GrnLogPage />} />
          <Route path="reorder-alerts" element={<ReorderAlertsPage />} />
          <Route path="reconciliation" element={<ReconciliationPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="*" element={<RoleHomeRedirect />} />
        </Route>
      </Route>
    </Routes>
  );
}
