import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enDashboard from './locales/en/dashboard.json';
import enArrivals from './locales/en/arrivals.json';
import enNewArrival from './locales/en/new-arrival.json';
import enRepports from './locales/en/reports.json';
import enReceipts from './locales/en/receipts.json';
import enSettings from './locales/en/settings.json';
import enNavigation from './locales/en/navigation.json';

// French translations
import frDashboard from './locales/fr/dashboard.json';
import frArrivals from './locales/fr/arrivals.json';
import frNewArrival from './locales/fr/new-arrival.json';
import frRepports from './locales/fr/reports.json';
import frReceipts from './locales/fr/receipts.json';
import frSettings from './locales/fr/settings.json';
import frNavigation from './locales/fr/navigation.json';

// Arabic translations
import arDashboard from './locales/ar/dashboard.json';
import arArrivals from './locales/ar/arrivals.json';
import arNewArrival from './locales/ar/new-arrival.json';
import arRepports from './locales/ar/reports.json';
import arReceipts from './locales/ar/receipts.json';
import arSettings from './locales/ar/settings.json';
import arNavigation from './locales/ar/navigation.json';

const savedLanguage = localStorage.getItem('preferredLanguage');
const initialLanguage = ['en', 'fr', 'ar'].includes(savedLanguage || '') ? savedLanguage : 'en';

// Set initial direction
document.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLanguage || 'en';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                dashboard: enDashboard,
                arrivals: enArrivals,
                newArrival: enNewArrival,
                reports: enRepports,
                receipts: enReceipts,
                settings: enSettings,
                navigation: enNavigation
            },
            fr: {
                dashboard: frDashboard,
                arrivals: frArrivals,
                newArrival: frNewArrival,
                reports: frRepports,
                receipts: frReceipts,
                settings: frSettings,
                navigation: frNavigation
            },
            ar: {
                dashboard: arDashboard,
                arrivals: arArrivals,
                newArrival: arNewArrival,
                reports: arRepports,
                receipts: arReceipts,
                settings: arSettings,
                navigation: arNavigation
            }
        },
        lng: initialLanguage || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        defaultNS: 'dashboard'
    } as const);

export default i18n;