import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { Camera, Save, Loader2, Instagram, Phone, Copy } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

const Settings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [user, setUser] = useState(null);
    const [slug, setSlug] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        shop_name: '',
        bio: '',
        phone_number: '',
        whatsapp_number: '',
        instagram_url: '',
        tiktok_url: '',
        banner_url: '',
        avatar_url: ''
    });

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUser(user);

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || '',
                        shop_name: profile.shop_name || '',
                        bio: profile.bio || '',
                        phone_number: profile.phone_number || '',
                        whatsapp_number: profile.whatsapp_number || '',
                        instagram_url: profile.instagram_url || '',
                        tiktok_url: profile.tiktok_url || '',
                        banner_url: profile.banner_url || '',
                        avatar_url: profile.avatar_url || ''
                    });
                    setSlug(profile.slug || '');
                    if (profile.banner_url) setBannerPreview(profile.banner_url);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const compressedFile = await compressImage(file);
            setBannerFile(compressedFile);
            setBannerPreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Error processing banner:', error);
            setMessage({ type: 'error', text: 'Error processing image.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            let bannerUrl = formData.banner_url;

            // 1. Upload Banner if changed
            if (bannerFile) {
                const fileExt = bannerFile.name.split('.').pop();
                const fileName = `banners/${user.id}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('store-banners')
                    .upload(fileName, bannerFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('store-banners')
                    .getPublicUrl(fileName);

                bannerUrl = publicUrl;
            }

            // 2. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    banner_url: bannerUrl,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setMessage({ type: 'success', text: t('settings_page.save_success') });
            setFormData(prev => ({ ...prev, banner_url: bannerUrl }));

        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: t('settings_page.save_error') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('settings_page.title')}</h2>
            <p className="text-gray-600 mb-8">{t('settings_page.subtitle')}</p>

            {message && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Store Appearance Section */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{t('settings_page.store_appearance')}</h3>

                    {/* Banner Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.store_banner')}</label>
                        <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 group hover:border-gray-400 transition-colors">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Camera size={32} className="mb-2" />
                                    <span className="text-sm">{t('settings_page.click_upload_banner')}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{t('settings_page.banner_help')}</p>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.shop_name')}</label>
                            <input
                                name="shop_name"
                                value={formData.shop_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.full_name')}</label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.bio')}</label>
                        <textarea
                            name="bio"
                            rows="4"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder={t('settings_page.bio_placeholder')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                        />
                    </div>
                </div>

                {/* Contact & Socials */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">{t('settings_page.contact_socials')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.whatsapp')}</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                    placeholder="e.g. 078XXXXXXX"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.phone_general')}</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.instagram')}</label>
                            <div className="relative">
                                <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="instagram_url"
                                    value={formData.instagram_url}
                                    onChange={handleChange}
                                    placeholder="@username"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.tiktok')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">TT</span>
                                <input
                                    name="tiktok_url"
                                    value={formData.tiktok_url}
                                    onChange={handleChange}
                                    placeholder="@username"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-0 focus:border-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store URL Section */}
                {slug && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{t('settings_page.store_url_section')}</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_page.public_link')}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={`${window.location.origin}/${slug}`}
                                    readOnly
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
                                        setMessage({ type: 'success', text: t('settings_page.url_copied') });
                                        setTimeout(() => setMessage(null), 3000);
                                    }}
                                    className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <Copy size={18} />
                                    {t('common.copy')}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{t('settings_page.share_help')}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#0A0F11] text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <>{t('common.saving')}</>
                        ) : (
                            <>
                                <Save size={18} /> {t('settings_page.save_settings')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
