import { LogOut, HelpCircle, Settings, User, ChevronDown, Menu } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useNavigationRoutes } from './navigation';
import useAuth from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Popover from './Popover';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LanguageSelector from '@/components/layout/LanguageSelector';
import Logo from '/app-logo.svg';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { t } = useTranslation('navigation');
  const { i18n } = useTranslation();
  const routes = useNavigationRoutes();

  const toggleSection = (label: string) => {
    setExpandedSection(expandedSection === label ? null : label);
  };

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-64";
  const isRTL = i18n.language === 'ar';
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside
        className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full flex flex-col transition-all duration-300 ease-in-out z-20",
          sidebarWidth,
          isRTL ? 'right-0' : 'left-0'
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-[72px] flex items-center border-b border-gray-200 dark:border-gray-700",
          isSidebarCollapsed ? "justify-center" : "px-6 gap-3"
        )}>
          <img
            src={Logo}
            alt="MedReceival Logo"
            className={cn(
              "text-primary-600 dark:text-primary-500 flex-shrink-0",
              isSidebarCollapsed ? "h-7 w-7" : "h-7"
            )}
          />
          {!isSidebarCollapsed && (
            <span className="font-semibold text-[28px] text-gray-900 dark:text-white">CNESTEN</span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow py-8">
          <ul className="space-y-2">
            {routes.map((route) => (
              <li key={route.label}>
                {route.children ? (
                  <div>
                    {isSidebarCollapsed ? (
                      <div className="relative group">
                        <button
                          className="w-full flex items-center justify-center h-12 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          {route.icon && (
                            <route.icon className="h-6 w-6 flex-shrink-0" />
                          )}
                        </button>
                        {/* Flyout menu for collapsed state */}
                        <div className="hidden group-hover:block absolute left-full top-0 ml-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-48">
                          {route.children.map((child) => (
                            <RouterLink
                              key={child.path}
                              to={child.path}
                              className={cn(
                                "flex items-center px-4 py-2 gap-3",
                                location.pathname === child.path
                                  ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              )}
                            >
                              {child.icon && <child.icon className="h-5 w-5" />}
                              <span className="text-sm">{child.label}</span>
                            </RouterLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleSection(route.label)}
                          className={cn(
                            "w-full flex items-center h-12 px-6 gap-4",
                            "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          {route.icon && (
                            <route.icon className="h-6 w-6 flex-shrink-0" />
                          )}
                          <span className="text-[17px] font-medium flex-1 text-left">
                            {route.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform",
                              expandedSection === route.label ? "rotate-180" : ""
                            )}
                          />
                        </button>
                        {expandedSection === route.label && (
                          <ul className="mt-2 space-y-1">
                            {route.children.map((child) => (
                              <li key={child.path}>
                                <RouterLink
                                  to={child.path}
                                  className={cn(
                                    "flex items-center h-10 pl-14 pr-6 gap-3",
                                    location.pathname === child.path
                                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                  )}
                                >
                                  {child.icon && <child.icon className="h-5 w-5" />}
                                  <span className="text-[15px]">{child.label}</span>
                                </RouterLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <RouterLink
                    to={route.path!}
                    className={cn(
                      "flex items-center h-12",
                      isSidebarCollapsed ? "justify-center px-4" : "px-6 gap-4",
                      location.pathname === route.path
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {route.icon && (
                      <route.icon className="h-6 w-6 flex-shrink-0" />
                    )}
                    {!isSidebarCollapsed && (
                      <span className="text-[17px] font-medium">{route.label}</span>
                    )}
                  </RouterLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={signOut}
            className={cn(
              "w-full flex items-center h-12",
              isSidebarCollapsed ? "justify-center px-4" : "px-6 gap-4",
              "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <LogOut className="h-6 w-6 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-[17px] font-medium">{t("signOut")}</span>
            )}
          </button>
        </div>
      </aside>

      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isRTL 
          ? (isSidebarCollapsed ? "mr-16" : "mr-64") 
          : (isSidebarCollapsed ? "ml-16" : "ml-64")
      )}>
        {/* Header */}
        <header className="sticky top-0 z-10">
          <div className="h-[72px] flex items-center justify-between px-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isSidebarCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="flex items-center gap-6 px-6">
              <div className="p-2">
                <ThemeToggle />
              </div>

              <div className="p-2">
                <LanguageSelector />
              </div>

              <div className="relative">
                <button
                  // onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onClick={() => null}
                  className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg py-2 px-3 transition-colors"
                >
                  <img
                    src={Logo}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm dark:text-white">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                  </div>
                </button>

                <Popover
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  className="w-64"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium dark:text-white">Dr. Sarah Wilson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">sarah.wilson@medreceival.com</p>
                  </div>

                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3">
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3">
                      <HelpCircle className="h-4 w-4" />
                      Help & Support
                    </button>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-screen-2xl mx-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}