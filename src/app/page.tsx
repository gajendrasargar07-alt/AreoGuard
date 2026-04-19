
"use client"

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAeroStore } from '@/hooks/use-aero-store';

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
  const { setUserLocation, setLocationLoading, simulateNewReading, setSensors } = useAeroStore();

  useEffect(() => {
    // 1. Initial Geolocation fetch
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
          setLocationLoading(false);
          
          // 2. Initialize with some mock sensors nearby
          const initialSensors = Array.from({ length: 5 }).map((_, i) => ({
            id: `init-${i}`,
            name: `AeroNode ${i + 101}`,
            lat: latitude + (Math.random() - 0.5) * 0.05,
            lng: longitude + (Math.random() - 0.5) * 0.05,
            aqi: Math.floor(Math.random() * 150) + 30,
            pm25: 12.5 + Math.random() * 20,
            no2: 15.2 + Math.random() * 10,
            o3: 40 + Math.random() * 30,
            co: 0.5 + Math.random() * 2,
            so2: 2 + Math.random() * 5,
            timestamp: new Date().toISOString(),
          }));
          setSensors(initialSensors);
        },
        () => {
          // Fallback to Panvel for demo
          setUserLocation({ lat: 18.9894, lng: 73.1175, city: "Panvel, Navi Mumbai" });
          setLocationLoading(false);
        }
      );
    }
  }, [setUserLocation, setLocationLoading, setSensors]);

  return (
    <main className="relative w-screen h-screen overflow-hidden" suppressHydrationWarning>
      {/* Main Map Content - Now absolute to fill entire screen */}
      <div className="absolute inset-0 z-0">
        <MapComponent />
      </div>

      {/* Liquid Glass Sidebar - Overlays the map */}
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
            <span className="text-xs font-bold text-secondary">DECENTRALIZED</span>
          </div>
        </div>
      </div>
    </main>
  );
}
