import ProductsTab from '@/components/AdminSettingsTabs/ProductsTab';
import SettingsNavigation from '@/components/AdminSettingsTabs/SettingsNavigation';

export default function Products() {
    return (
        <div className="p-8">
            <SettingsNavigation />
            <ProductsTab />
        </div>
    );
}