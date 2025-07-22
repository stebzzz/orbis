import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, FileText, Clock, Sparkles, BarChart3 } from "lucide-react";
import Header from "@/components/layout/header";
import KpiCards from "@/components/dashboard/kpi-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import ActiveProjects from "@/components/dashboard/active-projects";
import TimeTracker from "@/components/dashboard/time-tracker";
import RecentDocuments from "@/components/dashboard/recent-documents";

import { dashboardService } from "@/lib/firebase-service";
import type { DashboardMetrics } from "@/lib/types";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: { current: 0, previous: 0 },
    pendingQuotes: { amount: 0, count: 0 },
    unpaidInvoices: { amount: 0, count: 0, overdue: 0 },
    urssafEstimate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const dashboardMetrics = await dashboardService.getMetrics();
        setMetrics(dashboardMetrics);
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // Animation variants avec système cohérent
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.8
      }
    }
  };

  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/5 to-primary/5">
        <AnimatePresence>
          <motion.div
            variants={loadingVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center min-h-screen"
          >
            <div className="relative">
              {/* Cercle de chargement principal */}
              <motion.div
                className="w-20 h-20 border-4 border-border rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  borderTopColor: "hsl(var(--primary))",
                  borderRightColor: "hsl(var(--secondary))"
                }}
              />
              
              {/* Icône centrale */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
              >
                <BarChart3 className="w-8 h-8 text-primary" />
              </motion.div>
              
              {/* Particules flottantes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}px`,
                    left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 40}px`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <motion.p
              className="absolute mt-32 text-lg font-medium text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Chargement du tableau de bord...
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/5 to-primary/5 relative">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header avec animation d'entrée */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 blur-xl" />
          <Header
            title="Tableau de Bord"
            subtitle="Aperçu de votre activité"
          />
        </div>
      </motion.div>
      
      {/* Contenu principal */}
      <motion.div 
        className="relative z-10 p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section KPI avec design moderne */}
        <motion.div variants={itemVariants} className="relative group">
          {/* Effet de lueur de fond */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Bordure animée */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
              padding: "1px"
            }}
            animate={{
              background: [
                "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
                "linear-gradient(225deg, hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.2))",
                "linear-gradient(315deg, hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))",
                "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full bg-background/80 backdrop-blur-sm rounded-3xl" />
          </motion.div>
          
          <div className="relative">
            <KpiCards metrics={metrics} isLoading={false} />
          </div>
        </motion.div>
        
        {/* Section Graphiques avec design cohérent */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Graphique des revenus */}
          <motion.div 
            className="lg:col-span-2 relative group"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="w-5 h-5 text-primary/60" />
                </motion.div>
              </div>
              <RevenueChart />
            </div>
          </motion.div>
          
          {/* Activité récente */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-5 h-5 text-secondary/60" />
                </motion.div>
              </div>
              <RecentActivity />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Section Projets et Suivi du temps */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Projets actifs */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    y: [0, -4, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut"
                  }}
                >
                  <Users className="w-5 h-5 text-accent/60" />
                </motion.div>
              </div>
              <ActiveProjects />
            </div>
          </motion.div>
          
          {/* Suivi du temps */}
          <motion.div 
            className="relative group"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-5 h-5 text-primary/60" />
                </motion.div>
              </div>
              <TimeTracker />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Section Documents récents */}
        <motion.div 
          variants={itemVariants}
          className="relative group"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
              >
                <FileText className="w-5 h-5 text-secondary/60" />
              </motion.div>
            </div>
            <RecentDocuments />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
