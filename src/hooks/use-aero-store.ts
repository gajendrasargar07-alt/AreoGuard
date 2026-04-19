
"use client"

import { create } from 'zustand';
import { calculateAQI } from '@/lib/aqi-utils';

export type UserType = 'normal' | 'patient';

export interface SensorData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  timestamp: string;
}

interface AeroState {
  userLocation: { lat: number; lng: number; city: string } | null;
  userType: UserType;
  sensors: SensorData[];
  currentReading: SensorData | null;
  selectedSensor: SensorData | null;
  isLocationLoading: boolean;
  waqiToken: string;
  
  setUserLocation: (loc: { lat: number; lng: number; city: string }) => void;
  setUserType: (type: UserType) => void;
  setSensors: (sensors: SensorData[]) => void;
  setCurrentReading: (reading: SensorData | null) => void;
  setSelectedSensor: (sensor: SensorData | null) => void;
  setLocationLoading: (loading: boolean) => void;
  fetchRealData: (lat: number, lng: number) => Promise<void>;
  simulateNewReading: () => void;
}

export const useAeroStore = create<AeroState>((set, get) => ({
  userLocation: null,
  userType: 'normal',
  sensors: [],
  currentReading: null,
  selectedSensor: null,
  isLocationLoading: false,
  waqiToken: 'demo', // Use 'demo' for testing, replace with real token for production

  setUserLocation: (userLocation) => set({ userLocation }),
  setUserType: (userType) => set({ userType }),
  setSensors: (sensors) => set({ sensors }),
  setCurrentReading: (currentReading) => set({ currentReading }),
  setSelectedSensor: (selectedSensor) => set({ selectedSensor }),
  setLocationLoading: (isLocationLoading) => set({ isLocationLoading }),

  fetchRealData: async (lat, lng) => {
    const token = get().waqiToken;
    try {
      // 1. Fetch hyper-local station details for the "Current Reading"
      const detailRes = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`);
      const detailData = await detailRes.json();

      if (detailData.status === 'ok') {
        const iaqi = detailData.data.iaqi;
        const current: SensorData = {
          id: `waqi-${detailData.data.idx}`,
          name: detailData.data.city.name,
          lat: detailData.data.city.geo[0],
          lng: detailData.data.city.geo[1],
          aqi: detailData.data.aqi,
          pm25: iaqi.pm25?.v || 0,
          no2: iaqi.no2?.v || 0,
          o3: iaqi.o3?.v || 0,
          co: iaqi.co?.v || 0,
          so2: iaqi.so2?.v || 0,
          timestamp: detailData.data.time.iso,
        };
        set({ currentReading: current });
      }

      // 2. Fetch all stations in a bounding box for the "Choropleth Grid"
      const spread = 0.5; // ~50km radius
      const bounds = `${lat - spread},${lng - spread},${lat + spread},${lng + spread}`;
      const mapRes = await fetch(`https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${token}`);
      const mapData = await mapRes.json();

      if (mapData.status === 'ok') {
        const sensors: SensorData[] = mapData.data.map((station: any) => ({
          id: `station-${station.uid}`,
          name: station.station.name,
          lat: station.lat,
          lng: station.lon,
          aqi: parseInt(station.aqi) || 0,
          pm25: 0, no2: 0, o3: 0, co: 0, so2: 0, // Summary API only provides AQI
          timestamp: station.station.time,
        }));
        set({ sensors });
      }
    } catch (error) {
      console.error("Failed to fetch WAQI data:", error);
    }
  },

  simulateNewReading: () => {
    // Keep simulation for UI interaction fallback
    set((state) => {
      if (!state.userLocation) return state;
      const genData = () => {
        const pm25 = 5 + Math.random() * 45;
        const no2 = 10 + Math.random() * 60;
        const o3 = 20 + Math.random() * 80;
        const co = 0.1 + Math.random() * 3;
        const so2 = 1 + Math.random() * 15;
        return { pm25, no2, o3, co, so2, aqi: calculateAQI(pm25, no2, o3, co, so2) };
      };

      const localData = genData();
      const currentReading: SensorData = {
        id: `local-${Date.now()}`,
        name: "Virtual Node Override",
        lat: state.userLocation.lat,
        lng: state.userLocation.lng,
        ...localData,
        timestamp: new Date().toISOString(),
      };

      return { currentReading };
    });
  },
}));
