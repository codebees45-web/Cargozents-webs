import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' }
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const modalRef = useRef(null);

  const currentLang = i18n.language || 'en';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Wait a tick before adding the click listener so the click that opened the modal doesn't instantly close it
      setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ur' || code === 'ar' ? 'rtl' : 'ltr';
    setIsOpen(false);
  };

  return (
    <div className="inline-block text-left">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-8 items-center gap-2 rounded-full border border-primary/20 bg-secondary/60 px-3 transition hover:bg-secondary/80 hover:border-primary/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        <span className="text-[11px] font-bold text-primary">{currentLang.toUpperCase()}</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className={`relative w-full max-w-[480px] rounded-2xl border shadow-2xl transition-all ${
              isDark ? 'border-primary/20 bg-[#0A1811] text-white shadow-black/50' : 'border-gray-200 bg-white text-gray-900 shadow-gray-200'
            }`}
          >
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between border-b pb-3 border-primary/10">
                <h3 className={`text-base font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Select Language / भाषा चुनें
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
                    isDark ? 'hover:bg-primary/20 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                  Close
                </button>
              </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all duration-200 ${
                      isSelected
                        ? (isDark ? 'border-primary bg-primary/10' : 'border-primary bg-primary/5')
                        : (isDark ? 'border-primary/10 bg-[#050C08] hover:border-primary/30' : 'border-gray-200 bg-gray-50 hover:border-primary/30')
                    }`}
                  >
                    <span className={`text-[13px] font-semibold ${isSelected ? 'text-primary' : (isDark ? 'text-gray-200' : 'text-gray-800')}`}>
                      {lang.native}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary/80' : 'text-gray-500'}`}>
                      {lang.name}
                    </span>
                  </button>
                );
              })}
            </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSelector;
