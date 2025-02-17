// ReceiptItems.tsx
import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptItem } from './ReceiptItem';
import { ProductDTO } from '@/models/ProductDTO';
import { ReceiptItemForm } from '@/types/receipt';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('receipts');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-gray-900 dark:text-white">{t('receipts.addReceipt.items.title')}</CardTitle>
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 
                                 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('receipts.addReceipt.items.countLabel', { count: items.length })}
                    </span>
                </div>
                <Button
                    type="button"
                    onClick={onAddItem}
                    variant="outline"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                             bg-primary-600 hover:bg-primary-700 text-white
                             transition-colors duration-150 ease-in-out"
                >
                    <Plus className="h-4 w-4" />
                    {t('receipts.addReceipt.items.addButton')}
                </Button>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg 
                                 border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Package className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            {t('receipts.addReceipt.items.emptyState.title')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('receipts.addReceipt.items.emptyState.description')}
                        </p>
                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={onAddItem}
                                variant="outline"
                                className="flex items-center gap-2 mx-auto border-dashed text-gray-900 dark:text-white"
                            >
                                <Plus className="h-4 w-4" />
                                {t('receipts.addReceipt.items.addButton')}
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
                                className="w-full flex items-center gap-2 border-dashed text-gray-900 dark:text-white"
                            >
                                <Plus className="h-4 w-4" />
                                {t('receipts.addReceipt.items.addAnotherButton')}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReceiptItems;