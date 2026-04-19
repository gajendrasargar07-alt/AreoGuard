
"use client"

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useAeroStore, type SensorData } from '@/hooks/use-aero-store';
import { calculateAQI } from '@/lib/aqi-utils';

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

          // Create localized sensor clusters for better choropleth interpolation
          const initialSensors = Array.from({ length: 15 }).map((_, i) => {
            const spm25 = 10 + Math.random() * 80;
            const sno2 = 20 + Math.random() * 70;
            const so3 = 30 + Math.random() * 70;
            const sco = 0.5 + Math.random() * 3.5;
            const sso2 = 2 + Math.random() * 20;
            return {
              id: `node-${i}`,
              name: `AeroNode ${i + 1}`,
              lat: latitude + (Math.random() - 0.5) * 0.15,
              lng: longitude + (Math.random() - 0.5) * 0.15,
              pm25: spm25, no2: sno2, o3: so3, co: sco, so2: sso2,
              aqi: calculateAQI(spm25, sno2, so3, sco, sso2),
              timestamp: new Date().toISOString(),
            };
          });

          const currentReading = initialSensors[0];
          setCurrentReading(currentReading);
          setSensors(initialSensors);
          setLocationLoading(false);
        },
        () => {
          const fallbackLat = 19.0760;
          const fallbackLng = 72.8777;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng, city: "Mumbai" });
          
          // Precise Mumbai Regional Clusters for Choropleth
          const mumbaiRegions = [
            { name: "South Mumbai (Colaba)", lat: 18.9220, lng: 72.8347 },
            { name: "Worli/Lower Parel", lat: 19.0149, lng: 72.8147 },
            { name: "Bandra/Khar Cluster", lat: 19.0596, lng: 72.8295 },
            { name: "Andheri/Vile Parle", lat: 19.1136, lng: 72.8697 },
            { name: "Powai/Saki Naka", lat: 19.1176, lng: 72.9060 },
            { name: "Dharavi/Sion", lat: 19.0390, lng: 72.8510 },
            { name: "Goregaon/Malad", lat: 19.1634, lng: 72.8412 },
            { name: "Borivali/Gorai", lat: 19.2307, lng: 72.8567 },
            { name: "Chembur/Ghatkopar", lat: 19.0522, lng: 72.8995 },
            { name: "Thane/Mulund Border", lat: 19.2183, lng: 72.9781 }
          ];

          const initialSensors = mumbaiRegions.map((region, i) => {
            const spm25 = 30 + Math.random() * 90;
            const sno2 = 40 + Math.random() * 70;
            const so3 = 20 + Math.random() * 60;
            const sco = 1.5 + Math.random() * 4.0;
            const sso2 = 8 + Math.random() * 25;
            return {
              id: `mumbai-node-${i}`,
              name: region.name,
              lat: region.lat,
              lng: region.lng,
              pm25: spm25, no2: sno2, o3: so3, co: sco, so2: sso2,
              aqi: calculateAQI(spm25, sno2, so3, sco, sso2),
              timestamp: new Date().toISOString(),
            };
          });

          setCurrentReading(initialSensors[0]);
          setSensors(initialSensors);
          setLocationLoading(false);
        }
      );
    }
  }, [setUserLocation, setLocationLoading, setSensors, setCurrentReading]);

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
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grid Shading</span>
            <span className={`text-xs font-black text-secondary uppercase animate-pulse`}>Choropleth</span>
          </div>
        </div>
      </div>
    </main>
  );
}
