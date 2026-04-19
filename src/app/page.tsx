
"use client"

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAeroStore } from '@/hooks/use-aero-store';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0B1010]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary text-sm font-bold tracking-widest uppercase">Initializing Atmospheric Grid...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { setUserLocation, setLocationLoading, fetchRealData } = useAeroStore();

  useEffect(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          let cityName = "Fetching location...";
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || "Current Area";
          } catch (error) {
            cityName = "Detected Location";
          }

          setUserLocation({ 
            lat: latitude, 
            lng: longitude, 
            city: cityName 
          });

          // Fetch REAL data from WAQI API
          await fetchRealData(latitude, longitude);
          setLocationLoading(false);
        },
        async () => {
          // Fallback to Mumbai if geolocation fails
          const fallbackLat = 19.0760;
          const fallbackLng = 72.8777;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng, city: "Mumbai" });
          await fetchRealData(fallbackLat, fallbackLng);
          setLocationLoading(false);
        }
      );
    }
  }, [setUserLocation, setLocationLoading, fetchRealData]);

  return (
    <main className="relative w-screen h-screen overflow-hidden" suppressHydrationWarning>
      <div className="absolute inset-0 z-0">
        <MapComponent />
      </div>

      <DashboardSidebar />

      <div className="fixed top-6 right-6 z-[2000] flex gap-4 pointer-events-none">
        <div className="liquid-glass-dark px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol</span>
            <span className="text-xs font-black text-primary">AEROGUARD v4.5</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grid Source</span>
            <span className={`text-xs font-black text-secondary uppercase animate-pulse`}>WAQI Real-Time</span>
          </div>
        </div>
      </div>
    </main>
  );
}
