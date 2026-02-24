import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import ProductList from '../components/seller/ProductList';
import ProductForm from '../components/seller/ProductForm';
import { supabase } from '../lib/supabaseClient';

const Products = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('list'); // 'list', 'add', 'edit'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm(t('products_page.delete_confirm'))) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            // Optimistic update
            setProducts(products.filter(p => p.id !== productId));
        } catch (err) {
            console.error('Error deleting product:', err);
            alert(t('products_page.delete_error'));
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setView('edit');
    };

    const handleSaveSuccess = () => {
        setView('list');
        setSelectedProduct(null);
        fetchProducts(); // Refresh list
    };

    return (
        <div className="h-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('products_page.title')}</h2>
                    <p className="text-gray-600">{t('products_page.subtitle')}</p>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => { setSelectedProduct(null); setView('add'); }}
                        className="bg-[#0A0F11] text-white px-3 md:px-6 py-2 md:py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm md:text-base"
                    >
                        <Plus size={16} className="md:hidden" />
                        <Plus size={18} className="hidden md:block" />
                        <span className="whitespace-nowrap">{t('products_page.add_product')}</span>
                    </button>
                )}
            </div>

            {view === 'list' ? (
                loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <ProductList
                        products={products}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={() => setView('add')}
                    />
                )
            ) : (
                <ProductForm
                    product={selectedProduct}
                    onSave={handleSaveSuccess}
                    onCancel={() => setView('list')}
                />
            )}
        </div>
    );
};

export default Products;
