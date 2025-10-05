import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarNav } from '@/components/sidebar-nav';

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200/80">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarSeparator className="bg-primary/10" />
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
    </Sidebar>
  );
}
