import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptItem } from './ReceiptItem';
import { ProductDTO } from '@/models/ProductDTO';
import { ReceiptItemForm } from '@/types/receipt';

interface ReceiptItemsProps {
    items: ReceiptItemForm[];
    products: ProductDTO[];
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onItemChange: (index: number, field: keyof ReceiptItemForm, value: any) => void;
}

export const ReceiptItems: React.FC<ReceiptItemsProps> = ({
    items,
    products,
    onAddItem,
    onRemoveItem,
    onItemChange
}) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    <CardTitle>Items</CardTitle>
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {items.length} items
                    </span>
                </div>
                <Button
                    type="button"
                    onClick={onAddItem}
                    variant="outline"
                    className="flex items-center gap-2 border-dashed"
                >
                    <Plus className="h-4 w-4" />
                    Add Item
                </Button>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Package className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by adding a new item to your receipt
                        </p>
                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={onAddItem}
                                variant="outline"
                                className="flex items-center gap-2 mx-auto border-dashed"
                            >
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <ReceiptItem
                                key={index}
                                item={item}
                                index={index}
                                products={products}
                                onItemChange={onItemChange}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                onClick={onAddItem}
                                variant="outline"
                                className="w-full flex items-center gap-2 border-dashed"
                            >
                                <Plus className="h-4 w-4" />
                                Add Another Item
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};