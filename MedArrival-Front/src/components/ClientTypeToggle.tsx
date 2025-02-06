// components/ClientTypeToggle.tsx
import { ClientType } from '@/models/ClientDTO';
import * as Switch from '@radix-ui/react-switch';
import { useTranslation } from 'react-i18next';

interface ClientTypeToggleProps {
  clientType: ClientType;
  onToggle: () => void;
  disabled?: boolean;
}

export function ClientTypeToggle({ clientType, onToggle, disabled }: ClientTypeToggleProps) {
  const { t } = useTranslation('settings');
  const isMarcher = clientType === ClientType.CLIENT_MARCHER;

  return (
    <div className="flex items-center space-x-2">
      <Switch.Root
        checked={isMarcher}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="relative w-[42px] h-[25px] rounded-full outline-none cursor-default 
                  bg-gray-200 dark:bg-gray-700
                  data-[state=checked]:bg-primary-600
                  disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Switch.Thumb 
          className="block w-[21px] h-[21px] bg-white rounded-full
                     transition-transform duration-100 translate-x-0.5
                     will-change-transform
                     data-[state=checked]:translate-x-[19px]
                     shadow-lg" 
        />
      </Switch.Root>
      <span 
        className={`text-sm font-medium cursor-pointer select-none
                   ${isMarcher 
                     ? 'text-primary-600 dark:text-primary-400' 
                     : 'text-gray-600 dark:text-gray-300'}`}
      >
        {isMarcher ? t('clients.types.marcher') : t('clients.types.rp')}
      </span>
    </div>
  );
}