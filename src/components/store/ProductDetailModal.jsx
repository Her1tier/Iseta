import React, { useState } from 'react';
import { X, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailModal = ({ product, isOpen, onClose, storePhone }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariations, setSelectedVariations] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [manualImageIndex, setManualImageIndex] = useState(null);

    // Reset state when product changes
    React.useEffect(() => {
        if (product) {
            setQuantity(1);
            setSelectedVariations({});
            setCurrentImageIndex(0);
            setManualImageIndex(null);
            // Pre-select first option for each variation if available
            if (product.variations) {
                const initialVars = {};
                product.variations.forEach(v => {
                    if (v.options && v.options.length > 0) {
                        initialVars[v.name] = v.options[0];
                    }
                });
                setSelectedVariations(initialVars);
            }
        }
    }, [product]);

    // Update image when variation changes (if variation_stock is present)
    React.useEffect(() => {
        if (product?.variation_stock && !manualImageIndex) {
            const varData = getCurrentVariationData();
            setCurrentImageIndex(varData.imageIndex);
        }
    }, [selectedVariations, product]);//eslint-disable-line

    // Get current variation stock and image
    const getCurrentVariationData = () => {
        if (!product) return { stock: product?.stock_quantity || 0, imageIndex: 0 };

        // If product has variation_stock data, use it
        if (product.variation_stock && product.variations && product.variations.length > 0) {
            // Generate variation key from selected variations
            const variationKey = product.variations
                .map(v => selectedVariations[v.name] || v.options[0])
                .join('-');

            const varData = product.variation_stock[variationKey];
            if (varData) {
                return {
                    stock: varData.stock || 0,
                    imageIndex: varData.image_index ?? 0
                };
            }
        }

        // Fallback to global stock
        return { stock: product.stock_quantity || 0, imageIndex: 0 };
    };

    const currentVariationData = getCurrentVariationData();
    const currentStock = currentVariationData.stock;

    if (!isOpen || !product) return null;

    // Get images (max 5)
    const images = product.images?.slice(0, 5) || [];
    const hasMultipleImages = images.length > 1;

    const nextImage = () => {
        const newIndex = (manualImageIndex ?? currentImageIndex) + 1;
        setManualImageIndex(newIndex % images.length);
    };

    const prevImage = () => {
        const newIndex = (manualImageIndex ?? currentImageIndex) - 1 + images.length;
        setManualImageIndex(newIndex % images.length);
    };

    const displayImageIndex = manualImageIndex ?? currentImageIndex;

    const handleWhatsAppBuy = () => {
        // Construct message
        let text = `Hello! I'm interested in buying *${product.name}*`;
        text += `\nPrice: ${product.price.toLocaleString()} RWF`;
        text += `\nQuantity: ${quantity}`;

        // Add variations if any selected
        Object.entries(selectedVariations).forEach(([key, value]) => {
            text += `\n${key}: ${value}`;
        });

        text += `\n\nLink: ${window.location.href}`;

        // Format phone number and open WhatsApp
        const phoneNumber = storePhone?.replace(/[^0-9]/g, '') || '';
        if (!phoneNumber) {
            alert('Store phone number not available. Please contact the seller directly.');
            return;
        }

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[95vh]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Gallery Section */}
                    <div className="w-full md:w-1/2 bg-gray-100 relative aspect-square overflow-hidden flex-shrink-0">
                        {images.length > 0 ? (
                            <>
                                {/* Main Image with Swipe */}
                                <motion.div
                                    key={manualImageIndex ?? currentImageIndex}
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 1 }}
                                    transition={{ duration: 0 }}
                                    drag={hasMultipleImages ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        if (offset.x > 50) {
                                            prevImage();
                                        } else if (offset.x < -50) {
                                            nextImage();
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                                >
                                    <img
                                        src={images[manualImageIndex ?? currentImageIndex]}
                                        alt={`${product.name} - Image ${(manualImageIndex ?? currentImageIndex) + 1}`}
                                        className="w-full h-full object-cover select-none"
                                        draggable={false}
                                    />
                                </motion.div>



                                {/* Dots Navigation - Overlaid on Image */}
                                {hasMultipleImages && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setManualImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${index === displayImageIndex
                                                    ? 'bg-black w-6'
                                                    : 'bg-black/50 hover:bg-black/75'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Image Counter */}
                                {hasMultipleImages && (
                                    <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {displayImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-gray-400">No Image</div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                        <div className="mb-1">
                            {product.category && (
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {product.category}
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                        <div className="text-2xl font-normal text-[#0A0F11] mb-6">
                            {product.price.toLocaleString()} RWF
                        </div>

                        {/* Variations */}
                        {product.variations && product.variations.map((v, i) => (
                            <div key={i} className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{v.name}</label>
                                <div className="flex flex-wrap gap-2">
                                    {v.options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setSelectedVariations(prev => ({ ...prev, [v.name]: opt }));
                                                setManualImageIndex(null); // Reset manual selection when variation changes
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedVariations[v.name] === opt
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Stock Display */}
                        {product.variation_stock && (
                            <div className="mb-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${currentStock > 0
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                                    }`}>
                                    {currentStock > 0 ? (
                                        <>
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            {currentStock} remaining in stock
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Out of Stock
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                                    disabled={currentStock <= 0}
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(currentStock || 999, quantity + 1))}
                                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                                    disabled={currentStock <= 0 || quantity >= currentStock}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        {/* Stock Status - for products without variation_stock */}
                        {!product.variation_stock && product.stock_quantity <= 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-medium">This item is currently out of stock</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleWhatsAppBuy}
                                disabled={currentStock <= 0}
                                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                Buy on WhatsApp
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductDetailModal;
