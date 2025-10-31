import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase, ItemVariant } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const variantSchema = z.object({
  variant_type: z.enum(['weight', 'pcs', 'price', 'flavor', 'size']),
  variant_value: z.string().min(1, 'Variant value is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface VariantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  itemName?: string;
  variant?: ItemVariant | null;
  onSuccess: () => void;
}

export default function VariantForm({
  open,
  onOpenChange,
  itemId,
  itemName,
  variant,
  onSuccess,
}: VariantFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      variant_type: 'weight',
      variant_value: '',
      sku: '',
      price: 0,
      quantity: 0,
    },
  });

  useEffect(() => {
    if (variant) {
      form.reset({
        variant_type: variant.variant_type,
        variant_value: variant.variant_value,
        sku: variant.sku,
        price: variant.price,
        quantity: variant.quantity,
      });
    } else {
      form.reset({
        variant_type: 'weight',
        variant_value: '',
        sku: '',
        price: 0,
        quantity: 0,
      });
    }
  }, [variant, form]);

  const onSubmit = async (data: VariantFormData) => {
    if (!itemId) {
      toast({
        variant: 'destructive',
        title: 'Missing item',
        description: 'Please select an item before managing variants.',
      });
      return;
    }

    try {
      setLoading(true);

      if (variant) {
        const { error } = await supabase
          .from('item_variants')
          .update({
            variant_type: data.variant_type,
            variant_value: data.variant_value,
            sku: data.sku,
            price: data.price,
            quantity: data.quantity,
          })
          .eq('id', variant.id);

        if (error) throw error;

        toast({
          title: 'Variant updated',
          description: 'The variant has been updated successfully.',
        });
      } else {
        const { error } = await supabase.from('item_variants').insert([
          {
            item_id: itemId,
            variant_type: data.variant_type,
            variant_value: data.variant_value,
            sku: data.sku,
            price: data.price,
            quantity: data.quantity,
          },
        ]);

        if (error) throw error;

        toast({
          title: 'Variant created',
          description: 'A new variant has been added.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save variant.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{variant ? 'Edit Variant' : 'Add Variant'}</DialogTitle>
          <DialogDescription>
            {variant
              ? `Update the variant details for ${itemName ?? 'this item'}.`
              : `Add a new variant option for ${itemName ?? 'this item'}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="variant_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="price">Price Option</SelectItem>
                        <SelectItem value="flavor">Flavor</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variant_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 250g, 12 pcs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
