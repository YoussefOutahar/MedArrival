import { useTranslation } from 'react-i18next';
import { PATHS } from '@/routes/paths';
import { Building2, FileText, LayoutDashboard, ListCollapse, ListTree, Package, Plus, Receipt, Settings, Users } from 'lucide-react';

export const useNavigationRoutes = () => {
  const { t } = useTranslation('navigation');

  return [
    {
      path: PATHS.ADMIN.INDEX,
      label: t('menu.dashboard'),
      icon: LayoutDashboard,
    },
    {
      path: PATHS.ADMIN.NEW_ARRIVAL,
      label: t('menu.newArrival'),
      icon: Plus,
    },
    {
      path: PATHS.ADMIN.ARRIVALS,
      label: t('menu.arrivals'),
      icon: ListCollapse,
    },
    {
      path: PATHS.ADMIN.RECEIPTS,
      label: t('menu.receipts'),
      icon: Receipt,
    },
    {
      path: PATHS.ADMIN.REPORTS,
      label: t('menu.reports'),
      icon: FileText,
    },
    {
      label: t('menu.settings.title'),
      icon: Settings,
      children: [
        {
          path: PATHS.ADMIN.SETTINGS.PRODUCTS,
          label: t('menu.settings.products'),
          icon: Package,
        },
        {
          path: PATHS.ADMIN.SETTINGS.CATEGORIES,
          label: t('menu.settings.categories'),
          icon: ListTree,
        },
        {
          path: PATHS.ADMIN.SETTINGS.SUPPLIERS,
          label: t('menu.settings.suppliers'),
          icon: Building2,
        },
        {
          path: PATHS.ADMIN.SETTINGS.CLIENTS,
          label: t('menu.settings.clients'),
          icon: Users,
        },
      ],
    },
  ];
};