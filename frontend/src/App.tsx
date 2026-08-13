import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { ReceiptPage } from './features/checkout/ReceiptPage';
import { WalletPage } from './features/wallet/WalletPage';
import { WebhooksPage } from './features/webhooks/WebhooksPage';
import { WithdrawalsPage } from './features/withdrawals/WithdrawalsPage';
import { AppShell } from './layout/AppShell';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/esqueci-senha" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout/:id/comprovante" element={<ReceiptPage />} />
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
