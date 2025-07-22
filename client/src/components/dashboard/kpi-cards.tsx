import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, AlertTriangle, Calculator, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import type { DashboardMetrics } from "@/lib/types";

interface KpiCardsProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export default function KpiCards({ metrics, isLoading }: KpiCardsProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    })
  };

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <Card className="glass border border-border/50 hover-lift">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gradient-to-r from-muted via-muted/50 to-transparent rounded-lg shimmer"></div>
                      <div className="h-8 bg-gradient-to-r from-muted via-muted/50 to-transparent rounded-lg shimmer"></div>
                      <div className="h-3 bg-gradient-to-r from-muted via-muted/50 to-transparent rounded-lg shimmer w-2/3"></div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl shimmer"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  const percentageChange = metrics.revenue.previous > 0 
    ? ((metrics.revenue.current - metrics.revenue.previous) / metrics.revenue.previous) * 100 
    : 0;

  const isPositiveChange = percentageChange >= 0;

  const kpiData = [
    {
      title: "Chiffre d'Affaires",
      value: metrics.revenue.current,
      subtitle: "Cette année",
      icon: TrendingUp,
      gradient: "from-primary via-blue-500 to-blue-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      change: percentageChange,
      changeLabel: "vs année précédente",
      format: "currency"
    },
    {
      title: "Devis En Attente",
      value: metrics.pendingQuotes.amount,
      subtitle: `${metrics.pendingQuotes.count} devis`,
      icon: FileText,
      gradient: "from-card to-card",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      textColor: "text-foreground",
      changeLabel: "En attente de réponse",
      format: "currency"
    },
    {
      title: "Factures Impayées",
      value: metrics.unpaidInvoices.amount,
      subtitle: `${metrics.unpaidInvoices.count} facture${metrics.unpaidInvoices.count > 1 ? 's' : ''}`,
      icon: AlertTriangle,
      gradient: "from-card to-card",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      textColor: "text-foreground",
      changeLabel: metrics.unpaidInvoices.overdue > 0 ? "En retard" : "Toutes à jour",
      changeValue: metrics.unpaidInvoices.overdue,
      format: "currency"
    },
    {
      title: "Cotisations URSSAF",
      value: metrics.urssafEstimate,
      subtitle: "Estimation",
      icon: Calculator,
      gradient: "from-card to-card",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      textColor: "text-foreground",
      changeLabel: "Basé sur le CA actuel",
      format: "currency"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        const isRevenue = index === 0;
        
        return (
          <motion.div
            key={kpi.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 30 }
            }}
          >
            <Card className={`
              ${isRevenue 
                ? `bg-gradient-to-br ${kpi.gradient} border-0 shadow-2xl relative overflow-hidden` 
                : 'glass border border-border/50'
              }
              hover-lift group cursor-pointer
            `}>
              {isRevenue && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                </>  
              )}
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`
                      text-sm font-medium tracking-wide
                      ${isRevenue ? 'text-blue-100' : 'text-muted-foreground'}
                    `}>
                      {kpi.title}
                    </p>
                    <motion.p 
                      className={`
                        text-3xl font-bold mt-2 tracking-tight
                        ${kpi.textColor}
                      `}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {kpi.format === 'currency' 
                        ? kpi.value.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0
                          })
                        : kpi.value.toLocaleString('fr-FR')
                      }
                    </motion.p>
                    <p className={`
                      text-sm mt-1
                      ${isRevenue ? 'text-blue-200' : 'text-muted-foreground'}
                    `}>
                      {kpi.subtitle}
                    </p>
                  </div>
                  
                  <motion.div 
                    className={`
                      ${kpi.iconBg} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300
                      ${isRevenue ? 'shadow-lg' : ''}
                    `}
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`
                      w-6 h-6 
                      ${isRevenue ? 'text-white' : kpi.iconColor}
                    `} />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  {isRevenue && kpi.change !== undefined && (
                    <motion.div 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {isPositiveChange ? (
                        <ArrowUpRight className="w-4 h-4 text-green-300 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-300 mr-1" />
                      )}
                      <span className={isPositiveChange ? 'text-green-300' : 'text-red-300'}>
                        {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                      </span>
                      <span className="text-blue-200 ml-1">{kpi.changeLabel}</span>
                    </motion.div>
                  )}
                  
                  {!isRevenue && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{kpi.changeLabel}</span>
                      {kpi.changeValue !== undefined && kpi.changeValue > 0 && (
                        <span className="text-red-400 font-medium">
                          {kpi.changeValue.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
