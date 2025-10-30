import { useEffect, useState } from 'react';
import { supabase, InventoryItem } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Package, Search, Tag } from 'lucide-react';
import { format } from 'date-fns';
import InventoryForm from '@/components/InventoryForm';
import CategoryForm from '@/components/CategoryForm';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();

    const subscription = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (typeof item.price === 'number' && item.price.toString().includes(query))
        )
      );
    }
  }, [searchQuery, items]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch items',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete item',
      });
    }
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleVisibilityToggle = async (item: InventoryItem, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ is_visible: isVisible })
        .eq('id', item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((existing) =>
          existing.id === item.id ? { ...existing, is_visible: isVisible } : existing
        )
      );

      toast({
        title: 'Visibility updated',
        description: `${item.name} is now ${isVisible ? 'visible' : 'hidden'} to customers.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update visibility',
      });
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Shreeji Foods" 
        subtitle={`${profile?.email}${profile?.isAdmin ? ' Manage your Inventory here' : ''}`}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-3xl">{items.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Quantity</CardDescription>
              <CardTitle className="text-3xl">{totalQuantity}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-3xl">
                {new Set(items.map((i) => i.category).filter(Boolean)).size}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Items</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCategoryFormOpen(true)}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, SKU, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading inventory...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No items match your search' : 'No items in inventory'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedItem(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-border dark:border-[#080808]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">SKU</TableHead>
                      <TableHead className="text-center">Category</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Visibility</TableHead>
                      <TableHead className="text-center">Last Updated</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className={!item.is_visible ? 'bg-muted/40' : undefined}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div>{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {item.sku}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.category ? (
                            <Badge variant="secondary">{item.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{formatCurrency(item.price)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={item.quantity === 0 ? 'destructive' : 'default'}
                          >
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={item.is_visible}
                              onCheckedChange={(checked) => handleVisibilityToggle(item, checked)}
                              aria-label={`Toggle visibility for ${item.name}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {item.last_updated
                            ? (() => {
                                const utcDate = new Date(item.last_updated);
                                const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                                return format(istDate, 'MMM d, yyyy • h:mm a');
                              })()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(item)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InventoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        item={selectedItem}
        onSuccess={fetchItems}
      />

      <CategoryForm
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        onSuccess={fetchItems}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.name}". This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}