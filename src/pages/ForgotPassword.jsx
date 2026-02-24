import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#F1F1EF' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10 glass rounded-3xl p-8 md:p-10 border border-gray-200 shadow-xl bg-white/80 backdrop-blur-md"
            >
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="text-center mb-10">
                    <Link to="/" className="inline-block text-3xl font-bold mb-2 text-gray-900">Iseta</Link>
                    <p className="text-gray-600">Reset your password</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm text-center font-medium border border-green-100">
                        <p className="font-semibold mb-1">Check your email!</p>
                        <p>We've sent you a password reset link. Please check your inbox.</p>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0 bg-white/50 transition-colors"
                                placeholder="Enter your email"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                We'll send you a link to reset your password
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#0A0F11' }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {success && (
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-block text-sm font-medium text-gray-900 hover:text-gray-700"
                        >
                            Return to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
