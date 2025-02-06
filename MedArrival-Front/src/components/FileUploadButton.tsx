import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept: string;
  isLoading?: boolean;
}

export function FileUploadButton({ onFileSelect, accept, isLoading }: FileUploadButtonProps) {
  const { t } = useTranslation('settings');
  return (
    <label className="inline-flex items-center px-4 py-2 border border-transparent 
                     rounded-md shadow-sm text-sm font-medium text-white 
                     bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                     dark:hover:bg-primary-600 cursor-pointer">
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = ''; // Reset input
        }}
        disabled={isLoading}
      />
      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
      {isLoading ? t('common.actions.importing') : t('common.actions.import')}
    </label>
  );
}