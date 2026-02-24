import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Bell, Search, Menu, X, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IsetaLogo from '../../assets/iseta_logo.svg';
import LanguageToggle from '../LanguageToggle';

const SidebarItem = ({ icon: Icon, label, path, active }) => {
    return (
        <Link
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-gray-900 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
        >
            <Icon size={20} className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#F1F1EF] flex">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#F1F1EF] border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out lg:translate-x-0
                flex flex-col p-6
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between mb-10">
                    <Link to="/" className="text-2xl font-bold text-gray-900">
                        <img src={IsetaLogo} alt="Iseta" className="h-6" />
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label={t('dashboard.overview')} path="/dashboard" active={location.pathname === '/dashboard'} />
                    <SidebarItem icon={Package} label={t('dashboard.products')} path="/dashboard/products" active={location.pathname.includes('/products')} />
                    <SidebarItem icon={ShoppingBag} label={t('dashboard.orders')} path="/dashboard/orders" active={location.pathname.includes('/orders')} />
                    <SidebarItem icon={Settings} label={t('dashboard.settings')} path="/dashboard/settings" active={location.pathname.includes('/settings')} />
                </nav>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-gray-200 space-y-4">
                    <LanguageToggle />
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-[#F1F1EF]/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Dashboard</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-64 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
