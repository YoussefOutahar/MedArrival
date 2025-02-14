import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Switch from '@radix-ui/react-switch';
import { PriceComponentOverride } from '@/types/arrival.types';
import { PriceComponentType } from '@/models/PriceComponentDTO';

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
      pc.componentType === type ? { ...pc, amount } : pc
    );
    onPriceComponentChange(updated);
  };

  const handleUseDefaultToggle = (type: PriceComponentType, useDefault: boolean) => {
    const updated = priceComponents.map(pc => 
      pc.componentType === type ? { ...pc, usesDefaultPrice: useDefault } : pc
    );
    onPriceComponentChange(updated);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {priceComponents.map(pc => (
        <div key={pc.componentType} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(`priceComponents.${pc.componentType}`)}
          </label>
          <div className="space-y-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={pc.amount}
              onChange={(e) => handleAmountChange(pc.componentType, parseFloat(e.target.value) || 0)}
              disabled={pc.usesDefaultPrice}
              className="w-full p-2 border rounded-md disabled:opacity-50"
            />
            <div className="flex items-center space-x-2">
              <Switch.Root
                checked={pc.usesDefaultPrice}
                onCheckedChange={(checked) => handleUseDefaultToggle(pc.componentType, checked)}
                className={`w-9 h-5 rounded-full transition-colors ${
                  pc.usesDefaultPrice ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <Switch.Thumb className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                  pc.usesDefaultPrice ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </Switch.Root>
              <span className="text-sm text-gray-500">
                {pc.usesDefaultPrice ? t('useDefault') : t('override')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriceComponentsSection;