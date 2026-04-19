
"use client"

import { MapPin, RefreshCw } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { getAQICategory } from "@/lib/aqi-utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function CurrentLocationCard() {
  const { userLocation, isLocationLoading, setUserLocation, setLocationLoading, currentReading, fetchRealData } = useAeroStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          let cityName = "Locating...";
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || "Current Area";
          } catch (error) {
            cityName = "Verified Location";
          }

          setUserLocation({ lat: latitude, lng: longitude, city: cityName });
          await fetchRealData(latitude, longitude);
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        }
      );
    }
  };

  const localAqi = currentReading?.aqi || 0;
  const cat = getAQICategory(localAqi);

  const getFormattedTime = () => {
    if (!mounted || !currentReading) return 'Updating...';
    try {
      return new Date(currentReading.timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Live Now';
    }
  };

  return (
    <LiquidGlassCard className="mb-4" suppressHydrationWarning>
      <div className="flex justify-between items-start mb-6" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Live Tracking</h2>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-lg font-bold truncate max-w-[180px]">
              {isLocationLoading ? "Syncing Grid..." : userLocation?.city || "Detecting..."}
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className="rounded-full hover:bg-white/10"
          disabled={isLocationLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLocationLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex items-end justify-between bg-white/5 p-4 rounded-2xl border border-white/10" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Local AQI Index</p>
          <div className="flex items-baseline gap-2" suppressHydrationWarning>
            <span className={`text-5xl font-black tracking-tighter transition-colors duration-500 ${cat.text}`}>
              {localAqi || '--'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Level</span>
          </div>
        </div>
        <div className="text-right" suppressHydrationWarning>
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase mb-2 transition-colors duration-500 ${cat.color} text-black`}>
            {localAqi ? cat.label : 'Pending'}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            {getFormattedTime()}
          </p>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
