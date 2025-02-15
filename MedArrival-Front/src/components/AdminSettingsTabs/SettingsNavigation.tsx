import { Package, ListTree, Building2, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function SettingsNavigation() {
    const location = useLocation();
    const { t } = useTranslation('settings');

    const navigationItems = [
        {
            path: PATHS.ADMIN.SETTINGS.PRODUCTS,
            icon: Package,
            label: t('navigation.products')
        },
        {
            path: PATHS.ADMIN.SETTINGS.SUPPLIERS,
            icon: Building2,
            label: t('navigation.suppliers')
        },
        {
            path: PATHS.ADMIN.SETTINGS.CLIENTS,
            icon: Users,
            label: t('navigation.clients')
        }
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8 -mt-9">
            <nav className="-mb-px flex gap-6">
                {navigationItems.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={cn(
                            "py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm",
                            "transition-colors duration-200",
                            location.pathname === path
                                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}