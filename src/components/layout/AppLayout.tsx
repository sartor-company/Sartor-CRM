import { Outlet } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useApp } from '../../context/AppContext';
import { RoleTierBar } from './RoleTierBar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { sidebarOpen, closeSidebar } = useApp();
  const { hasOpen, closeAll } = useModal();

  const overlayOn = sidebarOpen || hasOpen;

  return (
    <>
      <RoleTierBar />
      <div id="app">
        <div
          className={`ov${overlayOn ? ' on' : ''}`}
          onClick={() => {
            closeSidebar();
            closeAll();
          }}
          role="presentation"
        />
        <Sidebar />
        <div id="main">
          <Topbar />
          <div className="cnt">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
