import { 
  LayoutDashboard, 
  Users, 
  School, 
  CheckSquare, 
  ClipboardList, 
  FileText, 
  UserCog, 
  Settings,
  LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/students', icon: Users },
  { title: 'Classrooms', url: '/classrooms', icon: School },
  { title: 'Tasks & Checklists', url: '/tasks', icon: CheckSquare },
  { title: 'Task Assignment', url: '/assignments', icon: ClipboardList },
  { title: 'Completion Logs', url: '/logs', icon: FileText },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'User Management', url: '/users', icon: UserCog },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-5 border-b border-sidebar-border bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-800 tracking-tight">PIYUCLEAN</h2>
              <p className="text-xs text-emerald-600">Management Hub</p>
            </div>
          </div>
        </div>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 font-medium border-l-2 border-emerald-600' 
                          : 'hover:bg-slate-50 transition-all'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-slate-50">
        <div className="mb-3 p-3 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
          <p className="text-xs text-emerald-600 font-medium">{user?.role}</p>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all" 
          size="sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
