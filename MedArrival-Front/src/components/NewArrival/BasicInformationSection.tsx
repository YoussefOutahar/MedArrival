import React from 'react';
import { useTranslation } from 'react-i18next';
import { SupplierDTO } from '@/models/SupplierDTO';
import { ArrivalFormData } from '@/types/arrival.types';

interface BasicInformationSectionProps {
  formData: ArrivalFormData;
  setFormData: React.Dispatch<React.SetStateAction<ArrivalFormData>>;
  suppliers: SupplierDTO[];
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  formData,
  setFormData,
  suppliers,
}) => {
  const { t } = useTranslation('newArrival');

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('basicInfo.title')}
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('basicInfo.invoiceNumber.label')}
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white  
                       rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('basicInfo.invoiceNumber.placeholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('basicInfo.supplier.label')}
            </label>
            <select
              value={formData.supplier?.id || ''}
              onChange={(e) => {
                const supplier = suppliers.find(s => s.id === Number(e.target.value));
                setFormData(prev => ({ ...prev, supplier: supplier || null }));
              }}
              className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white 
                       rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">{t('basicInfo.supplier.placeholder')}</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('basicInfo.arrivalDate.label')}
            </label>
            <input
              type="datetime-local"
              value={formData.arrivalDate}
              onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
              className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white 
                       rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;