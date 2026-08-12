import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { WalletPage } from './features/wallet/WalletPage';
import { WebhooksPage } from './features/webhooks/WebhooksPage';
import { WithdrawalsPage } from './features/withdrawals/WithdrawalsPage';
import { AppShell } from './layout/AppShell';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<WalletPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/saques" element={<WithdrawalsPage />} />
            <Route path="/webhooks" element={<WebhooksPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
