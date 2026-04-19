"use client"

import { MapPin, RefreshCw } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard";
import { useAeroStore } from "@/hooks/use-aero-store";
import { getAQICategory } from "@/lib/aqi-utils";
import { Button } from "./ui/button";

export function CurrentLocationCard() {
  const { userLocation, isLocationLoading, setUserLocation, setLocationLoading, currentReading, simulateNewReading } = useAeroStore();

  const handleRefresh = () => {
    setLocationLoading(true);
    // Refresh both location and simulate fresh local data
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude, city: "Current Coordinates" });
          simulateNewReading();
          setLocationLoading(false);
        },
        () => {
          simulateNewReading();
          setLocationLoading(false);
        }
      );
    }
  };

  const localAqi = currentReading?.aqi || 0;
  const cat = getAQICategory(localAqi);

  return (
    <LiquidGlassCard className="mb-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Live Tracking</h2>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-lg font-bold truncate max-w-[180px]">
              {isLocationLoading ? "Searching..." : userLocation?.city || "Detecting Location..."}
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

      <div className="flex items-end justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Local AQI Index</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tighter transition-colors duration-500 ${cat.text}`}>
              {localAqi || '--'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Level</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase mb-2 transition-colors duration-500 ${cat.color} text-black`}>
            {localAqi ? cat.label : 'Pending'}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            {currentReading ? `Last update: ${new Date(currentReading.timestamp).toLocaleTimeString()}` : 'Syncing...'}
          </p>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
