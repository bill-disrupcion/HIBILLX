import AppSidebar from '@/components/app-sidebar';
import RepositoryContent from '@/components/repository-content'; // New component
import { SidebarInset } from '@/components/ui/sidebar';

export default function RepositoryPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <RepositoryContent />
      </SidebarInset>
    </>
  );
}
