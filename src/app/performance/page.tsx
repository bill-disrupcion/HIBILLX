import AppSidebar from '@/components/app-sidebar';
import PerformanceDisplay from '@/components/performance-display';
import { SidebarInset } from '@/components/ui/sidebar';

export default function PerformancePage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <PerformanceDisplay />
      </SidebarInset>
    </>
  );
}
