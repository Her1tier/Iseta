import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Search, PackageOpen, Clock, CheckCircle2, XCircle, Filter, AlertCircle } from 'lucide-react';
import CreateOrderModal from '../../components/dashboard/CreateOrderModal';
import OrderDetailsModal from '../../components/dashboard/OrderDetailsModal';

const Orders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    products (
                        name,
                        images
                    )
                `)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleOrderCreated = () => {
        fetchOrders();
        setShowCreateModal(false);
    };

    const handleOrderUpdated = () => {
        fetchOrders();
        setSelectedOrder(null);
    };

    // Filter and search
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_phone.includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    // Calculate stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        completed: orders.filter(o => o.status === 'completed').length,
        revenue: orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (parseFloat(o.price_at_time) * o.quantity), 0)
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'paid': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'completed': return 'bg-green-50 text-green-700 border border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('orders_page.title')}</h1>
                    <p className="text-gray-500 text-sm mt-1 mb-4 md:mb-0">{t('orders_page.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-black text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                    <Plus size={18} className="md:block hidden" />
                    <Plus size={16} className="md:hidden" />
                    <span className="whitespace-nowrap">{t('orders_page.create_order')}</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">{t('orders_page.total_orders')}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">{t('orders_page.pending')}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">{t('orders_page.completed')}</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">{t('orders_page.total_revenue')}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {stats.revenue.toLocaleString()} RWF
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="w-full relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('orders_page.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter - Horizontal scroll on mobile */}
                    <div className="overflow-x-auto -mx-4 px-4">
                        <div className="flex gap-2 min-w-max">
                            {['all', 'pending', 'paid', 'completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-colors whitespace-nowrap ${statusFilter === status
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >

                                    {t(`orders_page.status_${status}`) || status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <PackageOpen className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('orders_page.no_orders_found')}</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery || statusFilter !== 'all'
                            ? t('orders_page.adjust_filters')
                            : t('orders_page.create_first_order')}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            {t('orders_page.create_order')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_id')}</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_product')}</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_customer')}</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_status')}</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_date')}</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">{t('orders_page.table_total')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="text-sm font-mono text-gray-600">
                                                {order.id.slice(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {order.products?.images?.[0] && (
                                                    <img
                                                        src={order.products.images[0]}
                                                        alt={order.products.name}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {order.products?.name || t('orders_page.unknown_product')}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{t('orders_page.qty')}: {order.quantity}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-gray-900">{order.customer_name}</div>
                                            <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize">{t(`orders_page.status_${order.status}`) || order.status}</span>
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="font-medium text-gray-900">
                                                {(parseFloat(order.price_at_time) * order.quantity).toLocaleString()} RWF
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onOrderCreated={handleOrderCreated}
                products={products}
            />

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onOrderUpdated={handleOrderUpdated}
            />
        </div>
    );
};

export default Orders;
