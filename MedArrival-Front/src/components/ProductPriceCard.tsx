import { useState } from 'react';
import { ButtonUI } from '@/components/ui/button-ui';
import { Input } from '@/components/ui/input';
import { ProductDTO } from '@/models/ProductDTO';
import { PriceComponentType } from '@/models/PriceComponentDTO';
import { ArrowPathIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ProductPriceCardProps {
    product: ProductDTO;
    priceTypes: PriceComponentType[];
    priceComponentLabels: Record<PriceComponentType, string>;
    editingPrices: Record<string, number>;
    setEditingPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    handlePriceUpdate: (productId: number, componentType: PriceComponentType) => void;
    updatingPrice: Record<string, boolean>;
    handleRevertToDefault: (productId: number) => void;
    t: (key: string) => string;
}

export const ProductPriceCard = ({
    product,
    priceTypes,
    priceComponentLabels,
    editingPrices,
    setEditingPrices,
    handlePriceUpdate,
    updatingPrice,
    handleRevertToDefault,
    t
}: ProductPriceCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                </div>
                <div className="flex gap-2">
                    <ButtonUI
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="outline"
                        size="sm"
                    >
                        {isExpanded ?
                            <ChevronUpIcon className="h-4 w-4" /> :
                            <ChevronDownIcon className="h-4 w-4" />
                        }
                    </ButtonUI>
                    <ButtonUI
                        onClick={() => handleRevertToDefault(product.id!)}
                        disabled={updatingPrice[`${product.id}-all`]}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        {t('products.actions.revertToDefault')}
                    </ButtonUI>
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {priceTypes.map(type => {
                        const key = `${product.id}-${type}`;
                        const currentPrice = product.priceComponents?.find(
                            pc => pc.componentType === type
                        )?.amount || 0;
                        const isEdited = editingPrices[key] !== currentPrice;

                        return (
                            <div key={type} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {priceComponentLabels[type]}
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            value={editingPrices[key] || 0}
                                            onChange={(e) => {
                                                const newPrice = parseFloat(e.target.value);
                                                if (!isNaN(newPrice)) {
                                                    setEditingPrices((prev: Record<string, number>) => ({
                                                        ...prev,
                                                        [key]: newPrice
                                                    }));
                                                }
                                            }}
                                            className={cn(
                                                isEdited && "border-yellow-500 dark:border-yellow-500"
                                            )}
                                        />
                                        {isEdited && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <span className="block w-2 h-2 rounded-full bg-yellow-500" />
                                            </div>
                                        )}
                                    </div>
                                    <ButtonUI
                                        onClick={() => handlePriceUpdate(product.id!, type)}
                                        disabled={updatingPrice[key] || !isEdited}
                                        size="sm"
                                    >
                                        {updatingPrice[key] ? (
                                            <div className="animate-spin h-4 w-4 border-b-2 border-white" />
                                        ) : (
                                            'Update'
                                        )}
                                    </ButtonUI>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};