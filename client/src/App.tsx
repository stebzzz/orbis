import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import QuotesInvoices from "@/pages/quotes-invoices";
import Projects from "@/pages/projects";

import Catalog from "@/pages/catalog";
import Finances from "@/pages/finances";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/clients" component={Clients} />
          <Route path="/devis-factures" component={QuotesInvoices} />
          <Route path="/projets" component={Projects} />

          <Route path="/catalogue" component={Catalog} />
          <Route path="/finances" component={Finances} />
          <Route path="/rapports" component={Reports} />
          <Route path="/parametres" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
