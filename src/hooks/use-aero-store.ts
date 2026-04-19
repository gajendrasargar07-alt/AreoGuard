
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
    
    try {
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

      const spread = 0.5; 
      const bounds = `${lat - spread},${lng - spread},${lat + spread},${lng + spread}`;
      const mapRes = await fetch(`https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${token}`);
      const mapData = await mapRes.json();

      if (mapData.status === 'ok' && mapData.data.length > 0) {
        const sensors: SensorData[] = mapData.data.map((station: any) => ({
          id: `station-${station.uid}`,
          name: station.station.name,
          lat: station.lat,
          lng: station.lon,
          aqi: parseInt(station.aqi) || 0,
          pm25: 0, no2: 0, o3: 0, co: 0, so2: 0,
          timestamp: station.station.time,
        })).filter((s: SensorData) => s.aqi > 0);
        
        const currentReading = get().currentReading;
        if (currentReading) {
          sensors.push(currentReading);
        }

        set({ sensors });
      } else {
        const mumbaiNodes = [
          { name: "Colaba Station", lat: 18.9067, lng: 72.8147, aqi: 45 },
          { name: "Worli Node", lat: 19.0176, lng: 72.8177, aqi: 62 },
          { name: "Dadar Grid", lat: 19.0178, lng: 72.8478, aqi: 98 },
          { name: "Bandra West", lat: 19.0596, lng: 72.8295, aqi: 68 },
          { name: "Andheri Hub", lat: 19.1136, lng: 72.8697, aqi: 152 },
          { name: "Juhu Beach", lat: 19.1075, lng: 72.8263, aqi: 55 },
          { name: "Powai Lake", lat: 19.1176, lng: 72.9060, aqi: 92 },
          { name: "Chembur Ind. (Red Zone)", lat: 19.0622, lng: 72.8974, aqi: 245 },
          { name: "Borivali East", lat: 19.2307, lng: 72.8567, aqi: 38 },
          { name: "Goregaon Node", lat: 19.1633, lng: 72.8500, aqi: 118 }
        ];

        const sensors: SensorData[] = mumbaiNodes.map((n, i) => ({
          id: `mock-node-${i}`,
          name: n.name,
          lat: n.lat,
          lng: n.lng,
          aqi: n.aqi,
          pm25: n.aqi > 200 ? 180 : 20, 
          no2: n.aqi > 200 ? 90 : 15, 
          o3: 40, co: 1.2, so2: 5,
          timestamp: new Date().toISOString()
        }));
        set({ sensors });
      }
    } catch (error) {
      console.error("Failed to fetch WAQI data:", error);
    }
  },

  simulateNewReading: () => {
    set((state) => {
      if (!state.userLocation) return state;
      
      const isRedZone = Math.random() > 0.5;
      const pm25 = isRedZone ? 180 + Math.random() * 100 : 15 + Math.random() * 80;
      const no2 = isRedZone ? 90 + Math.random() * 50 : 20 + Math.random() * 60;
      const o3 = 30 + Math.random() * 100;
      const co = 1.0 + Math.random() * 5.0;
      const so2 = 5 + Math.random() * 25;
      
      const aqi = calculateAQI(pm25, no2, o3, co, so2);
      
      const simulatedNode: SensorData = {
        id: `sim-${Date.now()}`,
        name: isRedZone ? "Localized High-Pollution Redox Node" : "Local Atmospheric Node",
        lat: state.userLocation.lat,
        lng: state.userLocation.lng,
        pm25, no2, o3, co, so2,
        aqi,
        timestamp: new Date().toISOString(),
      };

      const updatedSensors = [simulatedNode, ...state.sensors.filter(s => s.id !== simulatedNode.id)];

      return { 
        currentReading: simulatedNode,
        sensors: updatedSensors
      };
    });
  },
}));
