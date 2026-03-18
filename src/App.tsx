/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, Train, Clock, MapPin, ChevronRight, Info, Star, Navigation, Download, LayoutGrid, Map as MapIcon, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LRT_STATIONS } from './constants';
import { MTR_LINES } from './mtrConstants';
import { LrtScheduleResponse, LrtStation, LrtPlatform, MtrLine, MtrStation, MtrScheduleResponse, MtrEta } from './types';

type Tab = 'lrt' | 'mtr';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('mtr_lrt_app_tab');
      return (savedTab === 'lrt' || savedTab === 'mtr') ? savedTab : 'lrt';
    }
    return 'lrt';
  });

  useEffect(() => {
    localStorage.setItem('mtr_lrt_app_tab', activeTab);
  }, [activeTab]);

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-24 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {activeTab === 'lrt' ? (
          <LrtPage 
            key="lrt" 
            deferredPrompt={deferredPrompt} 
            handleInstallClick={handleInstallClick}
            showIOSInstructions={showIOSInstructions}
            setShowIOSInstructions={setShowIOSInstructions}
            setShowShareModal={setShowShareModal}
          />
        ) : (
          <MtrPage 
            key="mtr" 
            deferredPrompt={deferredPrompt} 
            handleInstallClick={handleInstallClick}
            showIOSInstructions={showIOSInstructions}
            setShowIOSInstructions={setShowIOSInstructions}
            setShowShareModal={setShowShareModal}
          />
        )}
      </AnimatePresence>

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
                <h3 className="text-2xl font-black tracking-tight">Share App</h3>
                <p className="text-neutral-500 text-sm font-medium">Scan this QR code to open on your phone</p>
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
                    alert("Link copied to clipboard!");
                  }}
                  className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
                >
                  Copy Link
                </button>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-neutral-200 px-6 py-3 pb-8 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)] will-change-transform [transform:translateZ(0)] [backface-visibility:hidden]">
        <button 
          onClick={() => setActiveTab('lrt')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${activeTab === 'lrt' ? 'text-orange-500' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'lrt' ? 'bg-orange-100' : 'bg-transparent'}`}>
            <Train className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Light Rail</span>
        </button>
        <button 
          onClick={() => setActiveTab('mtr')}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${activeTab === 'mtr' ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'mtr' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <LayoutGrid className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">MTR</span>
        </button>
      </nav>
    </div>
  );
}

function LrtPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal }: any) {
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

  const findNearestStation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
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
      },
      () => {
        setError('Unable to retrieve your location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('lrt_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lrt_last_station', selectedStation.id.toString());
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
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ willChange: "transform, opacity" }}
      className="flex flex-col"
    >
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Train className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">LRT ETA</h1>
        </div>
        <div className="flex items-center gap-2">
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
          <button onClick={() => fetchSchedule(selectedStation.id)} disabled={loading} className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-neutral-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

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
                  <h3 className="font-bold">Install on iOS</h3>
                  <p className="text-xs opacity-90 leading-relaxed">Tap the <span className="font-bold">Share</span> button below and select <span className="font-bold">"Add to Home Screen"</span>.</p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <button onClick={() => setShowStationList(true)} className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-orange-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full group-hover:bg-orange-200 transition-colors"><MapPin className="w-5 h-5 text-orange-600" /></div>
              <div className="text-left">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Current Station</p>
                <h2 className="text-xl font-bold">{selectedStation.name_ch} <span className="text-neutral-400 font-medium text-base ml-1">{selectedStation.name_en}</span></h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-orange-500 transition-colors" />
          </button>
        </section>

        <section className="space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"><Info className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">{error}</p></div>}
          {loading && !schedule && <div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div><p className="text-neutral-500 font-medium animate-pulse">Fetching latest times...</p></div>}
          {schedule && schedule.platform_list.map((platform) => (
            <div key={platform.platform_id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-neutral-900 text-white px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">Platform {platform.platform_id}</span>
                <div className="flex items-center gap-1 text-[10px] opacity-60"><Clock className="w-3 h-3" /><span>UPDATED {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
              </div>
              <div className="divide-y divide-neutral-100">
                {platform.route_list.length > 0 ? platform.route_list.map((route, idx) => (
                  <motion.div key={`${route.route_no}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-orange-500 text-white w-12 h-12 rounded-xl font-black text-lg shadow-sm">{route.route_no}</div>
                      <div><h3 className="font-bold text-lg leading-tight">{route.dest_ch}</h3><p className="text-neutral-500 text-sm font-medium">{route.dest_en}</p></div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-orange-600 tabular-nums">{route.time_en.includes('min') ? <>{route.time_en.split(' ')[0]}<span className="text-xs font-bold ml-1 uppercase">min</span></> : <span className="text-base">{route.time_ch}</span>}</div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{route.train_length === 2 ? 'Double Car' : 'Single Car'}</p>
                    </div>
                  </motion.div>
                )) : <div className="p-8 text-center text-neutral-400 italic">No upcoming trains scheduled</div>}
              </div>
            </div>
          ))}
        </section>
      </main>

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
                    <button key={station.id} onClick={() => { setSelectedStation(station); setShowStationList(false); setSearchQuery(''); }} className={`flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedStation.id === station.id ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => toggleFavorite(e, station.id)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><Star className={`w-4 h-4 ${favorites.includes(station.id) ? 'text-orange-500 fill-orange-500' : 'text-neutral-300'}`} /></button>
                        <div><span className="text-lg">{station.name_ch}</span><span className="ml-2 text-sm opacity-60 font-medium">{station.name_en}</span></div>
                      </div>
                      {selectedStation.id === station.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MtrPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal }: any) {
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

  const findNearestStation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
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
      },
      () => {
        setError('Unable to retrieve your location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ willChange: "transform, opacity" }}
      className="flex flex-col"
    >
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">MTR ETA</h1>
        </div>
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          )}
          <button onClick={findNearestStation} disabled={locating} className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50">
            <Navigation className={`w-5 h-5 text-neutral-600 ${locating ? 'animate-pulse text-blue-600' : ''}`} />
          </button>
          <button onClick={(e) => toggleFavorite(e, selectedLine.code, selectedStation.code)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Star className={`w-5 h-5 ${favorites.includes(`${selectedLine.code}-${selectedStation.code}`) ? 'text-blue-600 fill-blue-600' : 'text-neutral-400'}`} />
          </button>
          <button onClick={() => fetchSchedule(selectedLine.code, selectedStation.code)} disabled={loading} className="p-2 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-neutral-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 w-full">
        <section className="space-y-3">
          <button onClick={() => setShowStationList(true)} className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Station</p>
                <h2 className="font-bold text-lg">{selectedStation.name_ch} <span className="text-neutral-400 font-medium text-sm ml-1">{selectedStation.name_en}</span></h2>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-blue-500 transition-colors" />
          </button>

          {selectedStation.lines.length > 1 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-1 flex gap-1 shadow-sm overflow-x-auto no-scrollbar">
              {selectedStation.lines.map(line => (
                <button
                  key={line.code}
                  onClick={() => setSelectedLine(line)}
                  className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${selectedLine.code === line.code ? 'bg-neutral-900 text-white shadow-md' : 'hover:bg-neutral-50 text-neutral-600'}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: line.color }}></div>
                  <span className="text-xs font-bold whitespace-nowrap">{line.name_ch}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedLine.color }}></div>
              <span className="text-xs font-bold text-neutral-500">{selectedLine.name_ch} {selectedLine.name_en}</span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"><Info className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">{error}</p></div>}
          {loading && !schedule && <div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div><p className="text-neutral-500 font-medium animate-pulse">Fetching latest times...</p></div>}
          
          {mtrData && (
            <>
              {['UP', 'DOWN'].map((dir) => {
                const trains = (mtrData as any)[dir] as MtrEta[];
                if (!trains || trains.length === 0) return null;
                return (
                  <div key={dir} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-neutral-900 text-white px-4 py-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest">{dir === 'UP' ? 'Up' : 'Down'} Platform</span>
                      <div className="flex items-center gap-1 text-[10px] opacity-60"><Clock className="w-3 h-3" /><span>UPDATED {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {trains.map((train, idx) => (
                        <motion.div key={`${train.time}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center bg-blue-600 text-white w-10 h-10 rounded-xl font-black text-sm shadow-sm">P{train.plat}</div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{getDestName(train.dest)}</h3>
                              <p className="text-neutral-400 text-[10px] font-bold uppercase">{new Date(train.time.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-blue-600 tabular-nums">
                              {train.ttnt === '0' ? <span className="text-base">Arriving</span> : <>{train.ttnt}<span className="text-xs font-bold ml-1 uppercase">min</span></>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {!loading && !mtrData && !error && <div className="p-12 text-center text-neutral-400 italic">No train information available for this station</div>}
        </section>
      </main>

      {/* Station Selection Modal */}
      <AnimatePresence>
        {showStationList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl">Select Station</h3>
                  <button onClick={findNearestStation} disabled={locating} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
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
                    className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
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
                      className={`flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedStation.code === station.code ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}
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
                      {selectedStation.code === station.code && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
