import { useEffect, useMemo, useState } from 'react';
import { supabase, InventoryItem, ItemVariant } from '@/lib/supabase';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Search } from 'lucide-react';
import { format } from 'date-fns';

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

export default function UserDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [storeStatus, setStoreStatus] = useState<boolean | null>(null);
  const [storeStatusLoading, setStoreStatusLoading] = useState(true);
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

  useEffect(() => {
    fetchItems();
    fetchStoreStatus();

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

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3 space-y-2">
              <CardDescription>Store Status</CardDescription>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    storeStatus === null || storeStatusLoading
                      ? 'bg-muted-foreground/50'
                      : storeStatus
                      ? 'bg-emerald-500'
                      : 'bg-destructive'
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
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-3xl">{categories.length}</CardTitle>
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
              const isVariantBased = item.has_variants;
              const priceToDisplay = isVariantBased
                ? selectedVariant?.price ?? null
                : item.price ?? null;
              const quantityToDisplay = isVariantBased
                ? selectedVariant?.quantity ?? null
                : item.quantity ?? null;
              const skuLabel = isVariantBased
                ? selectedVariant?.sku ?? null
                : item.sku ?? null;
              const lastUpdatedDisplay = isVariantBased
                ? selectedVariant?.last_updated ?? null
                : item.last_updated ?? null;

              return (
                <Card
                  key={item.id}
                  className="flex h-full flex-col hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {isVariantBased && sortedVariants.length > 0 ? (
                          <Select
                            value={selectedVariant?.id ?? sortedVariants[0].id}
                            onValueChange={(value) => handleVariantSelect(item.id, value)}
                            aria-label={`Select variant for ${item.name}`}
                          >
                            <SelectTrigger className="one-shadow h-7 min-w-[5rem] w-auto rounded-[var(--radius)] border border-border text-xs transition-all duration-200 hover:border-accent hover:bg-accent hover:text-accent-foreground">
                              <SelectValue placeholder="Variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {sortedVariants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {VARIANT_TYPE_LABELS[variant.variant_type]
                                    ? `${variant.variant_value} • ${VARIANT_TYPE_LABELS[variant.variant_type]}`
                                    : variant.variant_value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : isVariantBased ? (
                          <Badge
                            variant="outline"
                            className="one-shadow text-xs font-medium rounded-[var(--radius)]"
                          >
                            No variants yet
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="one-shadow text-xs font-medium rounded-[var(--radius)]"
                          >
                            No Variant
                          </Badge>
                        )}
                      </div>
                      {item.category && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="!mt-0 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {skuLabel ? (
                        <code className="bg-muted px-2 py-1 rounded">
                          {skuLabel}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">SKU unavailable</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-4">
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {isVariantBased && selectedVariant &&
                      selectedVariant.variant_type !== 'price' && (
                        <div className="text-xs text-muted-foreground">
                          Variant Type: {VARIANT_TYPE_LABELS[selectedVariant.variant_type]}
                        </div>
                      )}

                    <div className="mt-auto flex flex-wrap items-start justify-between gap-4 border-t border-border pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Available Quantity</p>
                        <Badge
                          variant={
                            quantityToDisplay !== null && quantityToDisplay === 0
                              ? 'destructive'
                              : 'default'
                          }
                          className="px-3"
                        >
                          {quantityToDisplay ?? '—'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Price</p>
                        <p className="text-sm font-semibold">
                          {priceToDisplay !== null ? formatCurrency(priceToDisplay) : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                        <p className="text-xs font-medium">
                          {lastUpdatedDisplay
                            ? formatVariantTimestamp(lastUpdatedDisplay)
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}