import React from 'react';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductList = ({ products, onEdit, onDelete, onAdd }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Start building your inventory by adding your first product to your store.
                </p>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-[#0A0F11] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative"
                >
                    {/* Image Area */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={32} />
                            </div>
                        )}

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                onClick={() => onEdit(product)}
                                className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(product.id)}
                                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
                        <p className="text-[#0A0F11] font-bold">RWF {product.price.toLocaleString()}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>{product.stock_quantity} in stock</span>
                            {product.category && <span className="bg-gray-100 px-2 py-1 rounded-md">{product.category}</span>}
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Add New Card (Always useful to have at end of grid too) */}
            <button
                onClick={onAdd}
                className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-900 hover:bg-gray-50 transition-all min-h-[300px]"
            >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                    <Plus size={24} className="text-gray-400 group-hover:text-gray-900" />
                </div>
                <span className="font-medium text-gray-500 group-hover:text-gray-900">Add New Product</span>
            </button>
        </div>
    );
};

export default ProductList;
