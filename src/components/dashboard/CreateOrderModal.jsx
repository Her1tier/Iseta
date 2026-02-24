import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { X, Loader2 } from 'lucide-react';

const CreateOrderModal = ({ isOpen, onClose, onOrderCreated, products }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        product_id: '',
        customer_name: '',
        customer_phone: '+250',
        quantity: 1,
        price_at_time: '',
        variations: {},
        status: 'pending',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (formData.product_id) {
            const product = products.find(p => p.id === formData.product_id);
            setSelectedProduct(product);
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    price_at_time: product.price.toString()
                }));
            }
        } else {
            setSelectedProduct(null);
        }
    }, [formData.product_id, products]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.product_id || !formData.customer_name || !formData.customer_phone || !formData.price_at_time) {
            alert(t('create_order_modal.alert_fill_required'));
            return;
        }

        if (!formData.customer_phone.match(/^\+250\d{9}$/)) {
            alert(t('create_order_modal.alert_invalid_phone'));
            return;
        }

        if (formData.quantity < 1) {
            alert(t('create_order_modal.alert_invalid_qty'));
            return;
        }

        // Check stock
        if (selectedProduct && selectedProduct.stock_quantity < formData.quantity) {
            alert(`${t('create_order_modal.alert_insufficient_stock')} ${selectedProduct.stock_quantity}`);
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('orders')
                .insert([{
                    seller_id: user.id,
                    ...formData,
                    price_at_time: parseFloat(formData.price_at_time)
                }]);

            if (error) throw error;

            // Reset form
            setFormData({
                product_id: '',
                customer_name: '',
                customer_phone: '+250',
                quantity: 1,
                price_at_time: '',
                variations: {},
                status: 'pending',
                notes: ''
            });

            onOrderCreated();
        } catch (error) {
            console.error('Error creating order:', error);
            alert(t('create_order_modal.alert_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleVariationChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            variations: {
                ...prev.variations,
                [key]: value
            }
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('create_order_modal.title')}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('create_order_modal.product_label')}
                        </label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                            required
                        >
                            <option value="">{t('create_order_modal.select_product')}</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.price.toLocaleString()} RWF ({t('create_order_modal.stock')}: {product.stock_quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('create_order_modal.customer_name_label')}
                            </label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder={t('create_order_modal.customer_name_placeholder')}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('create_order_modal.customer_phone_label')}
                            </label>
                            <input
                                type="tel"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder={t('create_order_modal.customer_phone_placeholder')}
                                required
                            />
                        </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('create_order_modal.quantity_label')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('create_order_modal.price_label')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price_at_time}
                                onChange={(e) => setFormData(prev => ({ ...prev, price_at_time: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Variations */}
                    {selectedProduct?.variations && selectedProduct.variations.length > 0 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('create_order_modal.variations_label')}
                            </label>
                            {selectedProduct.variations.map((variation, index) => (
                                <div key={index}>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {variation.name}
                                    </label>
                                    <select
                                        value={formData.variations[variation.name] || ''}
                                        onChange={(e) => handleVariationChange(variation.name, e.target.value)}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="">{t('create_order_modal.select_variation')} {variation.name}</option>
                                        {variation.options.map((option, optIndex) => (
                                            <option key={optIndex} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('create_order_modal.status_label')}
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                        >
                            <option value="pending">{t('create_order_modal.status_pending')}</option>
                            <option value="paid">{t('create_order_modal.status_paid')}</option>
                            <option value="completed">{t('create_order_modal.status_completed')}</option>
                            <option value="cancelled">{t('create_order_modal.status_cancelled')}</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('create_order_modal.notes_label')}
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                            placeholder={t('create_order_modal.notes_placeholder')}
                        />
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-700">{t('create_order_modal.total')}:</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {(parseFloat(formData.price_at_time || 0) * formData.quantity).toLocaleString()} RWF
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            {t('create_order_modal.submit_button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderModal;
