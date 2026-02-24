import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Signup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkingShopName, setCheckingShopName] = useState(false);
    const [shopNameStatus, setShopNameStatus] = useState({ available: null, message: '' });
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [phoneStatus, setPhoneStatus] = useState({ available: null, message: '' });

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        shopName: '',
        tin: '',
        password: ''
    });

    // Debounce timer for shop name validation
    const shopNameTimerRef = React.useRef(null);
    const phoneTimerRef = React.useRef(null);

    const checkShopNameAvailability = async (shopName) => {
        if (!shopName || shopName.trim().length < 3) {
            setShopNameStatus({ available: null, message: '' });
            return;
        }

        setCheckingShopName(true);
        try {
            // Generate slug from shop name
            const slug = shopName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            if (slug.length < 3) {
                setShopNameStatus({
                    available: false,
                    message: 'Shop name must be at least 3 characters'
                });
                setCheckingShopName(false);
                return;
            }

            // Check if slug already exists in profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('slug')
                .eq('slug', slug)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking shop name:', error);
                setShopNameStatus({ available: null, message: '' });
            } else if (data) {
                setShopNameStatus({
                    available: false,
                    message: 'This shop name is already taken'
                });
            } else {
                setShopNameStatus({
                    available: true,
                    message: 'Shop name is available'
                });
            }
        } catch (err) {
            console.error('Shop name check error:', err);
            setShopNameStatus({ available: null, message: '' });
        } finally {
            setCheckingShopName(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Debounced shop name validation
        if (name === 'shopName') {
            setShopNameStatus({ available: null, message: '' });
            if (shopNameTimerRef.current) {
                clearTimeout(shopNameTimerRef.current);
            }
            shopNameTimerRef.current = setTimeout(() => {
                checkShopNameAvailability(value);
            }, 500);
        }

        // Debounced phone number validation
        if (name === 'phone') {
            setPhoneStatus({ available: null, message: '' });
            if (phoneTimerRef.current) {
                clearTimeout(phoneTimerRef.current);
            }
            phoneTimerRef.current = setTimeout(() => {
                checkPhoneAvailability(value);
            }, 500);
        }
    };


    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Generate Slug from Shop Name
            const slug = formData.shopName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dashes
                .replace(/^-+|-+$/g, '');   // Trim dashes from start/end

            if (slug.length < 3) {
                throw new Error("Shop name must result in a slug of at least 3 characters.");
            }

            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        shop_name: formData.shopName,
                    }
                }
            });

            if (authError) throw authError;

            // Check for missing session
            let session = authData.session;
            let user = authData.user;

            if (!session && user) {
                console.log('No session returned, attempting sign-in as fallback...');
                const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
                    email: formData.email.trim(),
                    password: formData.password
                });

                if (signinError || !signinData.session) {
                    throw new Error("Account created but couldn't sign in automatically. Please login manually.");
                }

                session = signinData.session;
                user = signinData.user;
            }

            if (!user || !user.id) throw new Error("User creation failed");
            const userId = user.id;

            // 2. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: userId,
                        full_name: formData.fullName,
                        shop_name: formData.shopName,
                        tin_number: formData.tin,
                        phone_number: formData.phone,
                        slug: slug,
                        updated_at: new Date()
                    }
                ]);

            if (profileError) {
                if (profileError.message.includes('row-level security')) {
                    throw new Error("Database permission denied. Try logging out and back in.");
                }
                if (profileError.message.includes('unique constraint') || profileError.code === '23505') {
                    throw new Error("This shop name is already taken. Please choose another.");
                }
                throw profileError;
            }

            // 3. Redirect to Success Page
            navigate('/store-created', { state: { slug: slug, shopName: formData.shopName } });

        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#F1F1EF' }}>

            {/* Background Elements Removed */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10 glass rounded-3xl p-8 md:p-10 border border-gray-200 shadow-xl bg-white/80 backdrop-blur-md"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block text-3xl font-bold mb-2 text-gray-900">Iseta</Link>
                    <p className="text-gray-600">{t('auth.create_account_message')}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.full_name_label')}</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                                placeholder={t('auth.full_name_placeholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email_addr_label')}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                                placeholder={t('auth.email_addr_placeholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.phone_label')}</label>
                            <div className="relative">
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-0 bg-white/50 transition-colors ${phoneStatus.available === true
                                            ? 'border-green-500 focus:border-green-600'
                                            : phoneStatus.available === false
                                                ? 'border-red-500 focus:border-red-600'
                                                : 'border-gray-300 focus:border-gray-900'
                                        }`}
                                    placeholder={t('auth.phone_placeholder')}
                                />
                                {checkingPhone && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {phoneStatus.message && (
                                <p className={`text-sm mt-1 ${phoneStatus.available === true
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                    {phoneStatus.available === true ? '✓ ' : '✗ '}
                                    {phoneStatus.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Business Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.shop_name_label')}</label>
                            <div className="relative">
                                <input
                                    name="shopName"
                                    type="text"
                                    required
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-0 bg-white/50 transition-colors ${shopNameStatus.available === true
                                        ? 'border-green-500 focus:border-green-600'
                                        : shopNameStatus.available === false
                                            ? 'border-red-500 focus:border-red-600'
                                            : 'border-gray-300 focus:border-gray-900'
                                        }`}
                                    placeholder={t('auth.shop_name_placeholder')}
                                />
                                {checkingShopName && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {shopNameStatus.message && (
                                <p className={`text-sm mt-1 ${shopNameStatus.available === true
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {shopNameStatus.available === true ? '✓ ' : '✗ '}
                                    {shopNameStatus.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.tin_label')}</label>
                            <input
                                name="tin"
                                type="text"
                                required
                                value={formData.tin}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                                placeholder={t('auth.tin_placeholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.password_label')}</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                                placeholder={t('auth.create_password_placeholder')}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading || checkingShopName || shopNameStatus.available === false || checkingPhone || phoneStatus.available === false}
                            className="w-full py-3.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#0A0F11' }}
                        >
                            {loading ? t('auth.creating_account') : t('auth.create_account_button')}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    {t('auth.agree_terms')}{' '}
                    <a href="#" className="font-medium text-gray-900 hover:underline">{t('auth.terms_service')}</a>
                    {' '}{t('auth.and')}{' '}
                    <a href="#" className="font-medium text-gray-900 hover:underline">{t('auth.privacy_policy')}</a>.
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {t('auth.already_have_account')}{' '}
                    <Link to="/login" className="font-semibold text-gray-900 hover:text-gray-700">
                        {t('auth.sign_in_button')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
