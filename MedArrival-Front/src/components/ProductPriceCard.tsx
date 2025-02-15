import { useState } from 'react';
import { ButtonUI } from '@/components/ui/button-ui';
import { ProductDTO } from '@/models/ProductDTO';
import { PriceComponentType } from '@/models/PriceComponentDTO';
import { ArrowPathIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from './ui/input';

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

    const calculateTotalPrice = () => {
        return priceTypes.reduce((total, type) => {
            const key = `${product.id}-${type}`;
            return total + (editingPrices[key] || 0);
        }, 0);
    };

    const getPercentageChange = (currentValue: number, originalValue: number) => {
        if (originalValue === 0) return 0;
        return ((currentValue - originalValue) / originalValue) * 100;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                    </div>
                    <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {t('products.totalPrice')}: 
                            <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                                ${calculateTotalPrice().toFixed(2)}
                            </span>
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Tooltip content={t('products.actions.revertToDefaultHint')}>
                        <ButtonUI
                            onClick={() => handleRevertToDefault(product.id!)}
                            disabled={updatingPrice[`${product.id}-all`]}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                        </ButtonUI>
                    </Tooltip>
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
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {priceTypes.map(type => {
                        const key = `${product.id}-${type}`;
                        const currentPrice = product.priceComponents?.find(
                            pc => pc.componentType === type
                        )?.amount || 0;
                        const isEdited = editingPrices[key] !== currentPrice;
                        const percentageChange = getPercentageChange(editingPrices[key] || 0, currentPrice);

                        return (
                            <div key={type} className="relative p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {priceComponentLabels[type]}
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <NumericFormat
                                                value={editingPrices[key] || 0}
                                                onValueChange={(values) => {
                                                    setEditingPrices(prev => ({
                                                        ...prev,
                                                        [key]: values.floatValue || 0
                                                    }));
                                                }}
                                                thousandSeparator={true}
                                                prefix="$"
                                                decimalScale={2}
                                                customInput={Input}
                                                className={cn(
                                                    "text-right pr-8",
                                                    isEdited && "border-yellow-500 dark:border-yellow-500"
                                                )}
                                            />
                                            {isEdited && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <span className="block w-2 h-2 rounded-full bg-yellow-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isEdited && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={cn(
                                                "font-medium",
                                                percentageChange > 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                {percentageChange > 0 ? "+" : ""}
                                                {percentageChange.toFixed(1)}%
                                            </span>
                                            <ButtonUI
                                                onClick={() => handlePriceUpdate(product.id!, type)}
                                                disabled={updatingPrice[key]}
                                                size="sm"
                                                // variant="primary"
                                            >
                                                {updatingPrice[key] ? (
                                                    <div className="animate-spin h-4 w-4 border-b-2 border-white" />
                                                ) : (
                                                    t('products.actions.update')
                                                )}
                                            </ButtonUI>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};