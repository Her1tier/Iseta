import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) throw error;

            // Success
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in.');
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
                className="w-full max-w-md relative z-10 glass rounded-3xl p-8 md:p-10 border border-gray-200 shadow-xl bg-white/80 backdrop-blur-md"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block text-3xl font-bold mb-2 text-gray-900">Iseta</Link>
                    <p className="text-gray-600">{t('auth.welcome_back_message')}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email_label')}</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                            placeholder={t('auth.email_placeholder')}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">{t('auth.password_label')}</label>
                            <Link to="/forgot-password" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                                {t('auth.forgot_password')}
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                            placeholder={t('auth.password_placeholder')}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            {t('auth.keep_signed_in')}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#0A0F11' }}
                    >
                        {loading ? t('auth.signing_in') : t('auth.sign_in_button')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    {t('auth.dont_have_account')}{' '}
                    <Link to="/signup" className="font-semibold text-gray-900 hover:text-gray-700">
                        {t('auth.create_account_link')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
