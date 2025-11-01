import { useEffect, useMemo, useState } from 'react';
import { supabase, InventoryItem, ItemVariant } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { Plus, Package, Search, MoreVertical, CircleMinus, RefreshCw } from 'lucide-react';
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

type CategoryOption = {
  id: string;
  name: string;
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
  const [selectedVariantsMap, setSelectedVariantsMap] = useState<Record<string, string>>({});
  const [storeStatus, setStoreStatus] = useState<boolean | null>(null);
  const [storeStatusId, setStoreStatusId] = useState<string | null>(null);
  const [storeStatusLoading, setStoreStatusLoading] = useState(true);
  const [updatingStoreStatus, setUpdatingStoreStatus] = useState(false);
  const [removeCategoryOpen, setRemoveCategoryOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [removingCategory, setRemovingCategory] = useState(false);
  const { toast } = useToast();

  const fetchStoreStatus = async () => {
    setStoreStatusLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_status')
        .select('id, is_open')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setStoreStatusId(data[0].id);
        setStoreStatus(data[0].is_open);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('store_status')
          .insert({ is_open: true, updated_by: profile?.id ?? null })
          .select('id, is_open')
          .single();

        if (insertError) throw insertError;

        if (inserted) {
          setStoreStatusId(inserted.id);
          setStoreStatus(inserted.is_open);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load store status',
      });
    } finally {
      setStoreStatusLoading(false);
    }
  };

  const handleStoreStatusToggle = async (nextState: boolean) => {
    const previousState = storeStatus ?? false;
    setStoreStatus(nextState);
    setUpdatingStoreStatus(true);

    try {
      if (storeStatusId) {
        const { error } = await supabase
          .from('store_status')
          .update({ is_open: nextState, updated_by: profile?.id ?? null })
          .eq('id', storeStatusId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('store_status')
          .insert({ is_open: nextState, updated_by: profile?.id ?? null })
          .select('id, is_open')
          .single();

        if (error) throw error;

        if (data) {
          setStoreStatusId(data.id);
          setStoreStatus(data.is_open);
        }
      }

      toast({
        title: 'Store status updated',
        description: `Store is now ${nextState ? 'open' : 'closed'}.`,
      });
    } catch (error: any) {
      setStoreStatus(previousState);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update store status',
      });
    } finally {
      setUpdatingStoreStatus(false);
    }
  };

  const handleVariantSelect = (itemId: string, variantId: string) => {
    setSelectedVariantsMap((prev) => ({ ...prev, [itemId]: variantId }));
  };

  const getVariantsForItem = (item: InventoryItem) => {
    if (!item.has_variants) {
      return { sortedVariants: [], selectedVariant: null };
    }

    const sortedVariants = sortVariants(item.item_variants);
    const currentId = selectedVariantsMap[item.id];
    const selectedVariant =
      (currentId && sortedVariants.find((variant) => variant.id === currentId)) ||
      sortedVariants[0] ||
      null;

    return { sortedVariants, selectedVariant };
  };

  useEffect(() => {
    fetchItems();
    fetchStoreStatus();

    const inventoryChannel = supabase
      .channel('inventory_changes_admin')
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

    const storeChannel = supabase
      .channel('store_status_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_status' },
        (payload) => {
          const next = (payload.new as { id?: string; is_open?: boolean }) || {};
          if (typeof next.is_open === 'boolean') {
            setStoreStatus(next.is_open);
          }
          if (next.id) {
            setStoreStatusId(next.id);
          }
        }
      )
      .subscribe();

    return () => {
      inventoryChannel.unsubscribe();
      storeChannel.unsubscribe();
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

          const priceMatches =
            item.price !== null && item.price !== undefined &&
            item.price.toString().includes(query);

          const quantityMatches =
            item.quantity !== null && item.quantity !== undefined &&
            item.quantity.toString().includes(query);

          const matchesSinglePrice = !item.has_variants ? priceMatches || quantityMatches : false;

          const matchesSku = item.sku ? item.sku.toLowerCase().includes(query) : false;

          return matchesItem || matchesVariant || matchesSinglePrice || matchesSku;
        })
      );
    }
  }, [searchQuery, items]);

  useEffect(() => {
    setSelectedVariantsMap((prev) => {
      let hasChanges = false;
      const next: Record<string, string> = { ...prev };
      const itemIds = new Set(items.map((item) => item.id));

      Object.keys(next).forEach((itemId) => {
        if (!itemIds.has(itemId)) {
          delete next[itemId];
          hasChanges = true;
        }
      });

      items.forEach((item) => {
        if (!item.has_variants) {
          if (next[item.id]) {
            delete next[item.id];
            hasChanges = true;
          }
          return;
        }

        const sorted = sortVariants(item.item_variants);

        if (sorted.length === 0) {
          if (next[item.id]) {
            delete next[item.id];
            hasChanges = true;
          }
          return;
        }

        const current = next[item.id];
        const exists = current ? sorted.some((variant) => variant.id === current) : false;

        if (!exists) {
          next[item.id] = sorted[0].id;
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, [items]);

  useEffect(() => {
    if (!removeCategoryOpen) {
      setAvailableCategories([]);
      setSelectedCategoryId('');
      setCategoriesLoading(false);
      setRemovingCategory(false);
      return;
    }

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const { data, error } = await supabase
          .from('category')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;

        const categoryList = (data ?? []) as CategoryOption[];
        setAvailableCategories(categoryList);
        if (categoryList.length > 0) {
          setSelectedCategoryId(categoryList[0].id);
        } else {
          setSelectedCategoryId('');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load categories.',
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [removeCategoryOpen, toast]);

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

      await fetchItems();

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

  const handleRemoveCategory = async () => {
    if (!selectedCategoryId) {
      toast({
        variant: 'destructive',
        title: 'Select a category',
        description: 'Choose a category to remove.',
      });
      return;
    }

    const categoryDetails = availableCategories.find(
      (category) => category.id === selectedCategoryId
    );

    try {
      setRemovingCategory(true);

      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', selectedCategoryId);

      if (error) throw error;

      toast({
        title: 'Category removed',
        description: categoryDetails
          ? `"${categoryDetails.name}" has been deleted.`
          : 'Category deleted successfully.',
      });

      setRemoveCategoryOpen(false);
      await fetchItems();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to remove category.',
      });
    } finally {
      setRemovingCategory(false);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3 space-y-3">
              <CardDescription>Store Status</CardDescription>
              <div className="flex items-center justify-between gap-3">
                <CardTitle
                  className={`text-3xl transition-colors ${
                    storeStatus === null
                      ? 'text-foreground'
                      : storeStatus
                      ? 'text-emerald-500'
                      : 'text-destructive'
                  }`}
                >
                  {storeStatus === null ? '—' : storeStatus ? 'Open' : 'Closed'}
                </CardTitle>
                <Switch
                  size="default"
                  checked={Boolean(storeStatus)}
                  onCheckedChange={handleStoreStatusToggle}
                  disabled={storeStatusLoading || updatingStoreStatus}
                  aria-label="Toggle store status"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Controls what customers see on the storefront.
              </p>
            </CardHeader>
          </Card>
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
                      className="border-border"
                      aria-label="Open quick actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setCategoryFormOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRemoveCategoryOpen(true)}>
                      <CircleMinus className="mr-2 h-4 w-4" />
                      Remove Category
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => fetchItems()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setFormOpen(true);
                  }}
                  className="w-full rounded-[var(--radius)] border border-border sm:w-auto"
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
                  className="mt-4 border-border"
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
                      <TableHead className="text-center">SKU</TableHead>
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
                      const { sortedVariants, selectedVariant: activeVariant } = getVariantsForItem(item);
                      const displayPrice = item.has_variants
                        ? activeVariant?.price ?? null
                        : item.price ?? null;
                      const displayQuantity = item.has_variants
                        ? activeVariant?.quantity ?? null
                        : item.quantity ?? null;
                      const lastUpdatedValue = item.has_variants
                        ? activeVariant?.last_updated ?? null
                        : item.last_updated;
                      const skuLabel = item.has_variants
                        ? activeVariant?.sku ?? null
                        : item.sku ?? null;
                      const variantMeta =
                        item.has_variants && activeVariant
                          ? `${activeVariant.variant_value} • ${VARIANT_TYPE_LABELS[activeVariant.variant_type]}`
                          : null;

                      return (
                        <TableRow
                          key={item.id}
                          className={!item.is_visible ? 'bg-muted/40' : undefined}
                        >
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {item.has_variants ? (
                                  sortedVariants.length > 0 ? (
                                    <Select
                                      value={activeVariant?.id ?? sortedVariants[0].id}
                                      onValueChange={(value) => handleVariantSelect(item.id, value)}
                                      aria-label={`Select variant for ${item.name}`}
                                    >
                                      <SelectTrigger className="one-shadow h-7 min-w-[5rem] w-auto rounded-[var(--radius)] border border-border text-xs transition-all duration-200 hover:border-accent hover:bg-accent hover:text-accent-foreground">
                                        <SelectValue placeholder="Variant" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sortedVariants.map((variant) => {
                                          const variantLabel = VARIANT_TYPE_LABELS[variant.variant_type]
                                            ? `${variant.variant_value} • ${VARIANT_TYPE_LABELS[variant.variant_type]}`
                                            : variant.variant_value;

                                          return (
                                            <SelectItem key={variant.id} value={variant.id}>
                                              {variantLabel}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="one-shadow text-xs font-medium rounded-[var(--radius)]"
                                    >
                                      No variants yet
                                    </Badge>
                                  )
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="one-shadow text-xs font-medium rounded-[var(--radius)]"
                                  >
                                    No Variant
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">
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
                              sortedVariants.length > 0 && activeVariant ? (
                                <div className="space-y-1">
                                  {skuLabel ? (
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{skuLabel}</code>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No SKU</span>
                                  )}
                                  {variantMeta && (
                                    <span className="block text-xs text-muted-foreground">{variantMeta}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No variants yet</span>
                              )
                            ) : (
                              <div className="space-y-1">
                                {skuLabel ? (
                                  <code className="text-xs bg-muted px-2 py-1 rounded">{skuLabel}</code>
                                ) : (
                                  <span className="text-sm text-muted-foreground">SKU not set</span>
                                )}
                              </div>
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
                                size="sm"
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
                            {lastUpdatedValue ? formatVariantTimestamp(lastUpdatedValue) : '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full rounded-[var(--radius)] border-border sm:w-auto"
                                >
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

      <Dialog open={removeCategoryOpen} onOpenChange={setRemoveCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Category</DialogTitle>
            <DialogDescription>
              Select a category to delete. Any items assigned to it will have their category cleared.
            </DialogDescription>
          </DialogHeader>
          {categoriesLoading ? (
            <div className="py-4 text-sm text-muted-foreground">Loading categories...</div>
          ) : availableCategories.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">
              No categories available to remove.
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="category-to-remove" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={selectedCategoryId || undefined}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger
                  id="category-to-remove"
                  className="border border-border"
                  disabled={removingCategory}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setRemoveCategoryOpen(false)}
              disabled={removingCategory}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveCategory}
              disabled={
                removingCategory ||
                !selectedCategoryId ||
                availableCategories.length === 0
              }
            >
              {removingCategory ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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