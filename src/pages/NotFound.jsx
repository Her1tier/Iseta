import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F1F1EF]">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                    <h2 className="text-3xl font-bold text-gray-900 mt-4">Page not found</h2>
                    <p className="text-gray-600 mt-2 mb-8 max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        style={{ backgroundColor: '#0A0F11' }}
                    >
                        Go back home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;
