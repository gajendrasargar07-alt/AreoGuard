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
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ 
            lat: latitude, 
            lng: longitude, 
            city: "User's Device Location" 
          });

          // Create initial "Proper" reading
          const pm25 = 12 + Math.random() * 10;
          const no2 = 20 + Math.random() * 15;
          const o3 = 30 + Math.random() * 20;
          const co = 0.5 + Math.random() * 0.5;
          const so2 = 2 + Math.random() * 3;
          const initialAqi = calculateAQI(pm25, no2, o3, co, so2);

          const initialReading: SensorData = {
            id: 'initial-reading',
            name: 'Primary Node',
            lat: latitude,
            lng: longitude,
            aqi: initialAqi,
            pm25, no2, o3, co, so2,
            timestamp: new Date().toISOString(),
          };
          setCurrentReading(initialReading);

          // Initialize nearby sensors
          const initialSensors = Array.from({ length: 5 }).map((_, i) => {
            const spm25 = 10 + Math.random() * 40;
            const sno2 = 15 + Math.random() * 30;
            const so3 = 25 + Math.random() * 50;
            const sco = 0.3 + Math.random() * 2;
            const sso2 = 2 + Math.random() * 10;
            return {
              id: `init-${i}`,
              name: `AeroNode ${i + 101}`,
              lat: latitude + (Math.random() - 0.5) * 0.05,
              lng: longitude + (Math.random() - 0.5) * 0.05,
              pm25: spm25, no2: sno2, o3: so3, co: sco, so2: sso2,
              aqi: calculateAQI(spm25, sno2, so3, sco, sso2),
              timestamp: new Date().toISOString(),
            };
          });
          setSensors(initialSensors);
          setLocationLoading(false);
        },
        () => {
          // Fallback to Panvel for demo
          setUserLocation({ lat: 18.9894, lng: 73.1175, city: "Panvel, Navi Mumbai" });
          setLocationLoading(false);
        }
      );
    }
  }, [setUserLocation, setLocationLoading, setSensors, setCurrentReading]);

  return (
    <main className="relative w-screen h-screen overflow-hidden" suppressHydrationWarning>
      {/* Main Map Content */}
      <div className="absolute inset-0 z-0">
        <MapComponent />
      </div>

      {/* Liquid Glass Sidebar */}
      <DashboardSidebar />

      {/* High-res Detail overlays */}
      <div className="fixed top-6 right-6 z-[2000] flex gap-4 pointer-events-none">
        <div className="liquid-glass-dark px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sensor Protocol</span>
            <span className="text-xs font-bold text-primary">ELCH-REDOX v4.0</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Status</span>
            <span className={`text-xs font-bold text-secondary`}>LIVE DATA</span>
          </div>
        </div>
      </div>
    </main>
  );
}
