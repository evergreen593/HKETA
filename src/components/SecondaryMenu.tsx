import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Languages, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface SecondaryMenuProps {
  language: Language;
  setLanguage: (l: Language) => void;
  onShare: () => void;
  t: any;
}

export function SecondaryMenu({ language, setLanguage, onShare, t }: SecondaryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-neutral-600" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <button 
              onClick={() => {
                setLanguage(language === 'zh' ? 'en' : 'zh');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
            >
              <Languages className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">{t.language}</span>
            </button>
            <button 
              onClick={() => {
                onShare();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left border-t border-neutral-100"
            >
              <Share2 className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">{t.share}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
