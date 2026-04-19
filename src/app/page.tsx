
"use client"

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAeroStore, type SensorData } from '@/hooks/use-aero-store';
import { calculateAQI } from '@/lib/aqi-utils';

// Dynamic import for Leaflet (SSR Safety)
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0B1010]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary text-sm font-bold tracking-widest uppercase">Initializing Heatmap...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { setUserLocation, setLocationLoading, setSensors, setCurrentReading } = useAeroStore();

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

          // Create initial reading
          const pm25 = 15 + Math.random() * 20;
          const no2 = 30 + Math.random() * 20;
          const o3 = 40 + Math.random() * 30;
          const co = 0.8 + Math.random() * 0.4;
          const so2 = 4 + Math.random() * 5;
          const initialAqi = calculateAQI(pm25, no2, o3, co, so2);

          const initialReading: SensorData = {
            id: 'initial-reading',
            name: 'Local Node',
            lat: latitude,
            lng: longitude,
            aqi: initialAqi,
            pm25, no2, o3, co, so2,
            timestamp: new Date().toISOString(),
          };
          setCurrentReading(initialReading);

          // Initialize diverse regional sensors
          const initialSensors = Array.from({ length: 8 }).map((_, i) => {
            const spm25 = 20 + Math.random() * 60;
            const sno2 = 30 + Math.random() * 50;
            const so3 = 40 + Math.random() * 60;
            const sco = 1.0 + Math.random() * 2.5;
            const sso2 = 5 + Math.random() * 15;
            return {
              id: `init-${i}`,
              name: `Regional AeroNode ${i + 1}`,
              lat: latitude + (Math.random() - 0.5) * 0.08,
              lng: longitude + (Math.random() - 0.5) * 0.08,
              pm25: spm25, no2: sno2, o3: so3, co: sco, so2: sso2,
              aqi: calculateAQI(spm25, sno2, so3, sco, sso2),
              timestamp: new Date().toISOString(),
            };
          });
          setSensors(initialSensors);
          setLocationLoading(false);
        },
        () => {
          // Fallback to Mumbai (Gateway of India)
          const fallbackLat = 18.9220;
          const fallbackLng = 72.8347;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng, city: "Mumbai (Colaba)" });
          
          const mumbaiRegions = [
            { name: "Bandra West", lat: 19.0596, lng: 72.8295 },
            { name: "Andheri East", lat: 19.1136, lng: 72.8697 },
            { name: "Worli Sea Face", lat: 19.0149, lng: 72.8147 },
            { name: "Powai Lake Region", lat: 19.1176, lng: 72.9060 },
            { name: "Dharavi Sector", lat: 19.0390, lng: 72.8510 },
            { name: "Borivali National Park", lat: 19.2307, lng: 72.8567 },
            { name: "Thane Industrial Belt", lat: 19.2183, lng: 72.9781 }
          ];

          const initialSensors = mumbaiRegions.map((region, i) => {
            const spm25 = 40 + Math.random() * 80;
            const sno2 = 50 + Math.random() * 60;
            const so3 = 30 + Math.random() * 50;
            const sco = 2.0 + Math.random() * 3.0;
            const sso2 = 10 + Math.random() * 20;
            return {
              id: `mumbai-${i}`,
              name: region.name,
              lat: region.lat,
              lng: region.lng,
              pm25: spm25, no2: sno2, o3: so3, co: sco, so2: sso2,
              aqi: calculateAQI(spm25, sno2, so3, sco, sso2),
              timestamp: new Date().toISOString(),
            };
          });

          setSensors(initialSensors);
          setLocationLoading(false);
        }
      );
    }
  }, [setUserLocation, setLocationLoading, setSensors, setCurrentReading]);

  return (
    <main className="relative w-screen h-screen overflow-hidden" suppressHydrationWarning>
      {/* Main Map Content - Background */}
      <div className="absolute inset-0 z-0">
        <MapComponent />
      </div>

      {/* Liquid Glass Sidebar - Floating Overlay */}
      <DashboardSidebar />

      {/* High-res Detail overlays */}
      <div className="fixed top-6 right-6 z-[2000] flex gap-4 pointer-events-none">
        <div className="liquid-glass-dark px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol</span>
            <span className="text-xs font-black text-primary">AEROGUARD v4.2</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Atmosphere</span>
            <span className={`text-xs font-black text-secondary uppercase animate-pulse`}>Real-Time</span>
          </div>
        </div>
      </div>
    </main>
  );
}
