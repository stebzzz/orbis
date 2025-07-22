import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function RevenueChart() {
  return (
    <div className="lg:col-span-2">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Évolution du Chiffre d'Affaires</CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="bg-primary text-primary-foreground">
                12 mois
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                6 mois
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                3 mois
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart Placeholder */}
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border border-border">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Graphique d'évolution du CA</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Intégration des graphiques en cours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
