import ProductCategoriesTab from '@/components/AdminSettingsTabs/ProductCategoriesTab';
import SettingsNavigation from '@/components/AdminSettingsTabs/SettingsNavigation';

export default function Categories() {
    return (
        <div className="p-8">
            <SettingsNavigation />
            <ProductCategoriesTab />
        </div>
    );
}