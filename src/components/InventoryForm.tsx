import { useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, InventoryItem } from '@/lib/supabase';
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
  FormDescription,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().nullable().default(null),
  is_visible: z.boolean().default(true),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSuccess: () => void;
}

export default function InventoryForm({
  open,
  onOpenChange,
  item,
  onSuccess,
}: InventoryFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      sku: '',
      category: null,
      is_visible: true,
    },
  });

  // Update form values when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? '',
        quantity: item.quantity,
        price: item.price ?? 0,
        sku: item.sku,
        category: item.category ?? null,
        is_visible: item.is_visible,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        sku: '',
        category: null,
        is_visible: true,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      setLoading(true);

      // Convert empty string category to null
      const submitData = {
        ...data,
        category: !data.category || data.category.trim() === '' ? null : data.category,
      };

      if (item) {
        const { error } = await supabase
          .from('inventory_items')
          .update(submitData)
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        const { error } = await supabase.from('inventory_items').insert([submitData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save item',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Update the inventory item details below.'
              : 'Add a new item to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sweets"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius)] border border-border bg-card px-4 py-3">
                  <div className="space-y-0.5">
                    <FormLabel>Visible to customers</FormLabel>
                    <FormDescription>
                      Hide an item to keep it available for admins only.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Toggle customer visibility"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {loading ? 'Saving...' : item ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
