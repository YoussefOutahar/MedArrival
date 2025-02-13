import React, { useEffect, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReportFilter } from '@/types/reports';
import { supplierService } from '@/services/supplier.service';
import { arrivalService } from '@/services/arrival.service';
import { SupplierDTO } from '@/models/SupplierDTO';
import { ArrivalDTO } from '@/models/ArrivalDTO';
import debounce from 'lodash/debounce';
import { ClientDTO } from '@/models/ClientDTO';
import { clientService } from '@/services/client.service';

interface ReportFiltersProps {
  selectedReport: string;
  filters: ReportFilter;
  onFiltersChange: (filters: ReportFilter) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedReport,
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation('reports');
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [arrivals, setArrivals] = useState<ArrivalDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const response = await clientService.getAll();
        setClients(response.content);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedReport === 'client-receipt') {
      fetchClients();
    }
  }, [selectedReport]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const response = await supplierService.getAll();
        setSuppliers(response.content);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedReport === 'purchase-invoice') {
      fetchSuppliers();
    }
  }, [selectedReport]);

  useEffect(() => {
    const fetchArrivals = async () => {
      if (!filters.supplier) return;

      setIsLoading(true);
      try {
        const response = await arrivalService.findBySupplier(Number(filters.supplier));
        setArrivals(response);
      } catch (error) {
        console.error('Error fetching arrivals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedReport === 'purchase-invoice' && filters.supplier) {
      fetchArrivals();
    }
  }, [selectedReport, filters.supplier]);

  const filteredArrivals = arrivals.filter(arrival =>
    arrival.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleSearchFocus = () => {
    setShowArrivalDropdown(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding the dropdown to allow for click events
    setTimeout(() => {
      setShowArrivalDropdown(false);
    }, 200);
  };

  const handleArrivalSelect = (arrival: ArrivalDTO) => {
    onFiltersChange({
      ...filters,
      arrival: arrival.invoiceNumber
    });
    setSearchTerm(arrival.invoiceNumber);
    setShowArrivalDropdown(false);
  };

  const clearArrivalSelection = () => {
    onFiltersChange({
      ...filters,
      arrival: undefined
    });
    setSearchTerm('');
  };

  const renderDateFilters = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('filters.startDate')}
        </label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                   text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('filters.endDate')}
        </label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                   text-gray-900 dark:text-white"
        />
      </div>
    </>
  );

  const renderPurchaseInvoiceFilters = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('filters.supplier.label')}
        </label>
        <select
          value={filters.supplier || ''}
          onChange={(e) => {
            onFiltersChange({
              ...filters,
              supplier: e.target.value,
              arrival: undefined
            });
            setSearchTerm('');
          }}
          disabled={isLoading}
          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                   text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{t('filters.supplier.placeholder')}</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id} className="dark:bg-gray-700">
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {filters.supplier && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('filters.arrival.search')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder={t('filters.arrival.searchPlaceholder')}
              className="w-full pl-10 pr-10 p-2.5 bg-white dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 
                       focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 
                       text-gray-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={clearArrivalSelection}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>

          {/* Dropdown for filtered arrivals */}
          {showArrivalDropdown && filteredArrivals.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
              <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {filteredArrivals.map((arrival) => (
                  <li
                    key={arrival.id}
                    onClick={() => handleArrivalSelect(arrival)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 
                             dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block truncate">
                        {arrival.invoiceNumber} - {new Date(arrival.arrivalDate).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderClientFilters = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('filters.client.label')}
        </label>
        <select
          value={filters.client || ''}
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            client: e.target.value ? Number(e.target.value) : undefined 
          })}
          disabled={isLoading}
          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                   rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-primary-400 dark:focus:border-primary-400 
                   text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{t('filters.client.placeholder')}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id} className="dark:bg-gray-700">
              {client.name}
            </option>
          ))}
        </select>
      </div>
      {renderDateFilters()}
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('filters.title')}
          </h2>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedReport === 'purchase-invoice' 
            ? renderPurchaseInvoiceFilters()
            : selectedReport === 'client-receipt'
            ? renderClientFilters()
            : renderDateFilters()
          }
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;