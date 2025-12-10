import { Users, UserCog, Package, Wrench, DollarSign } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Funcionários", url: "/funcionarios", icon: UserCog },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Serviços", url: "/servicos", icon: Wrench },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            
            {/* O caminho da imagem foi ajustado para /logooficina.png */}
            <img 
              src="/logooficina.png" // <--- CAMINHO AJUSTADO AQUI!
              alt="Logo Master Car Oficina"
              className={`h-10 w-auto ${isCollapsed ? 'mx-auto' : 'flex-shrink-0'}`} 
            />

            {!isCollapsed && (
              <div className="flex flex-col">
                {/* Nome da Oficina */}
                <h1 className="text-sidebar-foreground font-bold text-lg leading-tight">
                  Master Car Oficina
                </h1>
                {/* Descrição */}
                <p className="text-sidebar-foreground/60 text-xs">Painel administrativo</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}