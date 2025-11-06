import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Sparkles } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg flex items-center px-6 relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            
            {/* Content */}
            <div className="relative flex items-center w-full">
              <SidebarTrigger className="text-white hover:bg-white/20 transition-colors" />
              <div className="flex items-center gap-3 ml-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    PIYUCLEAN
                  </h1>
                  <p className="text-xs text-emerald-50/90 -mt-0.5">Cleaning Management System</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-gray-100 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
