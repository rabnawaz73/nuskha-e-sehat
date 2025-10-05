import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
       <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col h-screen flex-1 overflow-hidden">
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                <div className="md:hidden">
                    {/* <SidebarTrigger /> */}
                </div>
                <h1 className="text-xl font-semibold font-body">Nuskha-e-Sehat</h1>
            </header>
            <main className="flex flex-1 flex-col overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
       </SidebarProvider>
    </div>
  );
}
