import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Switch from '@radix-ui/react-switch';
import { PriceComponentOverride } from '@/types/arrival.types';
import { PriceComponentType } from '@/models/PriceComponentDTO';
import { NumericFormat } from 'react-number-format';

interface PriceComponentsSectionProps {
  priceComponents: PriceComponentOverride[];
  onPriceComponentChange: (priceComponents: PriceComponentOverride[]) => void;
}

const PriceComponentsSection: React.FC<PriceComponentsSectionProps> = ({
  priceComponents,
  onPriceComponentChange
}) => {
  const { t } = useTranslation('newArrival');

  const handleAmountChange = (type: PriceComponentType, amount: number) => {
    const updated = priceComponents.map(pc =>
      pc.componentType === type
        ? {
          ...pc,
          amount,
          usesDefaultPrice: false
        }
        : pc
    );
    onPriceComponentChange(updated);
  };

  const handleUseDefaultToggle = (type: PriceComponentType, useDefault: boolean) => {
    const updatedComponents = [...priceComponents];
    const componentIndex = updatedComponents.findIndex(pc => pc.componentType === type);

    if (componentIndex !== -1) {
      updatedComponents[componentIndex] = {
        ...updatedComponents[componentIndex],
        usesDefaultPrice: useDefault,
        amount: useDefault
          ? priceComponents[componentIndex].amount
          : priceComponents[componentIndex].amount
      };
    }
    onPriceComponentChange(updatedComponents);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {priceComponents.map(pc => (
          <div
            key={pc.componentType}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t(`priceComponents.${pc.componentType}`)}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {pc.usesDefaultPrice ? t('useDefault') : t('override')}
                  </span>
                  <Switch.Root
                    checked={pc.usesDefaultPrice}
                    onCheckedChange={(checked) => handleUseDefaultToggle(pc.componentType, checked)}
                    className={`w-9 h-5 rounded-full transition-colors ${pc.usesDefaultPrice
                        ? 'bg-primary-600 dark:bg-primary-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <Switch.Thumb
                      className={`block w-4 h-4 bg-white rounded-full transition-transform ${pc.usesDefaultPrice ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                    />
                  </Switch.Root>
                </div>
              </div>

              <div className="relative">
                <NumericFormat
                  value={pc.amount}
                  onValueChange={(values) => {
                    handleAmountChange(pc.componentType, values.floatValue || 0);
                  }}
                  disabled={pc.usesDefaultPrice}
                  thousandSeparator={true}
                  prefix="$"
                  decimalScale={2}
                  className={`
                    w-full p-2 border rounded-md 
                    ${pc.usesDefaultPrice
                      ? 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    }
                    disabled:opacity-50
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  `}
                />
                {!pc.usesDefaultPrice && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="block w-2 h-2 rounded-full bg-yellow-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('totalAmount')}
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            ${priceComponents.reduce((sum, pc) => sum + pc.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceComponentsSection;