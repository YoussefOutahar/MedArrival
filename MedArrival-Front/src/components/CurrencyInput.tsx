import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from 'lucide-react';
import currency from 'currency.js';


type CurrencyCode = 'USD' | 'EUR' | 'MAD';

interface CurrencyInfo {
  code: CurrencyCode;
  label: string;
  symbol: string;
}

interface CurrencyInputProps {
  value: string;
  onChange: (value: { amount: string; currency: CurrencyCode }) => void;
  defaultCurrency?: CurrencyCode;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const currencies: CurrencyInfo[] = [
  { code: 'MAD', label: 'Moroccan Dirham', symbol: 'DH' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
];

export function CurrencyInput({
  value,
  onChange,
  defaultCurrency = 'MAD',
  className = '',
  disabled = false,
  placeholder = 'Enter amount'
}: CurrencyInputProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(defaultCurrency);

  const handleAmountChange = (newAmount: string) => {
    onChange({ amount: newAmount, currency: selectedCurrency });
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const currencyCode = newCurrency as CurrencyCode;
    setSelectedCurrency(currencyCode);
    onChange({ amount: value, currency: currencyCode });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => handleAmountChange(e.target.value)}
        className="px-3 py-2 border rounded-md w-32"
        placeholder={placeholder}
        disabled={disabled}
      />
      
      <Select.Root value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={disabled}>
        <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 border rounded-md w-32 bg-white">
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg">
            <Select.Viewport className="p-1">
              {currencies.map((currency) => (
                <Select.Item
                  key={currency.code}
                  value={currency.code}
                  className="flex items-center px-6 py-2 text-sm outline-none cursor-pointer hover:bg-gray-100"
                >
                  <Select.ItemText>{currency.symbol} {currency.code}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}