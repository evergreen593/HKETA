import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Train, Clock, MapPin, ChevronRight, Info, Star, Navigation, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MtrStation, MtrLine, MtrScheduleResponse, MtrEta, Language } from '../types';
import { MTR_LINES } from '../mtrConstants';
import { SecondaryMenu } from './SecondaryMenu';

interface MtrPageProps {
  deferredPrompt: any;
  handleInstallClick: () => void;
  showIOSInstructions: boolean;
  setShowIOSInstructions: (v: boolean) => void;
  setShowShareModal: (v: boolean) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: any;
}

export function MtrPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal, language, setLanguage, t }: MtrPageProps) {
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
                        <motion.div key={`${train.dest}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl font-black text-lg shadow-sm text-white" style={{ backgroundColor: selectedLine.color }}>
                              {train.ttnt === '0' ? '0' : train.ttnt}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{getDestName(train.dest)}</h3>
                              <p className="text-neutral-500 text-sm font-medium">{stationNameMap[train.dest]?.en || train.dest}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black tabular-nums" style={{ color: selectedLine.color }}>
                              {train.ttnt === '0' ? t.arriving : train.ttnt}
                              {train.ttnt !== '0' && <span className="text-xs font-bold ml-1 uppercase">{t.min}</span>}
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{train.time.split(' ')[1].substring(0, 5)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : schedule && !loading && (
            <div className="p-12 text-center space-y-4 bg-white border border-neutral-200 rounded-3xl">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-neutral-300" />
              </div>
              <div className="space-y-1">
                <p className="text-neutral-500 font-bold">{t.no_trains}</p>
                <p className="text-neutral-400 text-xs">{t.service_ended}</p>
              </div>
            </div>
          )}
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
                  <button onClick={findNearestStation} disabled={locating} className="p-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50" style={{ color: selectedLine.color }}><Navigation className={`w-4 h-4 ${locating ? 'animate-pulse' : ''}`} /></button>
                </div>
                <button onClick={() => setShowStationList(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 rotate-90" /></button>
              </div>
              <div className="p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input type="text" placeholder="Search station name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 transition-all outline-none font-medium" style={{ '--tw-ring-color': selectedLine.color } as any} autoFocus />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-1 gap-1">
                  {filteredStations.map((station) => (
                    <div 
                      key={station.code} 
                      onClick={() => { setSelectedStation(station); setSelectedLine(station.lines[0]); setShowStationList(false); setSearchQuery(''); }} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-all text-left cursor-pointer ${selectedStation.code === station.code ? 'bg-neutral-50 font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      style={selectedStation.code === station.code ? { color: selectedLine.color } : {}}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedStation(station); setSelectedLine(station.lines[0]); setShowStationList(false); setSearchQuery(''); } }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {station.lines.map(l => (
                            <div key={l.code} className="w-1.5 h-6 rounded-full" style={{ backgroundColor: l.color }}></div>
                          ))}
                        </div>
                        <div><span className="text-lg">{station.name_ch}</span><span className="ml-2 text-sm opacity-60 font-medium">{station.name_en}</span></div>
                      </div>
                      {selectedStation.code === station.code && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedLine.color }} />}
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
