import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Train, Clock, MapPin, ChevronRight, Info, Star, Navigation, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LrtStation, LrtScheduleResponse, Language } from '../types';
import { LRT_STATIONS } from '../constants';
import { SecondaryMenu } from './SecondaryMenu';

interface LrtPageProps {
  deferredPrompt: any;
  handleInstallClick: () => void;
  showIOSInstructions: boolean;
  setShowIOSInstructions: (v: boolean) => void;
  setShowShareModal: (v: boolean) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: any;
}

export function LrtPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal, language, setLanguage, t }: LrtPageProps) {
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
    const filtered = LRT_STATIONS.filter(s => s.name_ch.includes(searchQuery) || s.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
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
