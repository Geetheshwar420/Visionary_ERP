import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  position?: 'up' | 'down';
  minimized?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ position = 'down', minimized = false, className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === language);

  // Determine dropdown classes based on position and minimized state
  let dropdownClasses = "absolute w-48 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-[100] animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto";
  
  if (minimized) {
    // If sidebar is collapsed, open to the right
    dropdownClasses += " left-full ml-3 bottom-0";
  } else if (position === 'up') {
    // If opening upwards
    dropdownClasses += " bottom-full mb-2 right-0";
  } else {
    // Default downwards
    dropdownClasses += " top-full mt-2 right-0";
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full ${minimized ? 'justify-center' : ''}`}
        title="Change Language"
      >
        <Globe size={20} className={minimized ? "" : "flex-shrink-0"} />
        {!minimized && (
          <span className="text-sm font-medium whitespace-nowrap">{currentLang?.nativeName}</span>
        )}
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900 z-10">Select Language</div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                language === lang.code 
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/10' 
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex flex-col">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-slate-400">{lang.name}</span>
              </div>
              {language === lang.code && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}