import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CatalogModal } from "@/components/modals/catalog-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CatalogItem } from "@shared/schema";

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: catalogItems = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["/catalog"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.deleteCatalogItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/catalog"] });
      toast({
        title: "Succès",
        description: "Article supprimé avec succès",
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

  const filteredItems = catalogItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.description || "").toLowerCase().includes(searchLower) ||
      (item.category || "").toLowerCase().includes(searchLower)
    );
  });

  const categories = Array.from(new Set(catalogItems.map(item => item.category).filter(Boolean)));

  const handleEdit = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Catalogue"
        subtitle={`${catalogItems.length} article${catalogItems.length > 1 ? 's' : ''} • ${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
        action={
          <Button onClick={handleNewItem} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary text-primary">
              Toutes ({catalogItems.length})
            </Badge>
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="border-slate-600">
                {category} ({catalogItems.filter(item => item.category === category).length})
              </Badge>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {catalogItems.length === 0 ? "Aucun article dans le catalogue" : "Aucun article trouvé"}
            </h3>
            <p className="text-slate-500">
              {catalogItems.length === 0 
                ? "Commencez par ajouter vos premiers produits et services."
                : "Essayez de modifier votre recherche."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                      {item.category && (
                        <Badge variant="secondary" className="mt-2">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {item.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {Number(item.unitPrice).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </p>
                        <p className="text-sm text-slate-400">
                          par {item.unit || 'unité'}
                        </p>
                      </div>
                      
                      {item.vatRate && (
                        <Badge variant="outline" className="text-xs">
                          TVA {Number(item.vatRate)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Catalog Modal */}
      <CatalogModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
      />
    </div>
  );
}