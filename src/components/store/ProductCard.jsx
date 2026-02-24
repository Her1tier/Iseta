import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const ProductCard = ({ product, onSelect }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group cursor-pointer block"
            onClick={() => onSelect(product)}
        >
            {/* Image Aspect Ratio 1:1 - Square corners */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden mb-2">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={32} />
                    </div>
                )}

                {/* Out of Stock - Minimalist label */}
                {product.stock_quantity <= 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-start">
                <h3 className="text-gray-900 font-bold text-base leading-snug mb-0.5">
                    {product.name}
                </h3>
                <div className="text-gray-900 text-sm font-medium">
                    {product.price.toLocaleString()} RWF
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
