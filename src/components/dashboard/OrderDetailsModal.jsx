import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Phone, Package, Trash2, MessageCircle, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const OrderDetailsModal = ({ order, isOpen, onClose, onOrderUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'status'|'delete', value: string }

    if (!isOpen || !order) return null;

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            // If marking as completed, deduct from inventory
            if (newStatus === 'completed' && order.status !== 'completed') {
                const { error: inventoryError } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: order.products.stock_quantity - order.quantity
                    })
                    .eq('id', order.product_id);

                if (inventoryError) throw inventoryError;
            }

            // If cancelling from completed, add back to inventory
            if (newStatus === 'cancelled' && order.status === 'completed') {
                const { error: inventoryError } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: order.products.stock_quantity + order.quantity
                    })
                    .eq('id', order.product_id);

                if (inventoryError) throw inventoryError;
            }

            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', order.id);

            if (error) throw error;

            onOrderUpdated();
            setConfirmAction(null);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            // If order was completed, add stock back
            if (order.status === 'completed') {
                const { error: inventoryError } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: order.products.stock_quantity + order.quantity
                    })
                    .eq('id', order.product_id);

                if (inventoryError) throw inventoryError;
            }

            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', order.id);

            if (error) throw error;

            onOrderUpdated();
            setConfirmAction(null);
            onClose();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const phone = order.customer_phone.replace(/[^0-9]/g, '');
        const text = `Hello ${order.customer_name}! Regarding your order for ${order.products?.name}.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'paid': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'completed': return 'bg-green-50 text-green-700 border border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            case 'paid': return <CheckCircle2 className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const canMarkAsPaid = order.status === 'pending';
    const canMarkAsCompleted = order.status === 'paid';
    const canCancel = order.status === 'pending' || order.status === 'paid';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-gray-500 font-mono">ID: {order.id.slice(0, 8)}...</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                        </span>
                    </div>

                    {/* Product Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            {order.products?.images?.[0] && (
                                <img
                                    src={order.products.images[0]}
                                    alt={order.products.name}
                                    className="w-20 h-20 rounded object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{order.products?.name || 'Unknown Product'}</h3>
                                <div className="text-sm text-gray-600 mt-1">
                                    Quantity: {order.quantity}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Price: {parseFloat(order.price_at_time).toLocaleString()} RWF each
                                </div>
                                <div className="text-lg font-bold text-gray-900 mt-2">
                                    Total: {(parseFloat(order.price_at_time) * order.quantity).toLocaleString()} RWF
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variations */}
                    {order.variations && Object.keys(order.variations).length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Variations</label>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                {Object.entries(order.variations).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-gray-600">{key}:</span>
                                        <span className="font-medium text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium text-gray-900">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Phone:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{order.customer_phone}</span>
                                    <a
                                        href={`tel:${order.customer_phone}`}
                                        className="text-black hover:text-gray-700 transition-colors"
                                        title="Call customer"
                                    >
                                        <Phone size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700">{order.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                            <div className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                            <div className="text-sm text-gray-600">
                                {new Date(order.updated_at).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Actions</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* WhatsApp Customer */}
                            <button
                                onClick={handleWhatsApp}
                                className="px-4 py-2 bg-[#0f5e54]/10 text-[#0f5e54] border border-[#0f5e54]/20 rounded-lg hover:bg-[#0f5e54]/20 transition-colors flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp Customer
                            </button>

                            {/* Mark as Paid */}
                            {canMarkAsPaid && (
                                <button
                                    onClick={() => setConfirmAction({ type: 'status', value: 'paid' })}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Mark as Paid
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Mark as Completed */}
                            {canMarkAsCompleted && (
                                <button
                                    onClick={() => setConfirmAction({ type: 'status', value: 'completed' })}
                                    className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <Package size={18} />
                                            Mark as Completed
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Cancel */}
                            {canCancel && (
                                <button
                                    onClick={() => setConfirmAction({ type: 'status', value: 'cancelled' })}
                                    className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <XCircle size={18} />
                                            Cancel Order
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Delete */}
                            <button
                                onClick={() => setConfirmAction({ type: 'delete' })}
                                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                {loading ? 'Deleting...' : 'Delete Order'}
                            </button>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Confirmation Dialog */}
                {confirmAction && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
                            <p className="text-gray-600 mb-6">
                                {confirmAction.type === 'delete'
                                    ? 'Are you sure you want to delete this order? This action cannot be undone.'
                                    : `Are you sure you want to mark this order as ${confirmAction.value}?`}
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmAction.type === 'delete') {
                                            handleDelete();
                                        } else {
                                            handleStatusUpdate(confirmAction.value);
                                        }
                                    }}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsModal;
