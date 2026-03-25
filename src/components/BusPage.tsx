import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MapPin, ChevronRight, Clock, RefreshCw, Bus, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedBusRoute, UnifiedBusStop, UnifiedBusEta, Language } from '../types';
import { SecondaryMenu } from './SecondaryMenu';

interface BusPageProps {
  deferredPrompt: any;
  handleInstallClick: () => void;
  showIOSInstructions: boolean;
  setShowIOSInstructions: (v: boolean) => void;
  setShowShareModal: (v: boolean) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: any;
}

export function BusPage({ deferredPrompt, handleInstallClick, showIOSInstructions, setShowIOSInstructions, setShowShareModal, language, setLanguage, t }: BusPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState<UnifiedBusRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<UnifiedBusRoute | null>(null);
  const [stops, setStops] = useState<UnifiedBusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<UnifiedBusStop | null>(null);
  const [etaList, setEtaList] = useState<UnifiedBusEta[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStops, setLoadingStops] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRouteList, setShowRouteList] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const [kmbRes, ctbRes, nlbRes, mtrRes] = await Promise.all([
        fetch('https://data.etabus.gov.hk/v1/transport/kmb/route/').then(r => r.json()),
        fetch('https://rt.data.gov.hk/v2/transport/citybus/route/ctb').then(r => r.json()),
        fetch('https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list').then(r => r.json()),
        Promise.resolve({ data: ['K51', 'K52', 'K53', 'K54', 'K58', 'K65', 'K66', 'K68', 'K73', 'K74', 'K75', 'K75A', 'K75P', 'K76', '506'] })
      ]);

      const kmbRoutes: UnifiedBusRoute[] = kmbRes.data.map((r: any) => ({
        id: `${r.route}-${r.bound}-${r.service_type}`,
        routeNo: r.route,
        orig: { en: r.orig_en, zh: r.orig_tc },
        dest: { en: r.dest_en, zh: r.dest_tc },
        company: 'KMB',
        bound: r.bound,
        serviceType: r.service_type
      }));

      const ctbRoutes: UnifiedBusRoute[] = ctbRes.data.map((r: any) => ({
        id: `${r.route}-${r.dir}`,
        routeNo: r.route,
        orig: { en: r.orig_en, zh: r.orig_tc },
        dest: { en: r.dest_en, zh: r.dest_tc },
        company: 'CTB',
        bound: r.dir
      }));

      const nlbRoutes: UnifiedBusRoute[] = nlbRes.routes.map((r: any) => ({
        id: r.routeId,
        routeNo: r.routeNo,
        orig: { en: r.origEn, zh: r.origTc },
        dest: { en: r.destEn, zh: r.destTc },
        company: 'NLB'
      }));

      const mtrRoutes: UnifiedBusRoute[] = mtrRes.data.map((r: string) => ({
        id: r,
        routeNo: r,
        orig: { en: 'MTR Bus', zh: '港鐵巴士' },
        dest: { en: 'MTR Bus', zh: '港鐵巴士' },
        company: 'MTR'
      }));

      setRoutes([...kmbRoutes, ...ctbRoutes, ...nlbRoutes, ...mtrRoutes]);
    } catch (err) {
      console.error(err);
      setError("Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStops = useCallback(async (route: UnifiedBusRoute) => {
    setLoadingStops(true);
    try {
      let stopsData: UnifiedBusStop[] = [];
      if (route.company === 'KMB') {
        const res = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route.routeNo}/${route.bound}/${route.serviceType}`).then(r => r.json());
        const stopDetails = await Promise.all(res.data.map((s: any) => 
          fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${s.stop}`).then(r => r.json())
        ));
        stopsData = stopDetails.map((d: any, i: number) => ({
          id: d.data.stop,
          name: { en: d.data.name_en, zh: d.data.name_tc },
          lat: parseFloat(d.data.lat),
          lng: parseFloat(d.data.long),
          seq: i + 1
        }));
      } else if (route.company === 'CTB') {
        const res = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/route-stop/ctb/${route.routeNo}/${route.bound}`).then(r => r.json());
        const stopDetails = await Promise.all(res.data.map((s: any) => 
          fetch(`https://rt.data.gov.hk/v2/transport/citybus/stop/${s.stop}`).then(r => r.json())
        ));
        stopsData = stopDetails.map((d: any, i: number) => ({
          id: d.data.stop,
          name: { en: d.data.name_en, zh: d.data.name_tc },
          lat: parseFloat(d.data.lat),
          lng: parseFloat(d.data.long),
          seq: i + 1
        }));
      } else if (route.company === 'NLB') {
        const res = await fetch(`https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId=${route.id}`).then(r => r.json());
        stopsData = res.stops.map((s: any, i: number) => ({
          id: s.stopId,
          name: { en: s.stopNameEn, zh: s.stopNameTc },
          lat: parseFloat(s.latitude),
          lng: parseFloat(s.longitude),
          seq: i + 1
        }));
      } else if (route.company === 'MTR') {
        const res = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule`, {
          method: 'POST',
          body: JSON.stringify({ routeName: route.routeNo, language: language === 'zh' ? 'zh' : 'en' })
        }).then(r => r.json());
        // MTR Bus API structure is different, we'll simplify
        stopsData = res.busStop.map((s: any, i: number) => ({
          id: s.busStopId,
          name: { en: s.busStopNameEn, zh: s.busStopNameTc },
          lat: 0, lng: 0, // MTR Bus API doesn't provide coords in this endpoint
          seq: i + 1
        }));
      }
      setStops(stopsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load stops");
    } finally {
      setLoadingStops(false);
    }
  }, [language]);

  const fetchEta = useCallback(async (route: UnifiedBusRoute, stop: UnifiedBusStop) => {
    try {
      let etas: UnifiedBusEta[] = [];
      if (route.company === 'KMB') {
        const res = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stop.id}/${route.routeNo}/${route.serviceType}`).then(r => r.json());
        etas = res.data.filter((e: any) => e.dir === route.bound).map((e: any) => ({
          time: e.eta,
          dest: { en: e.dest_en, zh: e.dest_tc },
          remark: { en: e.rmk_en, zh: e.rmk_tc }
        }));
      } else if (route.company === 'CTB') {
        const res = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/eta/ctb/${stop.id}/${route.routeNo}`).then(r => r.json());
        etas = res.data.filter((e: any) => e.dir === route.bound).map((e: any) => ({
          time: e.eta,
          dest: { en: e.dest_en, zh: e.dest_tc },
          remark: { en: e.rmk_en, zh: e.rmk_tc }
        }));
      } else if (route.company === 'NLB') {
        const res = await fetch(`https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrival&routeId=${route.id}&stopId=${stop.id}`).then(r => r.json());
        etas = res.estimatedArrivals.map((e: any) => ({
          time: e.estimatedArrivalTime,
          dest: { en: '', zh: '' }, // NLB doesn't provide dest in ETA
          remark: { en: e.remarkEn, zh: e.remarkTc }
        }));
      } else if (route.company === 'MTR') {
        const res = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule`, {
          method: 'POST',
          body: JSON.stringify({ routeName: route.routeNo, language: language === 'zh' ? 'zh' : 'en' })
        }).then(r => r.json());
        const stopInfo = res.busStop.find((s: any) => s.busStopId === stop.id);
        if (stopInfo && stopInfo.busArrivalDateTime) {
          etas = [{
            time: stopInfo.busArrivalDateTime,
            dest: { en: '', zh: '' },
            remark: { en: '', zh: '' }
          }];
        }
      }
      setEtaList(etas);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }
  }, [language]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    let interval: any;
    if (selectedRoute && selectedStop) {
      fetchEta(selectedRoute, selectedStop);
      interval = setInterval(() => fetchEta(selectedRoute, selectedStop), 30000);
    }
    return () => clearInterval(interval);
  }, [selectedRoute, selectedStop, fetchEta]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes.slice(0, 50);
    return routes.filter(r => 
      r.routeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orig.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orig.zh.includes(searchQuery) ||
      r.dest.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dest.zh.includes(searchQuery)
    ).slice(0, 50);
  }, [routes, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm relative z-30 shrink-0">
        <div className="flex-1 flex justify-start">
          <SecondaryMenu language={language} setLanguage={setLanguage} onShare={() => setShowShareModal(true)} t={t} />
        </div>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">{t.bus_eta}</h1>
        </div>

        <div className="flex-1 flex justify-end gap-1">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => {
              if (selectedRoute && selectedStop) fetchEta(selectedRoute, selectedStop);
            }}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-neutral-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Route Selection */}
        <button 
          onClick={() => setShowRouteList(true)}
          className="w-full bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-emerald-500 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Search className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{t.select_route}</p>
              <p className="text-lg font-black text-neutral-900">
                {selectedRoute ? `${selectedRoute.routeNo} (${language === 'zh' ? selectedRoute.dest.zh : selectedRoute.dest.en})` : t.search_route}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-neutral-300" />
        </button>

        {/* Stop Selection */}
        {selectedRoute && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">{t.select_stop}</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {loadingStops ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-32 h-20 bg-neutral-100 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : (
                stops.map((stop) => (
                  <button 
                    key={stop.id}
                    onClick={() => setSelectedStop(stop)}
                    className={`shrink-0 w-40 p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-24 ${selectedStop?.id === stop.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-neutral-200 text-neutral-700 hover:border-emerald-500'}`}
                  >
                    <span className="text-[10px] font-bold opacity-60 uppercase">Stop {stop.seq}</span>
                    <span className="text-sm font-bold line-clamp-2 leading-tight">{language === 'zh' ? stop.name.zh : stop.name.en}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ETA Display */}
        {selectedStop && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{t.bus_eta}</h2>
              {lastUpdated && (
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  {t.updated} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>

            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              {etaList.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-neutral-300" />
                  </div>
                  <p className="text-neutral-400 font-bold">{t.no_bus}</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {etaList.map((eta, idx) => {
                    const etaTime = new Date(eta.time);
                    const now = new Date();
                    const diff = Math.floor((etaTime.getTime() - now.getTime()) / 60000);
                    
                    return (
                      <div key={idx} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl">
                            {diff <= 0 ? '0' : diff}
                          </div>
                          <div>
                            <p className="font-black text-neutral-900 text-lg leading-tight">
                              {diff <= 0 ? t.arriving : `${diff} ${t.min}`}
                            </p>
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-tighter mt-0.5">
                              {etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {eta.remark.zh && ` • ${language === 'zh' ? eta.remark.zh : eta.remark.en}`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-200" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Route List Modal */}
      <AnimatePresence>
        {showRouteList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-xl">{t.select_route}</h3>
                <button onClick={() => setShowRouteList(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 rotate-90" /></button>
              </div>
              <div className="p-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder={t.search_route} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-10 pr-4 transition-all outline-none font-medium focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {loading && routes.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-400 font-medium">{t.fetching}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {filteredRoutes.map((route) => (
                      <button 
                        key={route.id} 
                        onClick={() => { 
                          setSelectedRoute(route); 
                          setShowRouteList(false); 
                          setSearchQuery('');
                          fetchStops(route);
                        }} 
                        className={`flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedRoute?.id === route.id ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${route.company === 'KMB' ? 'bg-red-600 text-white' : route.company === 'CTB' ? 'bg-yellow-400 text-blue-900' : 'bg-emerald-600 text-white'}`}>
                            {route.routeNo}
                          </div>
                          <div>
                            <p className="text-lg leading-tight">{language === 'zh' ? `${route.orig.zh} → ${route.dest.zh}` : `${route.orig.en} → ${route.dest.en}`}</p>
                            <p className="text-xs opacity-60 font-bold uppercase tracking-tighter mt-1">{route.company}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
