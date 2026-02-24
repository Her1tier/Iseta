import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageToggle = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'rw' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            title="Switch Language"
        >
            <Languages size={18} />
            <span>{i18n.language === 'en' ? 'Kinyarwanda' : 'English'}</span>
        </button>
    );
};

export default LanguageToggle;
