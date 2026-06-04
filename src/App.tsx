import { AppProvider } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <AppProvider>
          <LocationProvider>
            <AppRoutes />
          </LocationProvider>
        </AppProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
