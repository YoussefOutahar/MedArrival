// ReceiptItem.tsx
import React from 'react';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, Package, Calendar, Banknote, Hash, CircleDollarSign, Box } from 'lucide-react';
import { ProductDTO } from '@/models/ProductDTO';
import { ReceiptItemForm } from '@/types/receipt';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('receipts');

    const renderField = (
        icon: React.ReactNode,
        label: string,
        field: keyof ReceiptItemForm,
        type: string = 'text',
        required: boolean = false
    ) => (
        <div className="space-y-2">
            <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    {icon}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </div>
            </Label.Root>
            <Input
                type={type}
                value={
                    field === 'product'
                        ? item[field]?.name || ''
                        : (item[field]?.toString() || '')
                }
                onChange={(e) => {
                    let value: string | number | null = e.target.value;
                    if (type === 'number') {
                        value = e.target.value ? Number(e.target.value) : null;
                    }
                    onItemChange(index, field, value);
                }}
                className="h-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
        </div>
    );

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                        {t('receipts.addReceipt.items.item.title', { number: index + 1 })}
                    </span>
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
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                {t('receipts.addReceipt.items.item.fields.product.label')}
                                <span className="text-red-500">*</span>
                            </div>
                        </Label.Root>
                        <Select.Root
                            value={item.product?.id?.toString()}
                            onValueChange={(value) => {
                                const product = products.find(p => p.id === Number(value));
                                onItemChange(index, 'product', product);
                            }}
                        >
                            <Select.Trigger className="w-full flex h-10 items-center justify-between rounded-md 
                                border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 
                                text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 
                                focus:ring-primary-500 dark:focus:ring-primary-400">
                                <Select.Value placeholder={t('receipts.addReceipt.items.item.fields.product.placeholder')}>
                                    {item.product?.name || t('receipts.addReceipt.items.item.fields.product.placeholder')}
                                </Select.Value>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-md 
                                    shadow-lg border border-gray-200 dark:border-gray-700">
                                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] 
                                        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
                                    <Select.Viewport className="p-1">
                                        {products.map(product => (
                                            <Select.Item
                                                key={product.id}
                                                value={product.id.toString()}
                                                className="relative flex h-9 items-center px-8 rounded-sm text-sm 
                                                    text-gray-700 dark:text-gray-300 hover:bg-primary-50 
                                                    dark:hover:bg-primary-900/20 cursor-pointer outline-none"
                                            >
                                                <Select.ItemText>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{product.name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {t('receipts.addReceipt.items.item.fields.product.available', {
                                                                count: product.availableQuantity
                                                            })}
                                                        </span>
                                                    </div>
                                                </Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] 
                                        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300" />
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>

                    <div className="col-span-3">
                        {renderField(
                            <CircleDollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.unitPrice.label'),
                            'unitPrice',
                            'number',
                            true
                        )}
                    </div>

                    <div className="col-span-3">
                        {renderField(
                            <Box className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.quantity.label'),
                            'quantity',
                            'number',
                            true
                        )}
                    </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                        {renderField(
                            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.articleCode.label'),
                            'articleCode'
                        )}
                    </div>
                    <div className="col-span-4">
                        {renderField(
                            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.lotNumber.label'),
                            'lotNumber'
                        )}
                    </div>
                    <div className="col-span-4">
                        {renderField(
                            <Box className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.unit.label'),
                            'unit'
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        {renderField(
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.calibrationDate.label'),
                            'calibrationDate',
                            'date'
                        )}
                    </div>
                    <div className="col-span-6">
                        {renderField(
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                            t('receipts.addReceipt.items.item.fields.expirationDate.label'),
                            'expirationDate',
                            'date'
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label.Root className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('receipts.addReceipt.items.item.fields.description.label')}
                    </Label.Root>
                    <Textarea
                        value={item.description || ''}
                        onChange={(e) => onItemChange(index, 'description', e.target.value)}
                        rows={2}
                        className="resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Subtotal */}
                <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Banknote className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('receipts.addReceipt.items.item.subtotal')}:
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        MAD {item.subtotal.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ReceiptItem;