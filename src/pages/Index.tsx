import { useEffect, useState } from 'react';
import { supabase, InventoryItem, ItemVariant } from '@/lib/supabase';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InventoryCard from '@/components/InventoryCard';
import { useToast } from '@/hooks/use-toast';
import { Package, Search } from 'lucide-react';

const parseNumericValue = (value: string): number | null => {
  const match = value.match(/[\d\.]+/);
  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[0]);
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

type RawInventoryItem = Omit<InventoryItem, 'item_variants'> & {
  item_variants: ItemVariant[] | null;
};

export default function UserDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [storeStatus, setStoreStatus] = useState<boolean | null>(null);
  const [storeStatusLoading, setStoreStatusLoading] = useState(true);
  const [categoryCount, setCategoryCount] = useState(0);
  const [categoryCountLoading, setCategoryCountLoading] = useState(true);
  const { toast } = useToast();

  const fetchStoreStatus = async () => {
    setStoreStatusLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_status')
        .select('is_open')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setStoreStatus(data[0].is_open);
      } else {
        setStoreStatus(true);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load store status',
      });
      setStoreStatus(true);
    } finally {
      setStoreStatusLoading(false);
    }
  };

  const fetchCategoryCount = async (withLoading = false) => {
    if (withLoading) {
      setCategoryCountLoading(true);
    }

    try {
      const { count, error } = await supabase
        .from('category')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;

      setCategoryCount(count ?? 0);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load category count',
      });
    } finally {
      if (withLoading) {
        setCategoryCountLoading(false);
      }
    }
  };

  // Refresh store status periodically to reflect automated changes
  useEffect(() => {
    // Refresh status every 10 minutes to catch automated updates
    const interval = setInterval(() => {
      fetchStoreStatus();
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchStoreStatus();
    fetchCategoryCount(true);

    const inventoryChannel = supabase
      .channel('inventory_changes_public')
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

    const categoryChannel = supabase
      .channel('category_changes_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'category' },
        () => {
          fetchCategoryCount();
        }
      )
      .subscribe();

    const storeChannel = supabase
      .channel('store_status_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_status' },
        (payload) => {
          const next = (payload.new as { is_open?: boolean }) || {};
          if (typeof next.is_open === 'boolean') {
            setStoreStatus(next.is_open);
          }
        }
      )
      .subscribe();

    return () => {
      inventoryChannel.unsubscribe();
      categoryChannel.unsubscribe();
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
    setSelectedVariants((prev) => {
      let changed = false;
      const next: Record<string, string> = { ...prev };
      const itemIds = new Set(items.map((item) => item.id));

      Object.keys(next).forEach((itemId) => {
        if (!itemIds.has(itemId)) {
          delete next[itemId];
          changed = true;
        }
      });

      items.forEach((item) => {
        const sorted = sortVariants(item.item_variants);

        if (sorted.length === 0) {
          if (next[item.id]) {
            delete next[item.id];
            changed = true;
          }
          return;
        }

        const current = next[item.id];
        const exists = current ? sorted.some((variant) => variant.id === current) : false;

        if (!exists) {
          next[item.id] = sorted[0].id;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [items]);

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

      const normalizedItems = ((data || []) as RawInventoryItem[]).map((item) => ({
        ...item,
        item_variants: Array.isArray(item.item_variants) ? item.item_variants : [],
      }));

      const visibleItems = normalizedItems.filter((item) => item.is_visible);
      setItems(visibleItems);
      setFilteredItems(visibleItems);
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

  const handleVariantSelect = (itemId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variantId }));
  };

  const getVariantsForItem = (item: InventoryItem) => {
    if (!item.has_variants) {
      return { sortedVariants: [], selectedVariant: null };
    }

    const sortedVariants = sortVariants(item.item_variants);
    const currentId = selectedVariants[item.id];
    const selectedVariant =
      (currentId && sortedVariants.find((variant) => variant.id === currentId)) ||
      sortedVariants[0] ||
      null;

    return { sortedVariants, selectedVariant };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div
            className={`rounded-[var(--radius)] border p-6 text-card-foreground transition-none ${
              storeStatus === null || storeStatusLoading
                ? 'bg-card border-border shadow-[0_0_24px_rgba(15,23,42,0.25)] dark:shadow-[0_0_24px_rgba(15,23,42,0.2)]'
                : storeStatus
                ? 'bg-emerald-500/12 border-emerald-400/75 shadow-[0_0_48px_rgba(16,185,129,0.5)] dark:shadow-[0_0_42px_rgba(16,185,129,0.45)]'
                : 'bg-destructive/12 border-destructive/75 shadow-[0_0_48px_rgba(239,68,68,0.5)] dark:shadow-[0_0_42px_rgba(239,68,68,0.45)]'
            }`}
          >
            <div className="flex flex-col space-y-2">
              <CardDescription>Store Status</CardDescription>
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full shadow-[0_0_12px_currentColor] ${
                    storeStatus === null || storeStatusLoading
                      ? 'bg-muted-foreground/40 text-muted-foreground/40'
                      : storeStatus
                      ? 'bg-emerald-400 text-emerald-400'
                      : 'bg-destructive text-destructive'
                  }`}
                  aria-hidden="true"
                />
                <CardTitle className="text-3xl">
                  {storeStatus === null || storeStatusLoading
                    ? '—'
                    : storeStatus
                    ? 'Open'
                    : 'Closed'}
                </CardTitle>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-3xl">{loading ? '—' : items.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-3xl">
                {categoryCountLoading ? '—' : categoryCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by item, variant, SKU, category, or description..."
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
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No items match your search' : 'No items in inventory'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const { sortedVariants, selectedVariant } = getVariantsForItem(item);

              return (
                <InventoryCard
                  key={item.id}
                  item={item}
                  sortedVariants={sortedVariants}
                  activeVariant={selectedVariant}
                  onVariantSelect={handleVariantSelect}
                  onVisibilityToggle={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onAddVariant={() => {}}
                  onEditVariant={() => {}}
                  onDeleteVariant={() => {}}
                  showManageActions={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}