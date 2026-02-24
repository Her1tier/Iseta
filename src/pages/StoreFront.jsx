import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PublicStoreLayout from '../layouts/PublicStoreLayout';
import ProductCard from '../components/store/ProductCard';
import ProductDetailModal from '../components/store/ProductDetailModal';
import { Loader2, Store, ChevronDown, Phone, Instagram, Video } from 'lucide-react';

const StoreFront = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filtering
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Store Profile by Slug
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (profileError || !profile) {
                    throw new Error('Store not found');
                }

                setStore(profile);

                // 2. Fetch Products for this store
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('seller_id', profile.id)
                    .order('created_at', { ascending: false });

                if (productsError) throw productsError;

                setProducts(productsData || []);

                // Extract Categories
                const uniqueCats = ['All', ...new Set(productsData
                    .map(p => p.category)
                    .filter(c => c && c.trim() !== '')
                )];
                setCategories(uniqueCats);

            } catch (err) {
                console.error('Store fetch error:', err);
                setError(err.message === 'Store not found' ? 'Store not found' : 'Failed to load store');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchStoreData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
            </div>
        );
    }

    if (error === 'Store not found') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Store size={40} className="text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
                <p className="text-gray-500 max-w-md">
                    The store you are looking for (/{slug}) does not exist.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-red-500">Something went wrong. Please try again later.</p>
            </div>
        );
    }

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <PublicStoreLayout store={store}>
            {/* About / Bio Section */}
            <div className="max-w-3xl mx-auto text-center mt-12 mb-12 px-4">
                {store.bio && (
                    <p className="text-gray-600 leading-relaxed text-lg mb-6">
                        {store.bio}
                    </p>
                )}

                {/* Socials - Moved here for better mobile layout */}
                <div className="flex items-center justify-center gap-6">
                    {/* Phone - Regular Call */}
                    {store.phone_number && (
                        <a
                            href={`tel:${store.phone_number}`}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors text-[#F1F1EF]"
                            title="Call us"
                        >
                            <span className="sr-only">Phone</span>
                            <Phone size={20} fill="currentColor" />
                        </a>
                    )}

                    {/* Instagram */}
                    {store.instagram_url && (
                        <a
                            href={store.instagram_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors text-[#F1F1EF]"
                            title="Instagram"
                        >
                            <span className="sr-only">Instagram</span>
                            <Instagram size={20} />
                        </a>
                    )}

                    {/* TikTok */}
                    {store.tiktok_url && (
                        <a
                            href={store.tiktok_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors text-[#F1F1EF]"
                            title="TikTok"
                        >
                            <span className="sr-only">TikTok</span>
                            {/* TikTok SVG Icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>

            {/* Filter Bar - Separated Style with NO horizontal padding for strict alignment */}
            <div className="sticky top-0 z-40 py-4 mb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        Products
                    </h2>

                    <div className="relative group">
                        <button className="flex items-center gap-2 bg-black text-white px-5 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                            {selectedCategory === 'All' ? 'All categories' : selectedCategory}
                            <ChevronDown size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0 transition-colors ${selectedCategory === cat ? 'font-bold text-black bg-gray-50' : 'text-gray-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400">No products found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={setSelectedProduct}
                        />
                    ))}
                </div>
            )}

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                storePhone={store.phone_number}
            />
        </PublicStoreLayout>
    );
};

export default StoreFront;
