import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, X, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { compressImage } from '../../lib/imageUtils';

const ProductForm = ({ product = null, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState(product?.images || []);
    const [imageFiles, setImageFiles] = useState([]); // New files to upload

    // Basic Fields
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock_quantity || 0,
        category: product?.category || '',
    });

    // Variations
    const [variations, setVariations] = useState(product?.variations || []);
    const [variationStock, setVariationStock] = useState(product?.variation_stock || {});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            setError(t('product_form.max_images_error'));
            return;
        }

        try {
            const processedFiles = await Promise.all(
                files.map(file => compressImage(file))
            );
            setImageFiles([...imageFiles, ...processedFiles]);

            // Create local previews
            const newPreviews = processedFiles.map(file => URL.createObjectURL(file));
            setImages([...images, ...newPreviews]);
        } catch (err) {
            console.error(err);
            setError(t('product_form.image_processing_error'));
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        // If it was a new file, remove from imageFiles too (logic is a bit loose here for mix of old/new)
        // ideally we track indices better, but for MVP:
        // Assume if it's a blob url, it's in imageFiles. 
    };

    const addVariation = () => {
        setVariations([...variations, { name: '', options: [] }]);
    };

    const updateVariationName = (index, name) => {
        const newVars = [...variations];
        newVars[index].name = name;
        setVariations(newVars);
    };

    const addVariationOption = (index, option) => {
        const newVars = [...variations];
        if (!option.trim()) return;
        newVars[index].options.push(option.trim());
        setVariations(newVars);
    };

    const removeVariationOption = (vIndex, oIndex) => {
        const newVars = [...variations];
        newVars[vIndex].options.splice(oIndex, 1);
        setVariations(newVars);
    };

    const removeVariation = (index) => {
        const newVars = [...variations];
        newVars.splice(index, 1);
        setVariations(newVars);
        // Also clear any variation stock entries that included this variation
        setVariationStock({});
    };

    // Generate all possible variation combinations
    const generateVariationCombinations = () => {
        if (variations.length === 0 || variations.some(v => !v.options || v.options.length === 0)) {
            return [];
        }

        const combine = (arrays) => {
            if (arrays.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const combinations = combine(rest);
            return first.flatMap(item => combinations.map(combo => [item, ...combo]));
        };

        const optionArrays = variations.map(v => v.options);
        const combos = combine(optionArrays);

        return combos.map(combo => ({
            key: combo.join('-'),
            values: combo,
            labels: variations.map(v => v.name)
        }));
    };

    const updateVariationStock = (key, field, value) => {
        setVariationStock(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: field === 'stock' ? parseInt(value) || 0 : parseInt(value) || 0
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Upload new images
            let uploadedUrls = images.filter(img => !img.startsWith('blob:')); // Keep existing remote URLs

            for (const file of imageFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `products/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            // 2. Prepare Product Data
            const productData = {
                seller_id: user.id,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock),
                category: formData.category,
                images: uploadedUrls,
                variations: variations,
                variation_stock: Object.keys(variationStock).length > 0 ? variationStock : null
            };

            let error;
            if (product?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', product.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productData]);
                error = insertError;
            }

            if (error) throw error;

            onSave(); // Callback to parent to refresh list

        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">{product ? t('product_form.title_edit') : t('product_form.title_add')}</h2>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.images_label')}</label>
                    <div className="flex flex-wrap gap-4">
                        {images.map((img, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                                <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 hover:bg-gray-50 transition-colors">
                                <Upload size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">{t('product_form.images_add')}</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.product_name_label')}</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0"
                            placeholder={t('product_form.product_name_placeholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.price_label')}</label>
                        <input
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0"
                            placeholder={t('product_form.price_placeholder')}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.description_label')}</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0"
                        placeholder={t('product_form.description_placeholder')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.stock_label')}</label>
                        <input
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0"
                            placeholder={t('product_form.stock_placeholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_form.category_label')}</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-0"
                            placeholder={t('product_form.category_placeholder')}
                        />
                    </div>
                </div>

                {/* Variations */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{t('product_form.variations_title')}</h3>
                        <button type="button" onClick={addVariation} className="text-sm font-medium text-[#0A0F11] flex items-center gap-1 hover:underline">
                            <Plus size={16} /> {t('product_form.add_option')}
                        </button>
                    </div>
                    {variations.length === 0 && <p className="text-sm text-gray-500">{t('product_form.no_variations')}</p>}

                    <div className="space-y-4">
                        {variations.map((v, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <input
                                            value={v.name}
                                            onChange={(e) => updateVariationName(i, e.target.value)}
                                            placeholder={t('product_form.option_name_placeholder')}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {v.options.map((opt, oIndex) => (
                                                <span key={oIndex} className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center gap-1">
                                                    {opt}
                                                    <button type="button" onClick={() => removeVariationOption(i, oIndex)}><X size={12} /></button>
                                                </span>
                                            ))}
                                            <input
                                                placeholder={t('product_form.add_value_placeholder')}
                                                className="px-2 py-1 rounded border border-gray-300 text-xs w-32"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addVariationOption(i, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeVariation(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variation Stock Assignment */}
                {variations.length > 0 && variations.every(v => v.options && v.options.length > 0) && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">{t('product_form.variation_stock_title') || 'Stock per Variation'}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Assign stock quantities and images to each variation combination.
                        </p>

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-gray-700">Combination</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Stock</th>
                                        <th className="text-left p-3 font-medium text-gray-700">Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generateVariationCombinations().map((combo, index) => (
                                        <tr key={combo.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{combo.key}</div>
                                                <div className="text-xs text-gray-500">
                                                    {combo.labels.map((label, i) => `${label}: ${combo.values[i]}`).join(', ')}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={variationStock[combo.key]?.stock || 0}
                                                    onChange={(e) => updateVariationStock(combo.key, 'stock', e.target.value)}
                                                    className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-gray-900 focus:ring-0"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={variationStock[combo.key]?.image_index ?? 0}
                                                    onChange={(e) => updateVariationStock(combo.key, 'image_index', e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-gray-900 focus:ring-0"
                                                    disabled={images.length === 0}
                                                >
                                                    {images.length === 0 ? (
                                                        <option value="0">No images</option>
                                                    ) : (
                                                        images.map((img, imgIndex) => (
                                                            <option key={imgIndex} value={imgIndex}>
                                                                Image {imgIndex + 1}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#0A0F11] text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        {loading ? t('product_form.save_button_loading') : <><Save size={18} /> {t('product_form.save_button')}</>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;
