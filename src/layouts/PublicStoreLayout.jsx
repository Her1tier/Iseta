import React from 'react';
import { ShoppingBag, Instagram, Phone, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicStoreLayout = ({ children, store }) => {
    // Default fallback banner if none provided
    const bannerDisplay = store?.banner_url ? (
        <img src={store.banner_url} alt="Store Banner" className="w-full h-full object-cover" />
    ) : (
        <div className="w-full h-full bg-black flex items-center justify-center">
            {/* Fallback colored background similar to example */}
            <span className="text-white/50 text-4xl font-serif italic">Welcome</span>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            {/* 1. Header / Banner Area */}
            <div className="w-full h-48 md:h-64 bg-gray-200 relative">
                {bannerDisplay}
            </div>

            {/* 2. Shop Identity Bar - White Background */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex sm:items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {store?.shop_name || 'Store Name'}
                    </h1>
                </div>
            </div>

            {/* Main Content Wrapper - #F1F1EF Background */}
            <div className="flex-1 bg-[#F1F1EF] flex flex-col">
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 pt-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-auto">
                    <div className="text-center">
                        <p className="text-gray-900 font-medium mb-1">
                            Powered by <span className="font-extrabold">ISETA</span>
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default PublicStoreLayout;
