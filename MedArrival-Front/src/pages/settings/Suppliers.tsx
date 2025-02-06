import SuppliersTab from '@/components/AdminSettingsTabs/SuppliersTab';
import SettingsNavigation from '@/components/AdminSettingsTabs/SettingsNavigation';

export default function Suppliers() {
    return (
        <div className="p-8">
            <SettingsNavigation />
            <SuppliersTab />
        </div>
    );
}