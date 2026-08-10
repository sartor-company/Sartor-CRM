import { AppProvider } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';
import { ModalProvider } from './context/ModalContext';
import { PaymentIntentProvider } from './context/PaymentIntentContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <PaymentIntentProvider>
          <AppProvider>
            <LocationProvider>
              <AppRoutes />
            </LocationProvider>
          </AppProvider>
        </PaymentIntentProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
