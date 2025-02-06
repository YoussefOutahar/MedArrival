import ClientsTab from '@/components/AdminSettingsTabs/ClientsTab';
import SettingsNavigation from '@/components/AdminSettingsTabs/SettingsNavigation';

export default function Clients() {
    return (
        <div className="p-8">
            <SettingsNavigation />
            <ClientsTab />
        </div>
    );
}