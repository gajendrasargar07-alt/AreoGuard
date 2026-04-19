
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
  waqiToken: 'demo', 

  setUserLocation: (userLocation) => set({ userLocation }),
  setUserType: (userType) => set({ userType }),
  setSensors: (sensors) => set({ sensors }),
  setCurrentReading: (currentReading) => set({ currentReading }),
  setSelectedSensor: (selectedSensor) => set({ selectedSensor }),
  setLocationLoading: (isLocationLoading) => set({ isLocationLoading }),

  fetchRealData: async (lat, lng) => {
    const token = get().waqiToken;
    const { simulateNewReading } = get();
    
    try {
      // 1. Fetch hyper-local station details
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
      } else {
        simulateNewReading();
      }

      // 2. Fetch bounding box for shading
      const spread = 0.5; 
      const bounds = `${lat - spread},${lng - spread},${lat + spread},${lng + spread}`;
      const mapRes = await fetch(`https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${token}`);
      const mapData = await mapRes.json();

      if (mapData.status === 'ok' && mapData.data.length > 3) {
        const sensors: SensorData[] = mapData.data.map((station: any) => ({
          id: `station-${station.uid}`,
          name: station.station.name,
          lat: station.lat,
          lng: station.lon,
          aqi: parseInt(station.aqi) || 0,
          pm25: 0, no2: 0, o3: 0, co: 0, so2: 0,
          timestamp: station.station.time,
        }));
        set({ sensors });
      } else {
        // HIGH-FIDELITY MUMBAI FALLBACK: Specific regions for College Viva
        const mumbaiNodes = [
          { name: "Colaba (South Mumbai)", lat: 18.9067, lng: 72.8147, aqi: 42 },
          { name: "Worli (Sea Face)", lat: 19.0176, lng: 72.8177, aqi: 58 },
          { name: "Dadar (Central)", lat: 19.0178, lng: 72.8478, aqi: 95 },
          { name: "Bandra West", lat: 19.0596, lng: 72.8295, aqi: 65 },
          { name: "Andheri East (Industrial)", lat: 19.1136, lng: 72.8697, aqi: 145 },
          { name: "Juhu Beach", lat: 19.1075, lng: 72.8263, aqi: 52 },
          { name: "Powai Lake", lat: 19.1176, lng: 72.9060, aqi: 88 },
          { name: "Chembur (Oil/Gas Hub)", lat: 19.0622, lng: 72.8974, aqi: 185 },
          { name: "Borivali National Park", lat: 19.2307, lng: 72.8567, aqi: 35 },
          { name: "Goregaon East", lat: 19.1633, lng: 72.8500, aqi: 112 }
        ];

        const sensors: SensorData[] = mumbaiNodes.map((n, i) => ({
          id: `mumbai-node-${i}`,
          name: n.name,
          lat: n.lat,
          lng: n.lng,
          aqi: n.aqi,
          pm25: 0, no2: 0, o3: 0, co: 0, so2: 0,
          timestamp: new Date().toISOString()
        }));
        set({ sensors });
      }
    } catch (error) {
      console.error("Failed to fetch WAQI data:", error);
      simulateNewReading();
    }
  },

  simulateNewReading: () => {
    set((state) => {
      if (!state.userLocation) return state;
      const pm25 = 5 + Math.random() * 45;
      const no2 = 10 + Math.random() * 60;
      const o3 = 20 + Math.random() * 80;
      const co = 0.1 + Math.random() * 3;
      const so2 = 1 + Math.random() * 15;
      
      const currentReading: SensorData = {
        id: `local-${Date.now()}`,
        name: "Simulated Local Sensor",
        lat: state.userLocation.lat,
        lng: state.userLocation.lng,
        pm25, no2, o3, co, so2,
        aqi: calculateAQI(pm25, no2, o3, co, so2),
        timestamp: new Date().toISOString(),
      };

      return { currentReading };
    });
  },
}));
