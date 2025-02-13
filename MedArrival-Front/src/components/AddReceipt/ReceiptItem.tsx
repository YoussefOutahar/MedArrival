import React from 'react';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, Package, Calendar, Banknote } from 'lucide-react';
import { ProductDTO } from '@/models/ProductDTO';
import { ReceiptItemForm } from '@/types/receipt';

interface ReceiptItemProps {
    item: ReceiptItemForm;
    index: number;
    products: ProductDTO[];
    onItemChange: (index: number, field: keyof ReceiptItemForm, value: any) => void;
    onRemoveItem: (index: number) => void;
}

export const ReceiptItem: React.FC<ReceiptItemProps> = ({
    item,
    index,
    products,
    onItemChange,
    onRemoveItem
}) => {
    return (
        <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Item #{index + 1}</span>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4 space-y-6">
                {/* Product Selection & Basic Info */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Product *
                        </Label.Root>
                        <Select.Root
                            value={item.product?.id?.toString()}
                            onValueChange={(value) => {
                                const product = products.find(p => p.id === Number(value));
                                onItemChange(index, 'product', product);
                            }}
                        >
                            <Select.Trigger className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900">
                                <Select.Value placeholder="Select a product">
                                    {item.product?.name || 'Select a product'}
                                </Select.Value>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content className="overflow-hidden bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-default" />
                                    <Select.Viewport className="p-1">
                                        {products.map(product => (
                                            <Select.Item
                                                key={product.id}
                                                value={product.id.toString()}
                                                className="relative flex h-9 items-center px-8 rounded-sm text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer outline-none"
                                            >
                                                <Select.ItemText>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{product.name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Available: {product.availableQuantity}
                                                        </span>
                                                    </div>
                                                </Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-default" />
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>

                    <div className="col-span-3">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit Price *
                        </Label.Root>
                        <div className="relative">
                            <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => onItemChange(index, 'unitPrice', Number(e.target.value))}
                                min="0"
                                step="0.01"
                                className="text-right pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                MAD
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Article Code
                        </Label.Root>
                        <Input
                            value={item.articleCode || ''}
                            onChange={(e) => onItemChange(index, 'articleCode', e.target.value)}
                        />
                    </div>

                    <div className="col-span-4">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lot Number
                        </Label.Root>
                        <Input
                            value={item.lotNumber || ''}
                            onChange={(e) => onItemChange(index, 'lotNumber', e.target.value)}
                        />
                    </div>

                    <div className="col-span-4">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit
                        </Label.Root>
                        <Input
                            value={item.unit || ''}
                            onChange={(e) => onItemChange(index, 'unit', e.target.value)}
                        />
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Calibration Date
                            </div>
                        </Label.Root>
                        <Input
                            type="date"
                            value={item.calibrationDate || ''}
                            onChange={(e) => onItemChange(index, 'calibrationDate', e.target.value)}
                        />
                    </div>

                    <div className="col-span-6">
                        <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Expiration Date
                            </div>
                        </Label.Root>
                        <Input
                            type="date"
                            value={item.expirationDate || ''}
                            onChange={(e) => onItemChange(index, 'expirationDate', e.target.value)}
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </Label.Root>
                    <Textarea
                        value={item.description || ''}
                        onChange={(e) => onItemChange(index, 'description', e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                </div>

                {/* Subtotal */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Banknote className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        €{item.subtotal.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};