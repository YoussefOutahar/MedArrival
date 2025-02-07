import React from 'react';

const LoadingRow: React.FC = () => {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-4 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                         border-primary-600 dark:border-primary-400" />
        </div>
      </td>
    </tr>
  );
};

export default LoadingRow;