import Dashboard from '@/components/dashboard';
import AppSidebar from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Dashboard />
      </SidebarInset>
    </>
  );
}
