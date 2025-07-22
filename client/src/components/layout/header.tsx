import { Button } from "@/components/ui/button";
import { Bell, Plus, FileText } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          {!action && (
            <div className="flex items-center space-x-2">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouveau Devis</span>
              </Button>
              <Button className="bg-secondary hover:bg-secondary/90">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle Facture</span>
              </Button>
            </div>
          )}
          
          {action && action}
          
          {/* Notifications */}
          <div className="relative">
            <Button size="sm" variant="ghost" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
