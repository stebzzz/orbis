import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, Receipt, DollarSign, Sparkles, Zap, BarChart3, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseModal } from "@/components/modals/expense-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Expense } from "@shared/schema";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const loadingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Finances() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/expenses"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/dashboard/metrics"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/metrics"] });
      toast({
        title: "Succès",
        description: "Dépense supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleNewExpense = () => {
    setSelectedExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Voulez-vous supprimer cette dépense ?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const isLoading = expensesLoading || metricsLoading;

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        className="flex-1 overflow-auto flex items-center justify-center min-h-screen"
        variants={loadingVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 25, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="relative mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CreditCard className="w-8 h-8 text-primary" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Chargement des finances...
          </motion.h2>
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <motion.div 
      className="flex-1 overflow-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-2xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      <motion.div variants={itemVariants}>
        <Header
          title="Finances"
          subtitle="Vue d'ensemble de votre situation financière"
          action={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Button 
                onClick={handleNewExpense} 
                className="relative bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 group"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                </motion.div>
                Nouvelle Dépense
              </Button>
            </motion.div>
          }
        />
      </motion.div>

      <motion.div 
        className="p-6 space-y-6"
        variants={itemVariants}
      >
        {/* Financial Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {/* Revenue Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Multiple glow layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-green-500/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </motion.div>
                  </motion.div>
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-muted-foreground"
                      whileHover={{ scale: 1.02 }}
                    >
                      Chiffre d'affaires
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {metrics?.revenue.current.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }) || '0 €'}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expenses Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Multiple glow layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-rose-500/30 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-red-500/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </motion.div>
                  </motion.div>
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-muted-foreground"
                      whileHover={{ scale: 1.02 }}
                    >
                      Dépenses totales
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      {totalExpenses.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Unpaid Invoices Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Multiple glow layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-blue-500/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    </motion.div>
                  </motion.div>
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-muted-foreground"
                      whileHover={{ scale: 1.02 }}
                    >
                      Factures impayées
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      {metrics?.unpaidInvoices.amount.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }) || '0 €'}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* URSSAF Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{ 
              scale: 1.02,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            {/* Multiple glow layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-purple-500/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Receipt className="w-6 h-6 text-purple-400" />
                    </motion.div>
                  </motion.div>
                  <div className="ml-4">
                    <motion.p 
                      className="text-sm text-muted-foreground"
                      whileHover={{ scale: 1.02 }}
                    >
                      URSSAF estimé
                    </motion.p>
                    <motion.p 
                      className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    >
                      {metrics?.urssafEstimate.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }) || '0 €'}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          {/* Multiple glow layers */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <BarChart3 className="w-6 h-6 text-primary" />
                </motion.div>
                <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Dépenses récentes
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-4"
                  >
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto" />
                  </motion.div>
                  <motion.h3 
                    className="text-lg font-medium text-foreground mb-2"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Aucune dépense
                  </motion.h3>
                  <p className="text-muted-foreground">Commencez par ajouter vos premières dépenses.</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-3"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {expenses.slice(0, 10).map((expense, index) => (
                    <motion.div 
                      key={expense.id} 
                      variants={{
                        hidden: { opacity: 0, x: -20, scale: 0.95 },
                        visible: { opacity: 1, x: 0, scale: 1 }
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        x: 5,
                        transition: { duration: 0.2 }
                      }}
                      className="relative group/item"
                    >
                      {/* Expense item glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-lg border border-border/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="w-10 h-10 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-primary/30"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                            >
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              >
                                <Receipt className="w-5 h-5 text-primary" />
                              </motion.div>
                            </motion.div>
                            <div>
                              <motion.p 
                                className="text-foreground font-medium"
                                whileHover={{ scale: 1.02 }}
                              >
                                {expense.description}
                              </motion.p>
                              <motion.p 
                                className="text-sm text-muted-foreground"
                                whileHover={{ scale: 1.02 }}
                              >
                                {new Date(expense.date).toLocaleDateString('fr-FR')}
                                {expense.category && (
                                  <span className="ml-2">• {expense.category}</span>
                                )}
                              </motion.p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <motion.p 
                              className="text-foreground font-semibold"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                            >
                              {Number(expense.amount).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </motion.p>
                            {expense.vatAmount && (
                              <p className="text-xs text-muted-foreground">
                                TVA: {Number(expense.vatAmount).toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'EUR'
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditExpense(expense)}
                                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                              >
                                Modifier
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExpense(Number(expense.id))}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                Supprimer
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Expense Modal */}
      <ExpenseModal 
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        expense={selectedExpense || undefined}
      />
    </motion.div>
  );
}