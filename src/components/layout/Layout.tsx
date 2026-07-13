import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { WhatsAppButton } from './WhatsAppButton';
import { RequireAuth } from '../auth/RequireAuth';
import type { UserRole } from '../../types';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin', 'project_manager', 'sales_rep', 'trainer'];

export function AdminLayout() {
  return (
    <RequireAuth roles={ADMIN_ROLES}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          <Outlet />
        </main>
        <WhatsAppButton />
      </div>
    </RequireAuth>
  );
}
