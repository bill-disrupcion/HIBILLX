import AppSidebar from '@/components/app-sidebar';
import BillXAgent from '@/components/bill-x-agent'; // Assuming this component is created
import { SidebarInset } from '@/components/ui/sidebar';

export default function BillXPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <BillXAgent />
      </SidebarInset>
    </>
  );
}
