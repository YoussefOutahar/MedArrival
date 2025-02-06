import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English', countryCode: 'US' },
    { code: 'fr', name: 'Français', countryCode: 'FR' },
    { code: 'ar', name: 'العربية', countryCode: 'MA' },
];

const LanguageSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState(
        languages.find(lang => lang.code === i18n.language) || languages[0]
    );

    useEffect(() => {
        const currentLang = languages.find(lang => lang.code === i18n.language);
        if (currentLang) {
            setSelectedLang(currentLang);
        }
    }, [i18n.language]);

    const handleLanguageChange = async (lang: typeof languages[0]) => {
        setSelectedLang(lang);
        await i18n.changeLanguage(lang.code);
        setIsOpen(false);
        
        document.documentElement.dir = lang.code === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 
                         hover:text-gray-900 dark:hover:text-white rounded-lg 
                         transition-all duration-200 border border-gray-200 
                         dark:border-gray-700 bg-white dark:bg-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
                <ReactCountryFlag
                    countryCode={selectedLang.countryCode}
                    svg
                    className="rounded-sm"
                    style={{
                        width: '1.2em',
                        height: '1.2em',
                    }}
                />
                <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 
                               ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div 
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                                 rounded-lg shadow-lg border border-gray-200 
                                 dark:border-gray-700 py-2 z-30"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang)}
                                className={`w-full flex items-center gap-3 px-4 py-2 
                                          hover:bg-gray-50 dark:hover:bg-gray-700/50
                                          ${selectedLang.code === lang.code 
                                              ? 'text-primary-600 dark:text-primary-400' 
                                              : 'text-gray-700 dark:text-gray-300'}
                                          transition-colors text-left`}
                            >
                                <ReactCountryFlag
                                    countryCode={lang.countryCode}
                                    svg
                                    className="rounded-sm"
                                    style={{
                                        width: '1.2em',
                                        height: '1.2em',
                                    }}
                                />
                                <span className="text-sm font-medium">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSelector;