/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Train, Clock, MapPin, ChevronRight, Info, Star, Navigation, Download, Share2, Languages, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LRT_STATIONS } from './constants';
import { MTR_LINES } from './mtrConstants';
import { LrtScheduleResponse, LrtStation, LrtPlatform, MtrLine, MtrStation, MtrScheduleResponse, MtrEta } from './types';

type Tab = 'lrt' | 'mtr';
type Language = 'zh' | 'en';

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
    setDirection(newTab === 'mtr' ? 1 : -1);
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
            ) : (
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
      </nav>
    </div>
  );
}

function SecondaryMenu({ language, setLanguage, onShare, t }: { language: Language, setLanguage: (l: Language) => void, onShare: () => void, t: any }) {
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

function LrtPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal, language, setLanguage, t }: any) {
  const [selectedStation, setSelectedStation] = useState<LrtStation>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lrt_last_station');
      if (saved) {
        const stationId = parseInt(saved);
        return LRT_STATIONS.find(s => s.id === stationId) || LRT_STATIONS[0];
      }
    }
    return LRT_STATIONS[0];
  });
  const [schedule, setSchedule] = useState<LrtScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStationList, setShowStationList] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('lrt_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [locating, setLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const availableRoutes = useMemo(() => {
    if (!schedule) return [];
    const routes = new Set<string>();
    schedule.platform_list.forEach(platform => {
      platform.route_list?.forEach(route => {
        routes.add(route.route_no);
      });
    });
    return Array.from(routes).sort();
  }, [schedule]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const findNearestStation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    
    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentCoords({ lat: latitude, lng: longitude });
      let nearest = LRT_STATIONS[0];
      let minDistance = Infinity;

      LRT_STATIONS.forEach(station => {
        const dist = Math.sqrt(Math.pow(station.lat - latitude, 2) + Math.pow(station.lng - longitude, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearest = station;
        }
      });

      setSelectedStation(nearest);
      setLocating(false);
      setShowStationList(false);
    };

    const failure = (err: GeolocationPositionError) => {
      if (options.enableHighAccuracy) {
        // Try again with low accuracy
        options.enableHighAccuracy = false;
        navigator.geolocation.getCurrentPosition(success, finalFailure, options);
      } else {
        finalFailure(err);
      }
    };

    const finalFailure = (err: GeolocationPositionError) => {
      let msg = 'Unable to retrieve your location';
      if (err.code === err.PERMISSION_DENIED) msg = 'Location access denied';
      if (err.code === err.POSITION_UNAVAILABLE) msg = 'Geolocation information is not available';
      if (err.code === err.TIMEOUT) msg = 'Location request timed out';
      setError(msg);
      setLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, failure, options);
  }, []);

  useEffect(() => {
    localStorage.setItem('lrt_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lrt_last_station', selectedStation.id.toString());
    setSelectedRoute(null);
  }, [selectedStation]);

  const fetchSchedule = useCallback(async (stationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const paddedId = stationId.toString().padStart(3, '0');
      const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${paddedId}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data: LrtScheduleResponse = await response.json();
      if (data.status === 0) throw new Error('Station data currently unavailable');
      setSchedule(data);
      setLastUpdated(new Date());
    } catch (err) {
      if (!navigator.onLine || (err instanceof TypeError && err.message === 'Failed to fetch')) {
        setError('Network unavailable');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(selectedStation.id);
    const interval = setInterval(() => fetchSchedule(selectedStation.id), 10000);
    return () => clearInterval(interval);
  }, [selectedStation, fetchSchedule]);

  useEffect(() => {
    findNearestStation();
  }, []);

  const toggleFavorite = (e: React.MouseEvent, stationId: number) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(stationId) ? prev.filter(id => id !== stationId) : [...prev, stationId]);
  };

  const sortedStations = useMemo(() => {
    const filtered = LRT_STATIONS.filter(s => s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || s.name_ch.includes(searchQuery));
    return [...filtered].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [searchQuery, favorites]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm relative z-30 shrink-0">
        <div className="flex-1 flex justify-start">
          <SecondaryMenu language={language} setLanguage={setLanguage} onShare={() => setShowShareModal(true)} t={t} />
        </div>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Train className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">{t.lrt_eta}</h1>
        </div>

        <div className="flex-1 flex justify-end gap-1">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          )}
          <button onClick={findNearestStation} disabled={locating} className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50">
            <Navigation className={`w-5 h-5 text-neutral-600 ${locating ? 'animate-pulse text-orange-500' : ''}`} />
          </button>
          <button onClick={(e) => toggleFavorite(e, selectedStation.id)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Star className={`w-5 h-5 ${favorites.includes(selectedStation.id) ? 'text-orange-500 fill-orange-500' : 'text-neutral-400'}`} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 touch-pan-y">
        <main className="max-w-md mx-auto p-4 space-y-6 w-full">
        <AnimatePresence>
          {showIOSInstructions && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <button onClick={() => setShowIOSInstructions(false)} className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-xl shrink-0"><Info className="w-6 h-6" /></div>
                <div className="space-y-1">
                  <h3 className="font-bold">{t.install_ios}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">{t.install_ios_desc}</p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="sticky top-0 z-20 bg-neutral-50/90 backdrop-blur-md -mx-4 px-4 -mt-4 pt-4 pb-2 mb-2 shadow-sm border-b border-neutral-200 space-y-2">
          <button onClick={() => setShowStationList(true)} className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-orange-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full group-hover:bg-orange-200 transition-colors"><MapPin className="w-5 h-5 text-orange-600" /></div>
              <div className="text-left">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">{t.current_station}</p>
                <h2 className="text-xl font-bold">
                  {language === 'zh' ? selectedStation.name_ch : selectedStation.name_en} 
                  <span className="text-neutral-400 font-medium text-base ml-1">
                    {language === 'zh' ? selectedStation.name_en : selectedStation.name_ch}
                  </span>
                </h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-orange-500 transition-colors" />
          </button>

          {availableRoutes.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-1.5 flex gap-2 shadow-sm overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedRoute(null)}
                className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${selectedRoute === null ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-neutral-50 text-neutral-600'}`}
              >
                <span className="text-xs font-bold whitespace-nowrap">{t.all}</span>
              </button>
              {availableRoutes.map(routeNo => (
                <button
                  key={routeNo}
                  onClick={() => setSelectedRoute(routeNo)}
                  className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${selectedRoute === routeNo ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-neutral-50 text-neutral-600'}`}
                >
                  <span className="text-xs font-bold whitespace-nowrap">{routeNo}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"><Info className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">{error}</p></div>}
          {loading && !schedule && <div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div><p className="text-neutral-500 font-medium animate-pulse">{t.fetching}</p></div>}
          {schedule && schedule.platform_list.map((platform) => {
            const filteredRoutes = selectedRoute 
              ? (platform.route_list || []).filter(r => r.route_no === selectedRoute)
              : (platform.route_list || []);
            
            if (selectedRoute && filteredRoutes.length === 0) return null;

            return (
              <div key={platform.platform_id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-neutral-900 text-white px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest">{t.platform} {platform.platform_id}</span>
                  <div className="flex items-center gap-1 text-[10px] opacity-60"><Clock className="w-3 h-3" /><span>{t.updated} {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                </div>
                <div className="divide-y divide-neutral-100">
                  {filteredRoutes.length > 0 ? filteredRoutes.map((route, idx) => (
                    <motion.div key={`${route.route_no}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-orange-500 text-white w-12 h-12 rounded-xl font-black text-lg shadow-sm">{route.route_no}</div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{language === 'zh' ? route.dest_ch : route.dest_en}</h3>
                          <p className="text-neutral-500 text-sm font-medium">{language === 'zh' ? route.dest_en : route.dest_ch}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-600 tabular-nums">
                          {route.time_en && route.time_en.includes('min') ? (
                            <>
                              {route.time_en.split(' ')[0]}
                              <span className="text-xs font-bold ml-1 uppercase">{t.min}</span>
                            </>
                          ) : (
                            <span className="text-base">
                              {language === 'zh' ? (route.time_ch || '-') : (route.time_en || '-')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          {route.train_length === 2 ? (
                            <>
                              <Train className="w-3 h-3 text-neutral-400" />
                              <Train className="w-3 h-3 text-neutral-400" />
                            </>
                          ) : (
                            <Train className="w-3 h-3 text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="p-8 text-center space-y-2">
                      <div className="bg-neutral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-neutral-400" />
                      </div>
                      <p className="text-neutral-500 font-medium">{t.no_trains}</p>
                      <p className="text-neutral-400 text-xs">{t.service_ended}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>

      <AnimatePresence>
        {showStationList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl">Select Station</h3>
                  <button onClick={findNearestStation} disabled={locating} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"><Navigation className={`w-4 h-4 ${locating ? 'animate-pulse' : ''}`} /></button>
                </div>
                <button onClick={() => setShowStationList(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 rotate-90" /></button>
              </div>
              <div className="p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input type="text" placeholder="Search station name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" autoFocus />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-1 gap-1">
                  {sortedStations.map((station) => (
                    <div 
                      key={station.id} 
                      onClick={() => { setSelectedStation(station); setShowStationList(false); setSearchQuery(''); }} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-all text-left cursor-pointer ${selectedStation.id === station.id ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedStation(station); setShowStationList(false); setSearchQuery(''); } }}
                    >
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => toggleFavorite(e, station.id)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><Star className={`w-4 h-4 ${favorites.includes(station.id) ? 'text-orange-500 fill-orange-500' : 'text-neutral-300'}`} /></button>
                        <div><span className="text-lg">{station.name_ch}</span><span className="ml-2 text-sm opacity-60 font-medium">{station.name_en}</span></div>
                      </div>
                      {selectedStation.id === station.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MtrPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal, language, setLanguage, t }: any) {
  const allStations = useMemo(() => {
    const stationsMap: Record<string, MtrStation & { lines: MtrLine[] }> = {};
    MTR_LINES.forEach(line => {
      line.stations.forEach(station => {
        if (!stationsMap[station.code]) {
          stationsMap[station.code] = { ...station, lines: [] };
        }
        stationsMap[station.code].lines.push(line);
      });
    });
    return Object.values(stationsMap).sort((a, b) => a.name_en.localeCompare(b.name_en));
  }, []);

  const [selectedStation, setSelectedStation] = useState<(MtrStation & { lines: MtrLine[] })>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mtr_last_station');
      if (saved) {
        const station = allStations.find(s => s.code === saved);
        if (station) return station;
      }
    }
    const initialStation = allStations.find(s => s.code === 'ADM') || allStations[0];
    return initialStation;
  });
  const [selectedLine, setSelectedLine] = useState<MtrLine>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mtr_last_line');
      if (saved) {
        const line = selectedStation.lines.find(l => l.code === saved);
        if (line) return line;
      }
    }
    return selectedStation.lines[0];
  });
  const [schedule, setSchedule] = useState<MtrScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStationList, setShowStationList] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mtr_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [locating, setLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const findNearestStation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setCurrentCoords({ lat: latitude, lng: longitude });
      let nearestStation = allStations[0];
      let minDistance = Infinity;

      allStations.forEach(station => {
        if (station.lat && station.lng) {
          const dist = Math.sqrt(Math.pow(station.lat - latitude, 2) + Math.pow(station.lng - longitude, 2));
          if (dist < minDistance) {
            minDistance = dist;
            nearestStation = station;
          }
        }
      });

      setSelectedStation(nearestStation);
      setSelectedLine(nearestStation.lines[0]);
      setLocating(false);
      setShowStationList(false);
    };

    const failure = (err: GeolocationPositionError) => {
      if (options.enableHighAccuracy) {
        // Try again with low accuracy
        options.enableHighAccuracy = false;
        navigator.geolocation.getCurrentPosition(success, finalFailure, options);
      } else {
        finalFailure(err);
      }
    };

    const finalFailure = (err: GeolocationPositionError) => {
      let msg = 'Unable to retrieve your location';
      if (err.code === err.PERMISSION_DENIED) msg = 'Location access denied';
      if (err.code === err.POSITION_UNAVAILABLE) msg = 'Geolocation information is not available';
      if (err.code === err.TIMEOUT) msg = 'Location request timed out';
      setError(msg);
      setLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, failure, options);
  }, [allStations]);

  useEffect(() => {
    localStorage.setItem('mtr_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('mtr_last_station', selectedStation.code);
    localStorage.setItem('mtr_last_line', selectedLine.code);
  }, [selectedStation, selectedLine]);

  const fetchSchedule = useCallback(async (lineCode: string, stationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${stationCode}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data: MtrScheduleResponse = await response.json();
      if (data.status === 0) throw new Error(data.message || 'Station data currently unavailable');
      setSchedule(data);
      setLastUpdated(new Date());
    } catch (err) {
      if (!navigator.onLine || (err instanceof TypeError && err.message === 'Failed to fetch')) {
        setError('Network unavailable');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(selectedLine.code, selectedStation.code);
    const interval = setInterval(() => fetchSchedule(selectedLine.code, selectedStation.code), 10000);
    return () => clearInterval(interval);
  }, [selectedLine, selectedStation, fetchSchedule]);

  useEffect(() => {
    findNearestStation();
  }, [findNearestStation]);

  const toggleFavorite = (e: React.MouseEvent, lineCode: string, stationCode: string) => {
    e.stopPropagation();
    const favKey = `${lineCode}-${stationCode}`;
    setFavorites(prev => prev.includes(favKey) ? prev.filter(k => k !== favKey) : [...prev, favKey]);
  };

  const stationNameMap = useMemo(() => {
    const map: Record<string, { ch: string; en: string }> = {};
    MTR_LINES.forEach(line => {
      line.stations.forEach(sta => {
        map[sta.code] = { ch: sta.name_ch, en: sta.name_en };
      });
    });
    return map;
  }, []);

  const getDestName = (code: string) => {
    return stationNameMap[code]?.ch || code;
  };

  const mtrData = useMemo(() => {
    if (!schedule || !schedule.data) return null;
    const key = `${selectedLine.code}-${selectedStation.code}`;
    return schedule.data[key];
  }, [schedule, selectedLine, selectedStation]);

  const hasTrains = useMemo(() => {
    if (!mtrData) return false;
    const up = (mtrData as any).UP as MtrEta[] | undefined;
    const down = (mtrData as any).DOWN as MtrEta[] | undefined;
    return (up && up.length > 0) || (down && down.length > 0);
  }, [mtrData]);

  const filteredStations = useMemo(() => {
    const filtered = allStations.filter(s => 
      s.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name_ch.includes(searchQuery)
    );
    return [...filtered].sort((a, b) => {
      const aFav = favorites.some(f => f.endsWith(`-${a.code}`));
      const bFav = favorites.some(f => f.endsWith(`-${b.code}`));
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [allStations, searchQuery, favorites]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm relative z-30 shrink-0">
        <div className="flex-1 flex justify-start">
          <SecondaryMenu language={language} setLanguage={setLanguage} onShare={() => setShowShareModal(true)} t={t} />
        </div>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: selectedLine.color }}>
            <Train className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">{t.mtr_eta}</h1>
        </div>

        <div className="flex-1 flex justify-end gap-1">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="p-2 bg-neutral-100 rounded-full transition-colors" style={{ color: selectedLine.color }}>
              <Download className="w-5 h-5" />
            </button>
          )}
          <button onClick={findNearestStation} disabled={locating} className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50">
            <Navigation className={`w-5 h-5 text-neutral-600 ${locating ? 'animate-pulse' : ''}`} style={locating ? { color: selectedLine.color } : {}} />
          </button>
          <button onClick={(e) => toggleFavorite(e, selectedLine.code, selectedStation.code)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Star className={`w-5 h-5 ${favorites.includes(`${selectedLine.code}-${selectedStation.code}`) ? 'fill-current' : 'text-neutral-400'}`} style={favorites.includes(`${selectedLine.code}-${selectedStation.code}`) ? { color: selectedLine.color } : {}} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 touch-pan-y">
        <main className="max-w-md mx-auto p-4 space-y-4 w-full">
        <section className="sticky top-0 z-20 bg-neutral-50/90 backdrop-blur-md -mx-4 px-4 -mt-4 pt-4 pb-2 mb-2 shadow-sm border-b border-neutral-200 space-y-2 touch-pan-y">
          <button onClick={() => setShowStationList(true)} className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all group" style={{ borderColor: 'transparent' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full transition-colors" style={{ backgroundColor: `${selectedLine.color}15` }}>
                <MapPin className="w-5 h-5" style={{ color: selectedLine.color }} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">{t.current_station}</p>
                <h2 className="text-xl font-bold">
                  {language === 'zh' ? selectedStation.name_ch : selectedStation.name_en} 
                  <span className="text-neutral-400 font-medium text-base ml-1">
                    {language === 'zh' ? selectedStation.name_en : selectedStation.name_ch}
                  </span>
                </h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" style={{ color: selectedLine.color }} />
          </button>
          
          {selectedStation.lines.length > 1 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-1.5 flex gap-2 shadow-sm overflow-x-auto no-scrollbar">
              {selectedStation.lines.map(line => (
                <button
                  key={line.code}
                  onClick={() => setSelectedLine(line)}
                  className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${selectedLine.code === line.code ? 'text-white shadow-md' : 'hover:bg-neutral-50 text-neutral-600'}`}
                  style={selectedLine.code === line.code ? { backgroundColor: line.color } : {}}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: selectedLine.code === line.code ? 'white' : line.color }}></div>
                  <span className="text-xs font-bold whitespace-nowrap">{language === 'zh' ? line.name_ch : line.name_en}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedLine.color }}></div>
              <span className="text-xs font-bold text-neutral-500">
                {language === 'zh' ? selectedLine.name_ch : selectedLine.name_en} 
                {' '}
                {language === 'zh' ? selectedLine.name_en : selectedLine.name_ch}
              </span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"><Info className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">{error}</p></div>}
          {loading && !schedule && <div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div><p className="text-neutral-500 font-medium animate-pulse">{t.fetching}</p></div>}
          
          {mtrData && hasTrains ? (
            <>
              {['UP', 'DOWN'].map((dir) => {
                const trains = (mtrData as any)[dir] as MtrEta[];
                if (!trains || trains.length === 0) return null;
                return (
                  <div key={dir} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="text-white px-4 py-2 flex items-center justify-between" style={{ backgroundColor: selectedLine.color }}>
                      <span className="text-xs font-bold uppercase tracking-widest">{dir === 'UP' ? t.up_platform : t.down_platform}</span>
                      <div className="flex items-center gap-1 text-[10px] opacity-80"><Clock className="w-3 h-3" /><span>{t.updated} {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {trains.map((train, idx) => (
                        <motion.div key={`${train.time}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center text-white w-10 h-10 rounded-xl font-black text-sm shadow-sm" style={{ backgroundColor: selectedLine.color }}>P{train.plat}</div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">
                                {language === 'zh' ? stationNameMap[train.dest]?.ch : stationNameMap[train.dest]?.en || train.dest}
                              </h3>
                              <p className="text-neutral-400 text-[10px] font-bold uppercase">{new Date(train.time.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black tabular-nums" style={{ color: selectedLine.color }}>
                              {train.ttnt === '0' ? <span className="text-base">{t.arriving}</span> : <>{train.ttnt}<span className="text-xs font-bold ml-1 uppercase">{t.min}</span></>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : !loading && !error && (
            <div className="p-12 text-center space-y-4">
              <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <p className="text-neutral-500 font-bold text-lg">{t.no_trains}</p>
                <p className="text-neutral-400 text-sm">{t.service_ended}</p>
              </div>
              <button 
                onClick={() => fetchSchedule(selectedLine.code, selectedStation.code)}
                className="px-6 py-2 text-white rounded-xl font-bold transition-colors shadow-md"
                style={{ backgroundColor: selectedLine.color }}
              >
                {t.refresh}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>

      {/* Station Selection Modal */}
      <AnimatePresence>
        {showStationList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl">Select Station</h3>
                  <button onClick={findNearestStation} disabled={locating} className="p-1.5 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: `${selectedLine.color}15`, color: selectedLine.color }}>
                    <Navigation className={`w-4 h-4 ${locating ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                <button onClick={() => setShowStationList(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 rotate-90" /></button>
              </div>
              <div className="p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Search station..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-10 pr-4 transition-all outline-none font-medium focus:ring-2"
                    style={{ '--tw-ring-color': selectedLine.color } as any}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-1 gap-1">
                  {filteredStations.map((station) => (
                    <button 
                      key={station.code} 
                      onClick={() => { 
                        setSelectedStation(station); 
                        setSelectedLine(station.lines[0]);
                        setShowStationList(false); 
                        setSearchQuery('');
                      }} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedStation.code === station.code ? 'font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      style={selectedStation.code === station.code ? { backgroundColor: `${selectedLine.color}15`, color: selectedLine.color } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {station.lines.map(l => (
                            <div key={l.code} className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: l.color }}></div>
                          ))}
                        </div>
                        <div>
                          <span className="text-lg">{station.name_ch}</span>
                          <span className="ml-2 text-sm opacity-60 font-medium">{station.name_en}</span>
                        </div>
                      </div>
                      {selectedStation.code === station.code && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedLine.color }} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
