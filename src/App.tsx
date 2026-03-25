/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Train, Clock, MapPin, ChevronRight, Info, Star, Navigation, Download, Share2, Languages, MoreVertical, Bus, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LRT_STATIONS } from './constants';
import { MTR_LINES } from './mtrConstants';
import { LrtScheduleResponse, LrtStation, LrtPlatform, MtrLine, MtrStation, MtrScheduleResponse, MtrEta, BusCompany, UnifiedBusRoute, UnifiedBusStop, UnifiedBusEta, Tab, Language } from './types';
import { SecondaryMenu } from './components/SecondaryMenu';
import { LrtPage } from './components/LrtPage';
import { MtrPage } from './components/MtrPage';
import { BusPage } from './components/BusPage';

const translations = {
  zh: {
    lrt_eta: "輕鐵預計到站",
    mtr_eta: "港鐵預計到站",
    current_station: "目前車站",
    select_station: "選擇車站",
    search_station: "搜尋車站...",
    no_trains: "暫無預計到站班次",
    service_ended: "今日服務可能已結束",
    fetching: "正在獲取最新時間...",
    updated: "更新於",
    platform: "月台",
    arriving: "即將抵達",
    min: "分鐘",
    double_car: "雙卡",
    single_car: "單卡",
    up_platform: "上行月台",
    down_platform: "下行月台",
    share: "分享",
    language: "Language",
    nearest: "最近車站",
    refresh: "重新整理",
    no_train_info: "暫無列車資訊",
    last_train_left: "最後一班車可能已開出，或今日服務尚未開始。",
    install_ios: "安裝於 iOS",
    install_ios_desc: "點擊下方的分享按鈕，然後選擇「加入主畫面」。",
    close: "關閉",
    share_app: "分享應用",
    scan_qr: "掃描二維碼以在手機上打開",
    copy_link: "複製連結",
    link_copied: "連結已複製！",
    all: "全部",
    bus_eta: "巴士預計到站",
    select_route: "選擇路線",
    search_route: "搜尋路線...",
    select_stop: "選擇車站",
    current_stop: "目前車站",
    nearest_stop: "最近車站",
    no_bus: "暫無預計到站班次",
  },
  en: {
    lrt_eta: "LRT ETA",
    mtr_eta: "MTR ETA",
    current_station: "Current Station",
    select_station: "Select Station",
    search_station: "Search station...",
    no_trains: "No upcoming trains scheduled",
    service_ended: "Service may have ended for today, or not yet started.",
    fetching: "Fetching latest times...",
    updated: "UPDATED",
    platform: "Platform",
    arriving: "Arriving",
    min: "min",
    double_car: "Double Car",
    single_car: "Single Car",
    up_platform: "Up Platform",
    down_platform: "Down Platform",
    share: "Share",
    language: "語言",
    nearest: "Nearest Station",
    refresh: "Refresh",
    no_train_info: "No train information available",
    last_train_left: "The last train may have already left, or service has not yet started for today.",
    install_ios: "Install on iOS",
    install_ios_desc: "Tap the Share button below and select \"Add to Home Screen\".",
    close: "Close",
    share_app: "Share App",
    scan_qr: "Scan this QR code to open on your phone",
    copy_link: "Copy Link",
    link_copied: "Link copied!",
    all: "All",
    bus_eta: "Bus ETA",
    select_route: "Select Route",
    search_route: "Search route...",
    select_stop: "Select Stop",
    current_stop: "Current Stop",
    nearest_stop: "Nearest Stop",
    no_bus: "No upcoming buses scheduled",
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('mtr_lrt_app_tab');
      return (savedTab === 'lrt' || savedTab === 'mtr') ? savedTab : 'lrt';
    }
    return 'lrt';
  });
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('mtr_lrt_app_lang');
      return (savedLang === 'zh' || savedLang === 'en') ? savedLang : 'zh';
    }
    return 'zh';
  });
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab: Tab) => {
    if (newTab === activeTab) return;
    const tabs: Tab[] = ['lrt', 'mtr', 'bus'];
    const oldIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  useEffect(() => {
    localStorage.setItem('mtr_lrt_app_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('mtr_lrt_app_lang', language);
  }, [language]);

  const t = translations[language];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : "";

  useEffect(() => {
    const handler = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShowIOSInstructions(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 32, mass: 0.5 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            {activeTab === 'lrt' ? (
              <LrtPage 
                deferredPrompt={deferredPrompt} 
                handleInstallClick={handleInstallClick}
                showIOSInstructions={showIOSInstructions}
                setShowIOSInstructions={setShowIOSInstructions}
                setShowShareModal={setShowShareModal}
                language={language}
                setLanguage={setLanguage}
                t={t}
              />
            ) : activeTab === 'mtr' ? (
              <MtrPage 
                deferredPrompt={deferredPrompt} 
                handleInstallClick={handleInstallClick}
                showIOSInstructions={showIOSInstructions}
                setShowIOSInstructions={setShowIOSInstructions}
                setShowShareModal={setShowShareModal}
                language={language}
                setLanguage={setLanguage}
                t={t}
              />
            ) : (
              <BusPage 
                deferredPrompt={deferredPrompt} 
                handleInstallClick={handleInstallClick}
                showIOSInstructions={showIOSInstructions}
                setShowIOSInstructions={setShowIOSInstructions}
                setShowShareModal={setShowShareModal}
                language={language}
                setLanguage={setLanguage}
                t={t}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xs rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{t.share_app}</h3>
                <p className="text-neutral-500 text-sm font-medium">{t.scan_qr}</p>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`} 
                  alt="QR Code" 
                  className="w-40 h-40"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    const btn = document.getElementById('copy-btn');
                    if (btn) {
                      const originalText = btn.innerText;
                      btn.innerText = t.link_copied;
                      setTimeout(() => {
                        btn.innerText = originalText;
                      }, 2000);
                    }
                  }}
                  id="copy-btn"
                  className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
                >
                  {t.copy_link}
                </button>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-neutral-200 px-6 py-2 pb-5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => handleTabChange('lrt')}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${activeTab === 'lrt' ? 'text-orange-500' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'lrt' ? 'bg-orange-100' : 'bg-transparent'}`}>
            <Train className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Light Rail</span>
        </button>
        <button 
          onClick={() => handleTabChange('mtr')}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${activeTab === 'mtr' ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'mtr' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <Train className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">MTR</span>
        </button>
        <button 
          onClick={() => handleTabChange('bus')}
          className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${activeTab === 'bus' ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'bus' ? 'bg-emerald-50' : 'bg-transparent'}`}>
            <Bus className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Bus</span>
        </button>
      </nav>
    </div>
  );
}
