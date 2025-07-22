import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  BarChart3,
  Users,
  FileText,
  FolderOpen,
  Clock,
  Tags,
  PieChart,
  Download,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: BarChart3 },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Devis & Factures", href: "/devis-factures", icon: FileText },
  { name: "Projets", href: "/projets", icon: FolderOpen },
  { name: "Suivi du Temps", href: "/temps", icon: Clock },
  { name: "Catalogue", href: "/catalogue", icon: Tags },
  { name: "Finances", href: "/finances", icon: PieChart },
  { name: "Rapports", href: "/rapports", icon: Download },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = (user: any) => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };

  const getUserDisplayName = (user: any) => {
    if (!user) return "Utilisateur";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "Utilisateur";
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">Orbis</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20"
                    : "text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors">
          <div className="w-8 h-8 bg-gradient-to-r from-sidebar-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-sidebar-primary-foreground">
              {getInitials(user)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs text-sidebar-accent-foreground truncate">
              Auto-entrepreneur
            </p>
          </div>
          <div className="flex space-x-1">
            <Link href="/parametres">
              <button className="p-1 text-sidebar-accent-foreground hover:text-sidebar-foreground transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <LogoutButton 
              variant="ghost" 
              size="sm"
              showIcon={true}
            >
              <span className="sr-only">Se déconnecter</span>
            </LogoutButton>
          </div>
        </div>
      </div>
    </aside>
  );
}
