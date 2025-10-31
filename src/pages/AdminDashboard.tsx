import { useEffect, useMemo, useState } from 'react';
import { supabase, InventoryItem, ItemVariant } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, Package, Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import InventoryForm from '@/components/InventoryForm';
import CategoryForm from '@/components/CategoryForm';
import VariantForm from '@/components/VariantForm';

const VARIANT_TYPE_LABELS: Record<ItemVariant['variant_type'], string> = {
  weight: 'Weight',
  pcs: 'Pieces',
  price: 'Price',
  flavor: 'Flavor',
  size: 'Size',
};

type RawInventoryItem = Omit<InventoryItem, 'item_variants'> & {
  item_variants: ItemVariant[] | null;
};

const parseNumericValue = (value: string): number | null => {
  const match = value.match(/[^\d]*(\d+(?:\.\d+)?)/);
  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[1]);
  return Number.isNaN(numeric) ? null : numeric;
};

const sortVariants = (variants: ItemVariant[]) => {
  return [...variants].sort((a, b) => {
    const aValue = parseNumericValue(a.variant_value);
    const bValue = parseNumericValue(b.variant_value);

    if (aValue !== null && bValue !== null && aValue !== bValue) {
      return aValue - bValue;
    }

    if (aValue !== null && bValue === null) {
      return -1;
    }

    if (aValue === null && bValue !== null) {
      return 1;
    }

    if (aValue === null && bValue === null && a.price !== b.price) {
      return a.price - b.price;
    }

    return a.variant_value.localeCompare(b.variant_value, undefined, { sensitivity: 'base' });
  });
};

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
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [variantParentItemId, setVariantParentItemId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [variantDeleteDialogOpen, setVariantDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ItemVariant | null>(null);
  const [variantParentItemName, setVariantParentItemName] = useState<string>('');
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_variants' },
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
        items.filter((item) => {
          const matchesItem =
            item.name.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query));

          const matchesVariant = item.item_variants.some((variant) => {
            const value = variant.variant_value?.toLowerCase() || '';
            const sku = variant.sku?.toLowerCase() || '';
            const type = variant.variant_type?.toLowerCase() || '';

            return (
              value.includes(query) ||
              sku.includes(query) ||
              type.includes(query) ||
              variant.price.toString().includes(query) ||
              variant.quantity.toString().includes(query)
            );
          });

          const matchesSinglePrice = !item.has_variants
            ? item.price.toString().includes(query) || item.quantity.toString().includes(query)
            : false;

          const matchesSku = item.sku ? item.sku.toLowerCase().includes(query) : false;

          return matchesItem || matchesVariant || matchesSinglePrice || matchesSku;
        })
      );
    }
  }, [searchQuery, items]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(
          'id, name, description, category, is_visible, has_variants, price, quantity, sku, last_updated, updated_by, item_variants(*)'
        )
        .order('name', { ascending: true })
        .order('variant_value', { referencedTable: 'item_variants', ascending: true });

      if (error) throw error;
      const typedData = ((data || []) as RawInventoryItem[]).map((item) => ({
        ...item,
        item_variants: Array.isArray(item.item_variants) ? item.item_variants : [],
      }));
      setItems(typedData);
      setFilteredItems(typedData);
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
      await fetchItems();
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
        .update({ is_visible: isVisible, updated_by: profile?.id ?? null })
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

  const openVariantForm = (item: InventoryItem, variant?: ItemVariant | null) => {
    setVariantParentItemId(item.id);
    setVariantParentItemName(item.name);
    setSelectedVariant(variant ?? null);
    setVariantFormOpen(true);
  };

  const openVariantDeleteDialog = (item: InventoryItem, variant: ItemVariant) => {
    setVariantParentItemName(item.name);
    setVariantToDelete(variant);
    setVariantDeleteDialogOpen(true);
  };

  const handleVariantDelete = async () => {
    if (!variantToDelete) return;

    try {
      const { error } = await supabase
        .from('item_variants')
        .delete()
        .eq('id', variantToDelete.id);

      if (error) throw error;

      toast({
        title: 'Variant removed',
        description: 'Variant deleted successfully',
      });
      await fetchItems();
      setVariantDeleteDialogOpen(false);
      setVariantToDelete(null);
      setVariantParentItemName('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete variant',
      });
    }
  };

  const handleVariantFormOpenChange = (open: boolean) => {
    setVariantFormOpen(open);
    if (!open) {
      setVariantParentItemId(null);
      setVariantParentItemName('');
      setSelectedVariant(null);
    }
  };

  const handleVariantDeleteDialogChange = (open: boolean) => {
    setVariantDeleteDialogOpen(open);
    if (!open) {
      setVariantToDelete(null);
      setVariantParentItemName('');
    }
  };

  const totalQuantity = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (!item.has_variants) {
          return sum + (item.quantity ?? 0);
        }

        const variants = Array.isArray(item.item_variants) ? item.item_variants : [];
        const variantTotal = variants.reduce(
          (variantSum, variant) => variantSum + variant.quantity,
          0
        );
        return sum + variantTotal;
      }, 0),
    [items]
  );
  const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value ?? 0);

  const formatVariantTimestamp = (timestamp?: string | null) => {
    if (!timestamp) {
      return '—';
    }

    const utcDate = new Date(timestamp);
    if (Number.isNaN(utcDate.getTime())) {
      return '—';
    }

    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);
    return format(istDate, 'MMM d, yyyy • h:mm a');
  };

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
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage products and their variants</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Open quick actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setCategoryFormOpen(true)}>
                      Add Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => fetchItems()}>
                      Refresh Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setFormOpen(true);
                  }}
                  className="w-full sm:w-auto"
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
                placeholder="Search by item, variant, SKU, or description..."
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
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Category</TableHead>
                      <TableHead className="text-center">Default Variant</TableHead>
                      <TableHead className="text-center">Variants</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Visibility</TableHead>
                      <TableHead className="text-center">Last Updated</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const sortedVariants = item.has_variants ? sortVariants(item.item_variants) : [];
                      const defaultVariant = sortedVariants[0];
                      const displayPrice = item.has_variants
                        ? defaultVariant?.price ?? null
                        : item.price ?? null;
                      const displayQuantity = item.has_variants
                        ? defaultVariant?.quantity ?? null
                        : item.quantity ?? null;

                      return (
                        <TableRow
                          key={item.id}
                          className={!item.is_visible ? 'bg-muted/40' : undefined}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.category ? (
                              <Badge variant="secondary">{item.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.has_variants ? (
                              defaultVariant ? (
                                <div className="space-y-1">
                                  <span className="font-medium">{defaultVariant.variant_value}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    {VARIANT_TYPE_LABELS[defaultVariant.variant_type]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No variants yet</span>
                              )
                            ) : (
                              <Badge variant="outline">Variants disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {item.has_variants ? sortedVariants.length : '—'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {displayPrice !== null ? (
                              <span className="font-medium">{formatCurrency(displayPrice)}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {displayQuantity !== null ? (
                              <Badge variant={displayQuantity === 0 ? 'destructive' : 'default'}>
                                {displayQuantity}
                              </Badge>
                            ) : (
                              <Badge variant="outline">—</Badge>
                            )}
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
                            {item.has_variants && defaultVariant
                              ? formatVariantTimestamp(defaultVariant.last_updated)
                              : '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                  Manage
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Item</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleEdit(item)}>
                                  Edit Item
                                </DropdownMenuItem>
                                {item.has_variants ? (
                                  <>
                                    <DropdownMenuItem onSelect={() => openVariantForm(item)}>
                                      Add Variant
                                    </DropdownMenuItem>
                                    {sortedVariants.length > 0 && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Variants</DropdownMenuLabel>
                                        {sortedVariants.map((variant) => (
                                          <DropdownMenuSub key={variant.id}>
                                            <DropdownMenuSubTrigger>
                                              {variant.variant_value}
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                              <DropdownMenuItem
                                                onSelect={() => openVariantForm(item, variant)}
                                              >
                                                Edit Variant
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onSelect={() => openVariantDeleteDialog(item, variant)}
                                              >
                                                Delete Variant
                                              </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                          </DropdownMenuSub>
                                        ))}
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <DropdownMenuItem disabled className="opacity-75 cursor-not-allowed">
                                    Enable variants from item settings
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() => openDeleteDialog(item)}
                                >
                                  Delete Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      <VariantForm
        open={variantFormOpen}
        onOpenChange={handleVariantFormOpenChange}
        itemId={variantParentItemId}
        itemName={variantParentItemName}
        variant={selectedVariant}
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

      <AlertDialog open={variantDeleteDialogOpen} onOpenChange={handleVariantDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{variantToDelete?.variant_value}" from "{variantParentItemName}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVariantDelete}>
              Delete Variant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}