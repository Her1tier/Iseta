import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, ArrowRight } from 'lucide-react';

const StoreCreated = () => {
    const location = useLocation();
    const { slug, shopName } = location.state || { slug: 'your-store', shopName: 'Your Shop' };
    const storeUrl = `${window.location.origin}/${slug}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(storeUrl);
        // Toast or simple feedback could be added here
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F1F1EF]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h1>
                <p className="text-gray-600 mb-8">
                    <span className="font-semibold text-gray-900">{shopName}</span> has been successfully created.
                </p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2 font-medium">Your Store URL</p>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200">
                        <code className="text-sm font-mono text-gray-600 flex-1 overflow-hidden text-ellipsis px-2">
                            {storeUrl}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                            title="Copy URL"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/dashboard"
                        className="block w-full py-4 rounded-full bg-[#0A0F11] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        Go to Dashboard <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/"
                        className="block w-full py-4 rounded-full bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default StoreCreated;
