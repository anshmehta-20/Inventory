import { InventoryItem, ItemVariant } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';

const VARIANT_TYPE_LABELS: Record<ItemVariant['variant_type'], string> = {
  weight: 'Weight',
  pcs: 'Pieces',
  price: 'Price',
  flavor: 'Flavor',
  size: 'Size',
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

interface InventoryCardProps {
  item: InventoryItem;
  sortedVariants: ItemVariant[];
  activeVariant: ItemVariant | null;
  onVariantSelect: (itemId: string, variantId: string) => void;
  onVisibilityToggle: (item: InventoryItem, checked: boolean) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddVariant: (item: InventoryItem) => void;
  onEditVariant: (item: InventoryItem, variant: ItemVariant) => void;
  onDeleteVariant: (item: InventoryItem, variant: ItemVariant) => void;
  showManageActions?: boolean;
}

export default function InventoryCard({
  item,
  sortedVariants,
  activeVariant,
  onVariantSelect,
  onVisibilityToggle,
  onEdit,
  onDelete,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  showManageActions = true,
}: InventoryCardProps) {
  const isVariantBased = item.has_variants;
  const displayPrice = isVariantBased
    ? activeVariant?.price ?? null
    : item.price ?? null;
  const displayQuantity = isVariantBased
    ? activeVariant?.quantity ?? null
    : item.quantity ?? null;
  const lastUpdatedValue = isVariantBased
    ? activeVariant?.last_updated ?? null
    : item.last_updated;
  const skuLabel = isVariantBased
    ? activeVariant?.sku ?? null
    : item.sku ?? null;

  return (
    <Card
      className={`flex h-full flex-col hover:shadow-lg transition-shadow ${!item.is_visible ? 'bg-muted/40' : ''}`}
    >
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {item.category && (
            <Badge variant="secondary" className="ml-auto">
              {item.category}
            </Badge>
          )}
        </div>
        <div className="!mt-0 flex flex-wrap items-center gap-2">
          {isVariantBased && sortedVariants.length > 0 ? (
            <Select
              value={activeVariant?.id ?? sortedVariants[0].id}
              onValueChange={(value) => onVariantSelect(item.id, value)}
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
          {skuLabel ? (
            <code className="bg-muted px-2 py-1 rounded-[calc(var(--radius)*0.5)] text-xs text-muted-foreground ml-auto text-center min-w-[80px] inline-block">
              {skuLabel}
            </code>
          ) : (
            <span className="text-xs text-muted-foreground ml-auto text-center min-w-[80px] inline-block">
              SKU unavailable
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4 pb-4">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-auto space-y-3 border-t border-border dark:border-[#080808] pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1.5">Available Quantity</p>
              <Badge
                variant={
                  displayQuantity !== null && displayQuantity === 0
                    ? 'destructive'
                    : 'default'
                }
                className="px-3 py-1"
              >
                {displayQuantity ?? '—'}
              </Badge>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground mb-1.5">Price</p>
              <p className="text-base font-semibold">
                {displayPrice !== null ? formatCurrency(displayPrice) : '—'}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t border-border/50 dark:border-[#080808]/50">
            <span className="inline-block">Last Updated:</span>{' '}
            <span className="font-medium">
              {lastUpdatedValue ? formatVariantTimestamp(lastUpdatedValue) : '—'}
            </span>
          </div>
        </div>

        {showManageActions && (
          <div className="flex flex-col gap-3 border-t border-border dark:border-[#080808] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Visibility</span>
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  checked={item.is_visible}
                  onCheckedChange={(checked) => onVisibilityToggle(item, checked)}
                  aria-label={`Toggle visibility for ${item.name}`}
                />
                <span className="text-xs text-muted-foreground">
                  {item.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-[var(--radius)] border-border"
                >
                  Manage
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Item</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => onEdit(item)}>
                  Edit Item
                </DropdownMenuItem>
                {item.has_variants ? (
                  <>
                    <DropdownMenuItem onSelect={() => onAddVariant(item)}>
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
                                onSelect={() => onEditVariant(item, variant)}
                              >
                                Edit Variant
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => onDeleteVariant(item, variant)}
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
                  onSelect={() => onDelete(item)}
                >
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
