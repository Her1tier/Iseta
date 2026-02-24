import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className={`p-2 rounded-xl ${color.bg}`}>
                <Icon className={`h-5 w-5 ${color.text}`} />
            </div>
        </div>
        <div>
            {loading ? (
                <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            )}
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                {subtext}
            </p>
        </div>
    </div>
);

const Overview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        activeOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        lowStockProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Orders
            const { data: orders, error: ordersError } = await supabase
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

            if (ordersError) {
                console.error("Supabase SELECT orders error:", ordersError);
                throw ordersError;
            }
            console.log("Fetched orders for stats:", orders);

            // Calculate Order Stats
            const completedOrders = orders.filter(o => o.status === 'completed');
            const revenue = completedOrders.reduce((sum, o) => sum + (parseFloat(o.price_at_time) * o.quantity), 0);
            const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
            const uniqueCustomers = new Set(orders.map(o => o.customer_phone)).size;

            // 2. Fetch Products
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id);

            if (productsError) throw productsError;

            const lowStock = products.filter(p => p.stock_quantity < 5);

            setStats({
                revenue,
                activeOrders,
                totalCustomers: uniqueCustomers,
                totalProducts: products.length,
                lowStockProducts: lowStock.length
            });

            setRecentOrders(orders.slice(0, 5));
            setLowStockItems(lowStock.slice(0, 3)); // Show top 3 low stock items

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'paid': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.overview')}</h2>
                    <p className="text-gray-600">{t('home.subtitle')}</p>
                </div>
                <button
                    onClick={() => fetchDashboardData()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    title="Refresh Data"
                >
                    <Loader2 size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('stats.total_revenue')}
                    value={`${stats.revenue.toLocaleString()} RWF`}
                    subtext={t('stats.subtext_revenue')}
                    icon={DollarSign}
                    color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                    loading={loading}
                />
                <StatCard
                    title={t('stats.active_orders')}
                    value={stats.activeOrders}
                    subtext={t('stats.subtext_active_orders')}
                    icon={ShoppingBag}
                    color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                    loading={loading}
                />
                <StatCard
                    title={t('stats.total_customers')}
                    value={stats.totalCustomers}
                    subtext={t('stats.subtext_customers')}
                    icon={Users}
                    color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                    loading={loading}
                />
                <StatCard
                    title={t('stats.low_stock_alert')}
                    value={stats.lowStockProducts}
                    subtext={t('stats.subtext_low_stock')}
                    icon={AlertTriangle}
                    color={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{t('stats.recent_orders')}</h3>
                        <button
                            onClick={() => navigate('/dashboard/orders')}
                            className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
                        >
                            {t('stats.view_all')} <ArrowRight size={16} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {t('stats.no_orders')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate('/dashboard/orders')}
                                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                        {order.products?.images?.[0] ? (
                                            <img
                                                src={order.products.images[0]}
                                                alt={order.products.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900 text-sm truncate pr-4">
                                                {order.products?.name}
                                            </h4>
                                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {(order.price_at_time * order.quantity).toLocaleString()} RWF
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500 truncate">
                                                {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock & Quick Actions */}
                <div className="space-y-6">
                    {/* Low Stock Widget */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500" />
                            {t('stats.low_stock_items')}
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                                <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                            </div>
                        ) : lowStockItems.length === 0 ? (
                            <div className="text-sm text-gray-500 flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-700">
                                <TrendingUp size={16} />
                                {t('stats.stock_good')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lowStockItems.map(product => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <span className="text-sm font-medium text-gray-900 truncate flex-1 pr-2">
                                            {product.name}
                                        </span>
                                        <span className="text-xs font-bold text-orange-700 bg-white px-2 py-1 rounded-lg">
                                            {product.stock_quantity} {t('stats.left')}
                                        </span>
                                    </div>
                                ))}
                                {stats.lowStockProducts > 3 && (
                                    <button
                                        onClick={() => navigate('/dashboard/products')}
                                        className="text-xs text-center w-full text-gray-500 hover:text-black mt-2"
                                    >
                                        + {stats.lowStockProducts - 3} {t('stats.more_items')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Store Link */}
                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">{t('stats.my_store')}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {t('stats.share_store_link')}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/settings')}
                            className="w-full bg-white text-black py-2.5 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors"
                        >
                            {t('stats.get_store_link')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
